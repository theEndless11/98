"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = handler;

var _db = require("./utils/db");

var _mongoose = _interopRequireDefault(require("mongoose"));

var _ably = require("./utils/ably");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var postSchema = new _mongoose["default"].Schema({
  message: String,
  timestamp: Date,
  username: String,
  sessionId: String
});

var Post = _mongoose["default"].model('Post', postSchema);

function handler(req, res) {
  var id, _req$body, message, username, sessionId, post;

  return regeneratorRuntime.async(function handler$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(req.method === 'PUT')) {
            _context.next = 29;
            break;
          }

          id = req.query.id; // Get the post ID from the URL

          _req$body = req.body, message = _req$body.message, username = _req$body.username, sessionId = _req$body.sessionId;

          if (!(!message || message.trim() === '')) {
            _context.next = 5;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: 'Message cannot be empty'
          }));

        case 5:
          _context.prev = 5;
          _context.next = 8;
          return regeneratorRuntime.awrap((0, _db.connectToDatabase)());

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap(Post.findById(id));

        case 10:
          post = _context.sent;

          if (post) {
            _context.next = 13;
            break;
          }

          return _context.abrupt("return", res.status(404).json({
            message: 'Post not found'
          }));

        case 13:
          if (!(post.username !== username || post.sessionId !== sessionId)) {
            _context.next = 15;
            break;
          }

          return _context.abrupt("return", res.status(403).json({
            message: 'You can only edit your own posts'
          }));

        case 15:
          // Update the post
          post.message = message;
          post.timestamp = new Date();
          _context.next = 19;
          return regeneratorRuntime.awrap(post.save());

        case 19:
          _context.next = 21;
          return regeneratorRuntime.awrap((0, _ably.publishToAbly)('editOpinion', post));

        case 21:
          res.status(200).json(post);
          _context.next = 27;
          break;

        case 24:
          _context.prev = 24;
          _context.t0 = _context["catch"](5);
          res.status(500).json({
            message: 'Error updating post',
            error: _context.t0
          });

        case 27:
          _context.next = 30;
          break;

        case 29:
          res.status(405).json({
            message: 'Method Not Allowed'
          });

        case 30:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[5, 24]]);
}
//# sourceMappingURL=editPost.dev.js.map
