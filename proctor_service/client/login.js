const {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails
} = require('amazon-cognito-identity-js');

const config = require('./client_config.json');




const poolData = {
  UserPoolId: config.POOL_DATA.USER_POOL_ID, // your pool id
  ClientId: config.POOL_DATA.CLIENT_ID // your client id
};

const userPool = new CognitoUserPool(poolData);

function loginUser(email, password, newPassword = null) {
  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  const user = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        const token = result.getIdToken().getJwtToken();
        console.log("Login successful! JWT Token:", token);
        resolve(token);
      },

      onFailure: (err) => {
        console.error("Login failed:", err);
        reject(err);
      },

      // handle "Force change password" challenge
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        console.log("New password required. Updating now...");

        // remove non-editable attributes
        delete userAttributes.email_verified;
        delete userAttributes.phone_number_verified;

        user.completeNewPasswordChallenge(newPassword, userAttributes, {
          onSuccess: (result) => {
            console.log("Password changed successfully!");
            const token = result.getIdToken().getJwtToken();
            resolve(token);
          },
          onFailure: (err) => {
            console.error("Failed to change password:", err);
            reject(err);
          }
        });
      }

    });
  });
}

// example usage:
loginUser(config.ADMIN.ADMIN_USER, config.ADMIN.ADMIN_PASSWORD)
  .then((token) => console.log("Token:", token))
  .catch(console.error);
