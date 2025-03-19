const fs = require("fs");
const AWS = require("aws-sdk");

const s3BucketFileUpload = async (fileName, fileType) => {
  const BUCKET_NAME = "office-automation-bucket";
  const ID = process.env.AWS_S3_BUCKET_KEY;
  const SECRET = process.env.AWS_S3_BUCKET_SECRET;
  const REGION = process.env.AWS_S3_BUCKET_REGION;

  try {
    console.log("file upload started!");
    // const s3 = new AWS.S3({
    //   accessKeyId: ID,
    //   secretAccessKey: SECRET,
    // });
    // const fileContent = fs.readFileSync(
    //   process.env.RECEIPT_FOLDER_PATH + "/" + fileName
    // );

    // console.log("fileContent:", fileContent);

    // const params = {
    //   Bucket: BUCKET_NAME,
    //   Key: fileName, // File name you want to save as in S3
    //   Body: fileContent,
    // };

    // Uploading files to the bucket
    // s3.upload(params, function (err, data) {
    //   if (err) {
    //     throw err;
    //   }
    //   console.log(`File uploaded successfully. ${data.Location}`);
    // });
    // return data;
    // console.log("file uploaded", JSON.stringify(data));
    // s3.getSignedUrl(
    //   "putObject",
    //   {
    //     Key: fileName,
    //     ContentType: fileType,
    //     Expires: parseInt(process.env.S3_FILE_URL_EXPIRATION_TIME),
    //   },
    //   (err, url) => {
    //     return url; // API Response Here
    //   }
    // );
    AWS.config.update({
      accessKeyId: ID,
      secretAccessKey: SECRET,
    });
    const s3Bucket = new AWS.S3({
      params: { Bucket: BUCKET_NAME },
      region: REGION,
    });
    const url = s3Bucket.getSignedUrl("putObject", {
      Key: fileName,
      ContentType: fileType,
      Expires: parseInt(process.env.S3_FILE_URL_EXPIRATION_TIME),
    });
    console.log("url:", url);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = s3BucketFileUpload;
