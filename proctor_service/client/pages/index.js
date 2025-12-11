
const { ipcRenderer } = require("electron");

const jwt = require("jsonwebtoken");

const fs = require("fs");
const path = require("path");

const config = require('./../client_config.json');


function getCurrentToken() {
  const configPath = path.join(__dirname, "../client_config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  return config.CURR_TOKEN;

}

function getRoleFromToken(token) {
  try{

    const decode = jwt.decode(token);
    let currRole = decode?.["cognito:groups"]?.[0] || null;
    console.log(currRole);

    return currRole;


  } catch (error) {
    return null;
  }
}




document.getElementById("goAdmin").addEventListener("click", () => {
  if (["Admin"].includes(getRoleFromToken(getCurrentToken()))){
    ipcRenderer.send("navigate-admin");
  }
  else{
    document.getElementById("authzOutput").innerHTML = "Unauthorized Access";
  }
  
});

document.getElementById("goTeacher").addEventListener("click", () => {
  if (["Admin", "Teacher"].includes(getRoleFromToken(getCurrentToken()))){
    ipcRenderer.send("navigate-teacher");
  }
  else{
    document.getElementById("authzOutput").innerHTML = "Unauthorized Access";
  }
});

document.getElementById("goStudent").addEventListener("click", () => {
  if (["Admin", "Student"].includes(getRoleFromToken(getCurrentToken()))){
    ipcRenderer.send("navigate-student");
  }
  else{
    document.getElementById("authzOutput").innerHTML = "Unauthorized Access";
  }
});



//Logout
document.getElementById("logout").addEventListener("click", () => {

  ipcRenderer.send("save-token");
  config.CURR_TOKEN = "";

  ipcRenderer.send("navigate-login");

});