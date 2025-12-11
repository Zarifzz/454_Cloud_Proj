const axios = require("axios");
const config = require("./client_config.json");

const fs = require("fs");
const path = require("path");



function loadConfig() {
  const configPath = path.join(__dirname, "client_config.json");
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}


//Calls Lambdas

module.exports = {

  createUser: async (event, { email, role }) => {
    try {
      const { CURR_TOKEN, API_URLS } = loadConfig();

      const response = await axios.post(
        API_URLS.AssignRole,
        { email, role },
        { headers: { Authorization: CURR_TOKEN } }
      );

      return response.data;

    } catch (err) {

      console.error(err.response?.data || err);
      return { error: "Failed to create user" };

    }
  },


  // Teacher

  uploadTest: async (event, payload) => {
    try {
      const { CURR_TOKEN, API_URLS } = loadConfig();

      const response = await axios.post(
        API_URLS.UploadTest,
        payload,
        { headers: { Authorization: CURR_TOKEN } }
      );

      return response.data;

    } catch (err) {

      console.error(err.response?.data || err);
      return { error: "Failed to upload test" };
    }

  },

  publishTest: async (event, { testId, metadata }) => {
    try {
      const { CURR_TOKEN, API_URLS } = loadConfig();

      const response = await axios.post(
        API_URLS.PublishTest,
        { testId, metadata }, 
        { headers: { Authorization: CURR_TOKEN } }
      );

      return response.data;

    } catch (err) {

      console.error(err.response?.data || err);
      return { error: "Failed to publish test" };
    }

  },


  listTests: async () => {
    try {
      const { CURR_TOKEN, API_URLS } = loadConfig();

      const response = await axios.get(
        API_URLS.ListTest,
        {headers: { Authorization: CURR_TOKEN } }
      );

      return response.data;

    } catch (err) {

      console.error(err.response?.data || err);
      return { error: "Failed to list tests" };
    }

  },

  getSubmissionsForTest: async (event, { testId }) => {
    try {
      const { CURR_TOKEN, API_URLS } = loadConfig();

      const response = await axios.get(
        API_URLS.GetSubmissionsForTest + `?testId=${testId}`,
        { headers: { Authorization: CURR_TOKEN } }
      );

      return response.data;

    } catch (err) {

      console.error(err.response?.data || err);
      return { error: "Failed to fetch submissions" };
    }
  },

  // Student

    listAvailableTests: async () => {
    try {
      const { CURR_TOKEN, API_URLS } = loadConfig();

      const response = await axios.get(
        API_URLS.ListAvailableTest, {
        headers: { Authorization: CURR_TOKEN } }
      );

      return response.data;

    } catch (err) {

      console.error(err.response?.data || err);
      return { error: "Failed to list available tests" };
    }
  },

  takeTest: async (event, { testId }) => {
    try {
      const { CURR_TOKEN, API_URLS } = loadConfig();

      const response = await axios.get(
        API_URLS.TakeTest + `?testId=${testId}`,
        {headers: { Authorization: CURR_TOKEN } }
      );

      return response.data;

    } catch (err) {

      console.error(err.response?.data || err);
      return { error: "Failed to load test" };
    }
  },

  getSubmissionStatus: async (event, { testId }) => {
    try {
      const { CURR_TOKEN, API_URLS } = loadConfig();

      const response = await axios.post(
        API_URLS.GetSubmissionStatus,
        { testId },
        { headers: { Authorization: CURR_TOKEN } }
      );

      return response.data;

    } catch (err) {

      console.error(err.response?.data || err);
      return { error: "Failed to check submission status" };
    }
  }, 

  submitTest: async (event, { testId, answers }) => {
    try {
      const { CURR_TOKEN, API_URLS } = loadConfig();

      const response = await axios.post(
        API_URLS.SubmitTest,
        { testId, answers },
        { headers: { Authorization: CURR_TOKEN } }
      );

      return response.data;

    } catch (err) {

      console.error(err.response?.data || err);
      return { error: "Failed to submit test" };
    }
  }

};
