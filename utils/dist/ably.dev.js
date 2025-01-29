"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.publishToAbly = publishToAbly;

var _ably = _interopRequireDefault(require("ably"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var ably = new _ably["default"].Realtime(process.env.ABLY_API_KEY); // Fetch Ably API key from environment variables

var channel = ably.channels.get('opinions'); // Use the same 'opinions' channel for all communication

/**
 * Publish a message to the Ably channel
 * @param {string} event - The event name, e.g., 'newOpinion', 'editOpinion', or 'deleteOpinion'
 * @param {Object} data - The data to send in the event
 */

function publishToAbly(event, data) {
  return new Promise(function (resolve, reject) {
    channel.publish(event, data, function (err) {
      if (err) {
        console.error('Error publishing message to Ably:', err);
        reject(err);
      } else {
        console.log("Published message to Ably channel with event: ".concat(event));
        resolve();
      }
    });
  });
}
//# sourceMappingURL=ably.dev.js.map
