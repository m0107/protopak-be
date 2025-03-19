const axios = require("axios");
const PACDORA_BASE_URL = "https://apidemo.pacdora.com";

async function getCategories() {
  try {
    const response = await axios.get(PACDORA_BASE_URL + "/ctree");
    return response.data;
  } catch (error) {
    console.error("Error fetching external API data:", error.message);
    throw error;
  }
}

module.exports = {
  getCategories,
};
