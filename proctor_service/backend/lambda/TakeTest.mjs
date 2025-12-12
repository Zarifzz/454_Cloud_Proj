import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { readableStreamToString } from "./utils.mjs"; // helper

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
        message: "Access denied: Only Admins or Students can take tests."
      })
    };
  }





  const testId = event.queryStringParameters?.testId;
  if (!testId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "testId query parameter is required"
      })
    };
  }

  try {

    const testResp = await s3.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `tests/${testId}/test.json`
      })
    );

    const testBodyStr = await readableStreamToString(testResp.Body);
    const testJson = JSON.parse(testBodyStr);


    let metadataJson;
    try {
      const metaResp = await s3.send(
        new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `tests/${testId}/metadata.json`
        })
      );

      const metaBodyStr = await readableStreamToString(metaResp.Body);
      metadataJson = JSON.parse(metaBodyStr);

    } catch (_) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "This test is not published yet."
        })
      };
    }


    if (!metadataJson.published) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "This test has not been published."
        })
      };
    }


    const now = Date.now();

    const availableFrom = Date.parse(metadataJson.availableFrom);
    const availableTo = Date.parse(metadataJson.availableTo);

    
    if (isNaN(availableFrom) || isNaN(availableTo)) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Invalid metadata timestamps (availableFrom/availableTo)."
        })
      };
    }



    
    if (availableFrom >= availableTo) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Metadata time window is invalid: availableFrom >= availableTo."
        })
      };
    }
    
    if (now < availableFrom) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "This test is not yet available.",
          availableFrom: metadataJson.availableFrom
        })
      };
    }
    
    if (now > availableTo) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "This test is no longer available.",
          availableTo: metadataJson.availableTo
        })
      };
    }







    return {
      statusCode: 200,
      body: JSON.stringify({
        testId,
        test: testJson,
        metadata: metadataJson
      })
    };

  } catch (error) {
    console.error("TakeTest ERROR:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to fetch test",
        error: error.message
      })
    };
  }
};
