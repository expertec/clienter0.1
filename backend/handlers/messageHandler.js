const { handleIncomingMessage } = require('./messageReceiver');
const { sendMessageToContact } = require('./messageSender');

module.exports = {
  handleIncomingMessage,
  sendMessageToContact,
};
