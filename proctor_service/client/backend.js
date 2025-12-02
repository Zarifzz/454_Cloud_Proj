const axios = require("axios");
const config = require("./client_config.json");

module.exports = {
  createUser: async (event, { email, role }) => {
    try {
      const jwt = config.CURR_TOKEN;
      const response = await axios.post(
        config.API_URLS.AssignRole,
        { email, role },
        { headers: { Authorization: jwt } }
      );
      return response.data;
    } catch (err) {
      console.error(err.response?.data || err);
      return { error: "Failed to create user" };
    }
  },

  uploadTest: async (event, payload) => {
    try {
      const jwt = config.CURR_TOKEN;
      const response = await axios.post(
        config.API_URLS.UploadTest,
        payload,
        { headers: { Authorization: jwt } }
      );
      return response.data;
    } catch (err) {
      console.error(err.response?.data || err);
      return { error: "Failed to upload test" };
    }
  },

  publishTest: async (event, { testId, metadata }) => {
    try {
      const jwt = config.CURR_TOKEN;

      const response = await axios.post(
        config.API_URLS.PublishTest,
        { testId, metadata },   // ← send metadata
        { headers: { Authorization: jwt } }
      );

      return response.data;
    } catch (err) {
      console.error(err.response?.data || err);
      return { error: "Failed to publish test" };
    }
  },


  listTests: async () => {
    try {
      const jwt = config.CURR_TOKEN;
      const response = await axios.get(config.API_URLS.ListTest, {
        headers: { Authorization: jwt }
      });
      return response.data;
    } catch (err) {
      console.error(err.response?.data || err);
      return { error: "Failed to list tests" };
    }
  },

  getSubmissionsForTest: async (event, { testId }) => {
    try {
      const jwt = config.CURR_TOKEN;

      const response = await axios.get(
        config.API_URLS.GetSubmissionsForTest + `?testId=${testId}`,
        { headers: { Authorization: jwt } }
      );

      return response.data;
    } catch (err) {
      console.error(err.response?.data || err);
      return { error: "Failed to fetch submissions" };
    }
  }
};
