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

  const allowed = ["Admin", "Students"];
  const isAuthorized = groups.some((g) => allowed.includes(g.trim()));

  if (!isAuthorized) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "Access denied: Only Admins or Students can list available tests."
      })
    };
  }


  try {
    const listResp = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: "tests/",
        Delimiter: "/"
      })
    );

    const prefixes = listResp.CommonPrefixes || [];
    const testIds = prefixes.map((p) => p.Prefix.replace("tests/", "").replace("/", "")).filter((x) => x.length > 0);

   


    const results = [];

    for (const id of testIds) {
      let metadata = null;
      let title = null;
      let description = null;

      
      try {
        const metaResp = await s3.send(
          new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `tests/${id}/metadata.json`
          })
        );
        const bodyStr = await readableStreamToString(metaResp.Body);
        metadata = JSON.parse(bodyStr);
      } catch (err) {
        metadata = null;
      }

     
      if (!metadata?.published) {
        continue;
      }

     
      try {
        const testResp = await s3.send(
          new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `tests/${id}/test.json`
          })
        );
        const testStr = await readableStreamToString(testResp.Body);
        const testJson = JSON.parse(testStr);

        title = testJson.title || null;
        description = testJson.description || null;
      } catch (err) {
        title = null;
        description = null;
      }

      results.push({
        testId: id,
        metadata,
        title,
        description
      });
    }


    return {
      statusCode: 200,
      body: JSON.stringify({
        tests: results
      })
    };

  } catch (error) {
    console.error("ListAvailableTests ERROR:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to list available tests",
        error: error.message
      })
    };
  }
};
