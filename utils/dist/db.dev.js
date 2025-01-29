"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connectToDatabase = connectToDatabase;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var isConnected = false; // Track the connection state

/**
 * Connect to MongoDB
 */

function connectToDatabase() {
  return regeneratorRuntime.async(function connectToDatabase$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!isConnected) {
            _context.next = 3;
            break;
          }

          console.log("Already connected to MongoDB");
          return _context.abrupt("return");

        case 3:
          _context.prev = 3;
          _context.next = 6;
          return regeneratorRuntime.awrap(_mongoose["default"].connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }));

        case 6:
          isConnected = true; // Set the connection state to true after successful connection

          console.log("MongoDB connected");
          _context.next = 14;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](3);
          console.error("Error connecting to MongoDB:", _context.t0);
          throw new Error('Failed to connect to database');

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[3, 10]]);
}
//# sourceMappingURL=db.dev.js.map
