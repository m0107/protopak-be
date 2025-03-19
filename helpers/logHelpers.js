const _ = require("lodash");

const keysToHide = [
  // axios headers
  "config.headers",

  // request body
  "config.data.oldPassword",
  "config.data.newPassword",
  "config.data.password",
  "config.data.apiToken",
  "config.data.masterPassword",
  "config.data.userPassword",

  // api request object
  "reqObj.apiToken",
  "reqObj.password",
  "reqObj.data.password",
  "reqObj.token",
  "reqObj.secret_key",

  // axios response
  "response.data.access_token",
  "response.data.terms",

  // keys
  "token",
  "password",

  // error
  "config.headers",
  "err.config.headers",
];

const getAxiosError = (err) =>
  err?.response?.data?.message || err?.response?.data || err?.data?.message || err?.message;

const hideSensitiveDataFromObject = (data) => {
  data = _.cloneDeep(data);
  for (let key of keysToHide) {
    // if key exists in logged object, replace value with "hidden"
    if (_.get(data, key, false)) _.set(data, key, "hidden");
  }
  return data;
};

module.exports = {
  keysToHide,
  getAxiosError,
  hideSensitiveDataFromObject,
};
