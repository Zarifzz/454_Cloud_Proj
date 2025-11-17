import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({ region: "us-west-1" });

const USER_POOL_ID = "us-west-1_IZWgPidur"; // your pool ID

export const handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  // Get claims from JWT authorizer
  const claims = event.requestContext.authorizer?.jwt?.claims || {};
  const groups = claims["cognito:groups"] || [];

  // Enforce ADMIN ONLY
  if (!groups.includes("Admin")) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "Access denied: Admins only." })
    };
  }

  // Parse body
  const body = JSON.parse(event.body || "{}");
  const { email, role } = body;

  if (!email || !role) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "email and role are required"
      })
    };
  }

  try {
    // 1. Create user (Cognito sends welcome/reset email)
    // 1Create the user (default behavior)
    await client.send(
      new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "email_verified", Value: "true" }
        ]
        // MessageAction: "RESEND" <-- REMOVE this for new users
      })
    );

    // 2 Add to group
    await client.send(
      new AdminAddUserToGroupCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        GroupName: role
      })
    );


    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User created and added to group",
        email,
        role
      })
    };

  } catch (error) {
    console.error("ERROR:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to create user",
        error: error.message
      })
    };
  }
};
