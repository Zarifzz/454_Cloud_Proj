import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "us-west-1" });
const BUCKET_NAME = process.env.TESTS_BUCKET;

export const handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));




  const claims = event.requestContext.authorizer?.jwt?.claims || {};
  let groups = claims["cognito:groups"] || [];

  if (typeof groups === "string") {
    groups = groups.replace(/[\[\]]/g, "").split(",");
  }

  const allowed = ["Admin", "Students"];
  const isAuthorized = groups.some((g) => allowed.includes(g.trim()));

  if (!isAuthorized) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "Access denied: Only Admins or Students can submit tests."
      })
    };
  }




  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON body" })
    };
  }

  const { testId, answers } = body;

  if (!testId || !answers) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "testId and answers are required"
      })
    };
  }

  const studentId = claims["sub"];
  if (!studentId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Cannot determine student ID from JWT" })
    };
  }




  const submission = {
    studentId,
    answers,
    submittedAt: new Date().toISOString(),
    score: null 
  };




  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `tests/${testId}/submissions/${studentId}.json`,
        Body: JSON.stringify(submission, null, 2),
        ContentType: "application/json"
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Test submitted successfully",
        testId,
        studentId
      })
    };

  } catch (error) {
    console.error("SubmitTest ERROR:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to submit test",
        error: error.message
      })
    };
  }
};
