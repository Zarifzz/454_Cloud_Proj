import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "us-west-1" });
const BUCKET_NAME = process.env.TESTS_BUCKET;

export const handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));




  const claims = event.requestContext.authorizer?.jwt?.claims || {};
  let groups = claims["cognito:groups"] || [];

  if (typeof groups === "string") {
    // Some Cognito setups send "[Admin]" or "Admin"
    groups = groups.replace(/[\[\]]/g, "").split(",");
  }

  const allowed = ["Teachers", "Admin"];
  const isAuthorized = groups.some((g) => allowed.includes(g.trim()));

  if (!isAuthorized) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "Access denied: Only Teachers or Admins can publish tests."
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

  const { testId, metadata } = body;

  if (!testId || !metadata) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "testId and metadata are required"
      })
    };
  }

 
  const requiredFields = ["published", "durationMinutes", "availableFrom", "availableTo"];
  const missing = requiredFields.filter((f) => !(f in metadata));

  if (missing.length > 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Missing metadata fields: ${missing.join(", ")}`
      })
    };
  }





  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `tests/${testId}/metadata.json`,
        Body: JSON.stringify(metadata, null, 2),
        ContentType: "application/json"
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Test published successfully",
        testId,
        metadata
      })
    };

  } catch (error) {
    console.error("PublishTest ERROR:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to publish test",
        error: error.message
      })
    };
  }
};
