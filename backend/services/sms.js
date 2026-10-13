let client;
async function sendSMS(to, body) {
  const {
    TWILIO_ACCOUNT_SID: sid,
    TWILIO_AUTH_TOKEN: token,
    TWILIO_FROM_NUMBER: from,
  } = process.env;
  if (!sid || !token || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV SMS] to=${to} message=${body}`);
      return { previewOnly: true };
    }
    throw new Error("SMS provider is not configured");
  }
  if (!client) client = require("twilio")(sid, token);
  return client.messages.create({ to, from, body });
}
module.exports = { sendSMS };
