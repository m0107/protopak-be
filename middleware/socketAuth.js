const jwt = require("jsonwebtoken");
const socketAuth = async (socket, next) => {
  try {
    // console.log("socket:", socket.handshake.headers["x-access-token"]);
    const token = socket.handshake.headers["x-access-token"];
    const payload = jwt.verify(token, process.env.JWT_TOKEN);
    socket.user_id = payload.id;
    next();
  } catch (err) {
      // console.log(err);
    console.log("error occured in socket authentication:", err.message);
    const error = new Error("Forbidden");
    error.data = { content: "401: Auth failed!" }; // additional details
    next(error);
  }
};
module.exports = socketAuth;
