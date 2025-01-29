"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = handler;

var _db = require("../../utils/db");

var _mongoose = _interopRequireDefault(require("mongoose"));

var _ably = require("../../utils/ably");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var postSchema = new _mongoose["default"].Schema({
  message: String,
  timestamp: Date,
  username: String,
  sessionId: String
});

var Post = _mongoose["default"].model('Post', postSchema);

function handler(req, res) {
  var _req$body, message, username, sessionId, newPost;

  return regeneratorRuntime.async(function handler$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(req.method === 'POST')) {
            _context.next = 22;
            break;
          }

          _req$body = req.body, message = _req$body.message, username = _req$body.username, sessionId = _req$body.sessionId;

          if (!(!message || message.trim() === '')) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: 'Message cannot be empty'
          }));

        case 4:
          if (!(!username || !sessionId)) {
            _context.next = 6;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: 'Username and sessionId are required'
          }));

        case 6:
          _context.prev = 6;
          _context.next = 9;
          return regeneratorRuntime.awrap((0, _db.connectToDatabase)());

        case 9:
          newPost = new Post({
            message: message,
            timestamp: new Date(),
            username: username,
            sessionId: sessionId
          });
          _context.next = 12;
          return regeneratorRuntime.awrap(newPost.save());

        case 12:
          _context.next = 14;
          return regeneratorRuntime.awrap((0, _ably.publishToAbly)('newOpinion', newPost));

        case 14:
          res.status(201).json(newPost);
          _context.next = 20;
          break;

        case 17:
          _context.prev = 17;
          _context.t0 = _context["catch"](6);
          res.status(500).json({
            message: 'Error saving post',
            error: _context.t0
          });

        case 20:
          _context.next = 23;
          break;

        case 22:
          res.status(405).json({
            message: 'Method Not Allowed'
          });

        case 23:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[6, 17]]);
}
//# sourceMappingURL=postOpinion.dev.js.map
