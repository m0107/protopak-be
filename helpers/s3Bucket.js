require("dotenv").config();
const AWS = require("aws-sdk");
const logger = require("../utils/logger");

const BUCKET_NAME = process.env.BUCKET_NAME;
// const ID = process.env.AWS_S3_BUCKET_KEY;
// const SECRET = process.env.AWS_S3_BUCKET_SECRET;
const REGION = process.env.AWS_S3_BUCKET_REGION;

const BUCKET_FOLDERS = {
  CUSTOMER: "customer",
  DEPOSIT: "deposit",
  WITHDRAW: "withdraw",
  POPULAR_GAMES: "popular_games",
  BANNER: "banner",
  BOT: "bot"
};
const foldersList = Object.values(BUCKET_FOLDERS);

/**
 * @param  {String} file - file to upload
 * @param  {String} key - uuid which'll be stored as key in bucket
 * @param  {String} fileType - file type help in generating presigned url to view file in browser
 * @param  {('customer'|'platforms'|'deposit'|'withdraw'|'popular_games'|'banner')} parentFolder - folder name in which this document will be stored
 */
const uploadFileToS3Bucket = async (file, key, fileType, parentFolder) => {
  try {
    if (!file || !key || !fileType) throw "Required paramter not found";
    if (!foldersList.includes(parentFolder)) throw `Folder: ${parentFolder} is not handled`;

    AWS.config.update({ region: REGION });
    const s3 = new AWS.S3();

    // if (parentFolder === ){

    // }

    if (parentFolder) key = `${parentFolder}/${key}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: fileType,
    };

    const data = await s3.upload(params).promise();
    return data;
  } catch (err) {
    console.log({ file, key, fileType });
    logger.error("Error uploading file to s3 bucket", err);
    throw err;
  }
};

const getFileUrl = async (key) => {
  try {
    AWS.config.update({ region: REGION });
    const s3Bucket = new AWS.S3();
    const url = await s3Bucket.getSignedUrlPromise("getObject", {
      Key: key,
      Bucket: BUCKET_NAME,
      Expires: parseInt(process.env.S3_FILE_URL_EXPIRATION_TIME),
    });
    logger.info("s3 URL", { url, REGION, key, BUCKET_NAME });
    return url;
  } catch (error) {
    logger.error(`Error getting file url for key: ${key}`, { error });
    throw error;
  }
};

/** Delete file from s3 bucket
 * @param  {String} key - uuid which'll be stored as key in bucket
 * @param  {('customer'|'platforms'|'deposit'|'withdraw'|'popular_games'|'banner')} parentFolder - folder name in which this document will be stored
 */
const deleteFileFromBucket = async (key, parentFolder) => {
  try {
    if (parentFolder) key = `${parentFolder}/${key}`;
    // AWS.config.update({
    //   accessKeyId: ID,
    //   secretAccessKey: SECRET,
    // });
    const params = { Bucket: BUCKET_NAME, Key: key };
    const s3Bucket = new AWS.S3({
      region: REGION,
      params,
    });
    const url = await s3Bucket.deleteObject().promise();
    return url;
  } catch (error) {
    logger.error(`Error getting file url for key: ${key}`, error);
    throw error;
  }
};

module.exports = {
  uploadFileToS3Bucket,
  getFileUrl,
  BUCKET_FOLDERS,
  deleteFileFromBucket,
};
