"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = handler;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _db = require("../../utils/db");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var postSchema = new _mongoose["default"].Schema({
  message: String,
  timestamp: Date,
  username: String,
  sessionId: String
});

var Post = _mongoose["default"].model('Post', postSchema);

function handler(req, res) {
  var posts;
  return regeneratorRuntime.async(function handler$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(req.method === 'GET')) {
            _context.next = 15;
            break;
          }

          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap((0, _db.connectToDatabase)());

        case 4:
          _context.next = 6;
          return regeneratorRuntime.awrap(Post.find().sort({
            timestamp: -1
          }));

        case 6:
          posts = _context.sent;
          res.status(200).json(posts);
          _context.next = 13;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](1);
          res.status(500).json({
            message: 'Error retrieving posts',
            error: _context.t0
          });

        case 13:
          _context.next = 16;
          break;

        case 15:
          res.status(405).json({
            message: 'Method Not Allowed'
          });

        case 16:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 10]]);
}
//# sourceMappingURL=posts.dev.js.map
