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
  var id, _req$body, username, sessionId, post;

  return regeneratorRuntime.async(function handler$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(req.method === 'DELETE')) {
            _context.next = 25;
            break;
          }

          id = req.query.id; // Get the post ID from the URL

          _req$body = req.body, username = _req$body.username, sessionId = _req$body.sessionId;
          _context.prev = 3;
          _context.next = 6;
          return regeneratorRuntime.awrap((0, _db.connectToDatabase)());

        case 6:
          _context.next = 8;
          return regeneratorRuntime.awrap(Post.findById(id));

        case 8:
          post = _context.sent;

          if (post) {
            _context.next = 11;
            break;
          }

          return _context.abrupt("return", res.status(404).json({
            message: 'Post not found'
          }));

        case 11:
          if (!(post.username !== username || post.sessionId !== sessionId)) {
            _context.next = 13;
            break;
          }

          return _context.abrupt("return", res.status(403).json({
            message: 'You can only delete your own posts'
          }));

        case 13:
          _context.next = 15;
          return regeneratorRuntime.awrap(Post.findByIdAndDelete(id));

        case 15:
          _context.next = 17;
          return regeneratorRuntime.awrap((0, _ably.publishToAbly)('deleteOpinion', {
            id: id
          }));

        case 17:
          res.status(200).json({
            message: 'Post deleted successfully'
          });
          _context.next = 23;
          break;

        case 20:
          _context.prev = 20;
          _context.t0 = _context["catch"](3);
          res.status(500).json({
            message: 'Error deleting post',
            error: _context.t0.message
          });

        case 23:
          _context.next = 26;
          break;

        case 25:
          res.status(405).json({
            message: 'Method Not Allowed'
          });

        case 26:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[3, 20]]);
}
//# sourceMappingURL=deletePost.dev.js.map
