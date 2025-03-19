let SOCKET, IO;
const appClients = [];
const deoClients = [];
const bankerClients = [];
const ccClients = [];
let duplicateDeoClientIndex;
let duplicatePanelClientIndex;
let duplicateBankerClientIndex;
let duplicateCcClientIndex;
const socketIntialize = (io, namespace = null) => {
  IO = io;
  if (namespace) {
    io = io.of(constants[namespace]);
  }
  io.on("connection", async (socket) => {
    if (!SOCKET) {
      // console.log("client connected", socket.user_id);
      socketIntialize.SOCKET = socket;
      socket.on("disconnect", () => {
        socketIntialize.SOCKET = null;
        // console.log(`Socket disconnected:`, socket.user_id);
      });
    }
    console.log(`Socket listning on port:${process.env.SOCKET_PORT}`);

    // add all receivers in array
    socket.on("room", (payload) => {
      // console.log("payload", payload);
      if (payload.type === "data-entry-operator") {
        duplicateDeoClientIndex = deoClients.length
          ? deoClients.findIndex((el, i) => el.user_id === socket.user_id)
          : null;
        // console.log("duplicate index:", duplicateDeoClientIndex);
        if (
          duplicateDeoClientIndex === -1 ||
          duplicateDeoClientIndex === null
        ) {
          // deoClients[socket.id] = socket;
          deoClients.push(socket);
        } else {
          // console.log(deoClients[duplicateDeoClientIndex]);
          deoClients[duplicateDeoClientIndex] = socket;
        }
      } else if (payload.type === "platform-admin") {
        duplicatePanelClientIndex = appClients.length
          ? appClients.findIndex((el, i) => {
              return el.user_id === socket.user_id;
            })
          : null;
        // console.log(duplicatePanelClientIndex);
        if (
          duplicatePanelClientIndex === -1 ||
          duplicatePanelClientIndex === null
        ) {
          // appClients[socket.id] = socket;
          appClients.push(socket);
        } else {
          appClients[duplicatePanelClientIndex] = socket;
        }
      } else if (payload.type === "banker") {
        duplicateBankerClientIndex = bankerClients.length
          ? bankerClients.findIndex((el, i) => {
              return el.user_id === socket.user_id;
            })
          : null;
        // console.log(duplicateBankerClientIndex);
        if (
          duplicateBankerClientIndex === -1 ||
          duplicateBankerClientIndex === null
        ) {
          // bankerClients[socket.id] = socket;
          bankerClients.push(socket);
        } else {
          bankerClients[duplicateBankerClientIndex] = socket;
        }
      } else if (payload.type === "customer-support") {
        duplicateCcClientIndex = ccClients.length
          ? ccClients.findIndex((el, i) => {
              return el.user_id === socket.user_id;
            })
          : null;
        // console.log(duplicateCcClientIndex);
        if (duplicateCcClientIndex === -1 || duplicateCcClientIndex === null) {
          // ccClients[socket.id] = socket;
          ccClients.push(socket);
        } else {
          ccClients[duplicatePanelClientIndex] = socket;
        }
      }
    });
  });
};

const sendAlertToAllDeo = (type = "success", value, userId) => {
  const deoIndex = deoClients.findIndex((el, i) => el.user_id === userId);
  if (deoIndex !== -1)
    deoClients[deoIndex].emit(`data-entry-operator-${type}`, value);

  // for (i in deoClients) {
  // deoClients[i].emit(`data-entry-operator-${type}`, value);
  // }
};

const sendAlertToAllApprover = (type = "success", value) => {
  for (i in appClients) {
    appClients[i].emit(`platform-admin-${type}`, value);
  }
};

const sendAlertToAllBanker = (type = "success", value) => {
  for (i in bankerClients) {
    bankerClients[i].emit(`banker-${type}`, value);
  }
};

const sendAlertToAllCc = (type = "success", value) => {
  for (i in ccClients) {
    ccClients[i].emit(`customer-support-${type}`, value);
  }
};

const sendAlertForReject = (type = "success", value, userId) => {
  for (i in ccClients) {
    ccClients[i].emit(`customer-support-${type}`, value);
  }

  const deoIndex = deoClients.findIndex((el, i) => el.user_id === userId);
  if (deoIndex !== -1)
    deoClients[deoIndex].emit(`data-entry-operator-${type}`, value);
};

const sendAlert = (event, value) => {
  if (socketIntialize.SOCKET) socketIntialize.SOCKET.emit(event, value);
  else console.log("SOCKET CONNECTION NOT AVAIALIABLE");
};

const broadcastData = (event, value) => {
  if (IO) IO.emit(event, value);
  else console.log("Socket IO connection not availiable");
};

const emitError = (errMsg) => {
  if (socketIntialize.SOCKET) socketIntialize.SOCKET.emit("error", errMsg);
  else console.log("Socket not intialized yet");
};

module.exports = {
  socketIntialize,
  sendAlert,
  emitError,
  broadcastData,
  sendAlertToAllApprover,
  sendAlertToAllDeo,
  sendAlertToAllBanker,
  sendAlertToAllCc,
  sendAlertForReject,
};
