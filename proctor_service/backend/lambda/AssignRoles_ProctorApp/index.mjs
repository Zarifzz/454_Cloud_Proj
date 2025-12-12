import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand
} from "@aws-sdk/client-cognito-identity-provider";



const client = new CognitoIdentityProviderClient({ region: "us-west-1" });

const USER_POOL_ID = "us-west-1_IZWgPidur"; 

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
    
    await client.send(
      new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "email_verified", Value: "true" }
        ]
        
      })
    );

    

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
