// backend.js
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
      console.error("Backend error:", err.response?.data || err);
      return { error: "Failed to create user" };
    }
  }
};
