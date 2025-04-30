const { OAuth2Client } = require("google-auth-library");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// eslint-disable-next-line no-unused-vars
const GOOGLE_SECREAT_ = process.env.GOOGLE_SECREAT_;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  console.log(payload);
//   const userId = payload?.sub;
  const email = payload?.email;

  return { success: true, email };
}

module.exports = {
  verifyToken,
};
