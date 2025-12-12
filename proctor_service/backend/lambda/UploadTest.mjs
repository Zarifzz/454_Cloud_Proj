import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "us-west-1" });
const BUCKET_NAME = process.env.TESTS_BUCKET;

export const handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));





const claims = event.requestContext.authorizer?.jwt?.claims || {};
const groups = claims["cognito:groups"] || [];



if (!groups.includes("Admin")) {
  return {
    statusCode: 403,
    body: JSON.stringify({ message: "Access denied: Admins only." })
  };
}







  let body;

  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON body" })
    };
  }

  const { testId, testJson, answersJson } = body;

  if (!testId || !testJson || !answersJson) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "testId, testJson, and answersJson are required"
      })
    };
  }





  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `tests/${testId}/test.json`,
      Body: JSON.stringify(testJson, null, 2),
      ContentType: "application/json"
    }));

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `tests/${testId}/answers.json`,
      Body: JSON.stringify(answersJson, null, 2),
      ContentType: "application/json"
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Test uploaded successfully",
        testId
      })
    };

  } catch (error) {
    console.error("UploadTest ERROR:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to upload test",
        error: error.message
      })
    };
  }
};
