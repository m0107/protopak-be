const fs = require("fs");
// const path = require("path");
const axios = require("axios");
const logger = require("../utils/logger");

/** Write File to Disk from URL
 * @param  {String} url - source url
 * @param  {String} file_path - target file path
 * @returns {Promise} fileType - returns a string of the file's type, to later delete file
 */
const writeFileFromUrl = async (url, file_path) => {
  try {
    const response = await axios({ url, responseType: "stream" });
    let fileType = response?.headers?.["content-type"];
    if (fileType) {
      const types = fileType.split("/");
      if (types[1]) fileType = types[1];
    }
    await new Promise((res, rej) => {
      response.data
        .pipe(fs.createWriteStream(`${file_path}.${fileType}`))
        .on("finish", () => res())
        .on("error", (e) => rej(e));
    });
    return fileType;
  } catch (err) {
    logger.error("Error while writing file from URL", { message: err.message });
    // throw err;
  }
};

const deleteFileIfExists = async (path) => {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
  return;
};

module.exports = {
  writeFileFromUrl,
  deleteFileIfExists,
};
