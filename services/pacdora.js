const axios = require("axios");
// const pandoraData = require("../data/protopak.json");
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

async function getProductsList(categoryKey) {
  try {
    const response = await axios.get(PACDORA_BASE_URL + `/models?current=1&pageSize=50&mockupNameKey=${categoryKey}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching external API data:", error.message);
    throw error;
  }
}

module.exports = {
  getCategories,
  getProductsList
};
