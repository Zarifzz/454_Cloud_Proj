const { ipcRenderer } = require("electron");

const {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails
} = require('amazon-cognito-identity-js');

const config = require('./../client_config.json');



const poolData = {
  UserPoolId: config.POOL_DATA.USER_POOL_ID, 
  ClientId: config.POOL_DATA.CLIENT_ID 
};


document.getElementById("newPassBtn").addEventListener("click", () => {
  const input = document.getElementById("newPasswordInput");
  const btn = document.getElementById("newPassBtn");

  const isHidden = input.classList.toggle("hidden");
});



document.getElementById("LoginBtn").addEventListener("click", async () => {
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();

  const newPasswordInput = document.getElementById("newPasswordInput");
  const newPassword = newPasswordInput.value.trim();

  let result;

 
  if (!newPasswordInput.classList.contains("hidden") && newPassword.length > 0) {
    result = await loginUser(email, password, newPassword);
  } else {
    result = await loginUser(email, password);
  }

  if (!result) {
    document.getElementById("loginOutput").innerText = "Error with loginuser";
    return;
  }

  const output = document.getElementById("loginOutput");

  if (result.error) {
    output.innerText = `Error: ${result.error}`;
  } else {

    output.innerText = `${result.message}\n`;

    if (result.token){
      ipcRenderer.send("save-token", result.token);
      config.CURR_TOKEN = result.token;

      ipcRenderer.send("navigate-index");
    }
  

  }
  
});



async function loginUser(email, password, newPassword = null) {

  const userPool = new CognitoUserPool(poolData);


  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  const user = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  return new Promise((resolve) => {
    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
  
        const token = result.getIdToken().getJwtToken();

        resolve({
          message: "Login success",
          error: null,
          token, 
        });

      },
      onFailure: (err) => {

        resolve({
          message: "Login fail",
          error: err.message,
        });

      },

      newPasswordRequired: (userAttributes) => {
       
        delete userAttributes.email_verified;
        delete userAttributes.phone_number_verified;

        if (!newPassword) {

          resolve({
            message: null,
            error: "New password needed",
          });

          return;
        }

        user.completeNewPasswordChallenge(newPassword, userAttributes, {
          onSuccess: (result) => {

            const token = result.getIdToken().getJwtToken();

            resolve({
              message: "Password change success",
              error: null,
              token,
            });

          },
          onFailure: (err) => {

            resolve({
              message: null,
              error: err.message,
            });
          },


        });
      },




    });

  });

}
