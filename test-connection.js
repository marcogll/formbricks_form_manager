const axios = require("axios");
require("dotenv").config();

const url = `${process.env.FORMBRICKS_SDK_URL}/api/v1/management/surveys`;
console.log(`Testing connection to: ${url}`);

axios
  .get(url, {
    headers: {
      "x-api-key": process.env.FORMBRICKS_API_KEY,
    },
    timeout: 15000,
  })
  .then((response) => {
    console.log("Success!");
    console.log("Status:", response.status);
    console.log(
      "Data length:",
      Array.isArray(response.data?.data)
        ? response.data.data.length
        : "Not an array"
    );
  })
  .catch((error) => {
    console.error("Error:", error.message);
    if (error.code) console.error("Code:", error.code);
    if (error.response) {
      console.error("Response Status:", error.response.status);
    }
  });
