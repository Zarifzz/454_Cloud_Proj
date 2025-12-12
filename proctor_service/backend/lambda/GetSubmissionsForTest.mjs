import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { readableStreamToString } from "./utils.mjs";

const s3 = new S3Client({ region: "us-west-1" });
const BUCKET_NAME = process.env.TESTS_BUCKET;

export const handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  


  const claims = event.requestContext.authorizer?.jwt?.claims || {};
  let groups = claims["cognito:groups"] || [];

  if (typeof groups === "string") {
    groups = groups.replace(/[\[\]]/g, "").split(",");
  }

  const allowed = ["Teachers", "Admin"];
  const isAuthorized = groups.some((g) => allowed.includes(g.trim()));

  if (!isAuthorized) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "Access denied: Only Teachers or Admins can view all submissions."
      })
    };
  }




  const testId = event.queryStringParameters?.testId;

  if (!testId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing required testId"
      })
    };
  }




  const prefix = `tests/${testId}/submissions/`;

  let listed;
  try {
    listed = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix
      })
    );
  } catch (error) {
    console.error("List submissions ERROR:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to list submissions",
        error: error.message
      })
    };
  }

  const submissionFiles = listed.Contents || [];

 


  const submissions = [];

  for (const file of submissionFiles) {
    if (!file.Key.endsWith(".json")) continue;

    try {
      const res = await s3.send(
        new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: file.Key
        })
      );

      const jsonStr = await readableStreamToString(res.Body);
      submissions.push(JSON.parse(jsonStr));

    } catch (error) {
      console.error("Error reading submission file:", file.Key, error);
     
    }
  }

 

 
  return {
    statusCode: 200,
    body: JSON.stringify({
      testId,
      count: submissions.length,
      submissions
    })
  };
};
