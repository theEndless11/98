"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('dotenv').config(); // To load environment variables from a .env file


var express = require('express');

var mongoose = require('mongoose');

var Ably = require('ably');

var app = express(); // Middleware

app.use(express.json());
app.use(express["static"]('public')); // MongoDB setup (replace with your MongoDB URI in the .env file)

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}); // Schema definition for posts

var postSchema = new mongoose.Schema({
  message: String,
  timestamp: Date,
  username: String,
  // Add username to the schema
  sessionId: String // Store sessionId to track users

});
var Post = mongoose.model('Post', postSchema); // Ably setup (replace with your Ably API key in the .env file)

var ably = new Ably.Realtime(process.env.ABLY_API_KEY);
var channel = ably.channels.get('opinions'); // Routes
// Get all posts (GET route)

app.get('/posts', function _callee(req, res) {
  var posts;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(Post.find().sort({
            timestamp: -1
          }));

        case 3:
          posts = _context.sent;
          // Sort by timestamp in descending order
          res.status(200).json(posts);
          _context.next = 10;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          res.status(500).json({
            message: 'Error retrieving posts',
            error: _context.t0
          });

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // Post a new opinion (POST route)

app.post('/postOpinion', function _callee2(req, res) {
  var _req$body, message, username, sessionId, newPost;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body = req.body, message = _req$body.message, username = _req$body.username, sessionId = _req$body.sessionId;

          if (!(!message || message.trim() === '')) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: 'Message cannot be empty'
          }));

        case 3:
          if (!(!username || !sessionId)) {
            _context2.next = 5;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: 'Username and sessionId are required'
          }));

        case 5:
          _context2.prev = 5;
          newPost = new Post({
            message: message,
            timestamp: new Date(),
            username: username,
            sessionId: sessionId
          });
          _context2.next = 9;
          return regeneratorRuntime.awrap(newPost.save());

        case 9:
          // Log the new post data
          console.log('New post created:', newPost); // Publish new post to Ably

          channel.publish('newOpinion', _objectSpread({}, newPost.toObject(), {
            id: newPost._id
          }));
          res.status(201).json(newPost);
          _context2.next = 17;
          break;

        case 14:
          _context2.prev = 14;
          _context2.t0 = _context2["catch"](5);
          res.status(500).json({
            message: 'Error saving post',
            error: _context2.t0
          });

        case 17:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[5, 14]]);
}); // Edit an opinion (PUT route)

app.put('/editPost/:id', function _callee3(req, res) {
  var id, _req$body2, message, username, sessionId, post;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          id = req.params.id;
          _req$body2 = req.body, message = _req$body2.message, username = _req$body2.username, sessionId = _req$body2.sessionId;

          if (!(!message || message.trim() === '')) {
            _context3.next = 4;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: 'Message cannot be empty'
          }));

        case 4:
          _context3.prev = 4;
          _context3.next = 7;
          return regeneratorRuntime.awrap(Post.findById(id));

        case 7:
          post = _context3.sent;

          if (post) {
            _context3.next = 10;
            break;
          }

          return _context3.abrupt("return", res.status(404).json({
            message: 'Post not found'
          }));

        case 10:
          if (!(post.username !== username || post.sessionId !== sessionId)) {
            _context3.next = 12;
            break;
          }

          return _context3.abrupt("return", res.status(403).json({
            message: 'You can only edit your own posts'
          }));

        case 12:
          // Update the post
          post.message = message;
          post.timestamp = new Date();
          _context3.next = 16;
          return regeneratorRuntime.awrap(post.save());

        case 16:
          // Publish the edited post to Ably
          channel.publish('editOpinion', _objectSpread({}, post.toObject(), {
            id: post._id
          }));
          res.status(200).json(post);
          _context3.next = 23;
          break;

        case 20:
          _context3.prev = 20;
          _context3.t0 = _context3["catch"](4);
          res.status(500).json({
            message: 'Error updating post',
            error: _context3.t0
          });

        case 23:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[4, 20]]);
}); // Delete an opinion (DELETE route)

app["delete"]('/deletePost/:id', function _callee4(req, res) {
  var id, _req$body3, username, sessionId, post;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          id = req.params.id;
          _req$body3 = req.body, username = _req$body3.username, sessionId = _req$body3.sessionId;
          console.log("Received delete request for post ID: ".concat(id));
          console.log("Request body: username = ".concat(username, ", sessionId = ").concat(sessionId));
          _context4.prev = 4;
          _context4.next = 7;
          return regeneratorRuntime.awrap(Post.findById(id));

        case 7:
          post = _context4.sent;

          if (post) {
            _context4.next = 11;
            break;
          }

          console.log("Post with ID ".concat(id, " not found"));
          return _context4.abrupt("return", res.status(404).json({
            message: 'Post not found'
          }));

        case 11:
          console.log("Post data: username = ".concat(post.username, ", sessionId = ").concat(post.sessionId));

          if (!(post.username !== username || post.sessionId !== sessionId)) {
            _context4.next = 15;
            break;
          }

          console.log("User ".concat(username, " is not authorized to delete this post"));
          return _context4.abrupt("return", res.status(403).json({
            message: 'You can only delete your own posts'
          }));

        case 15:
          _context4.next = 17;
          return regeneratorRuntime.awrap(Post.findByIdAndDelete(id));

        case 17:
          console.log("Post with ID ".concat(id, " deleted successfully")); // Notify Ably about the deleted post

          channel.publish('deleteOpinion', {
            id: id
          });
          res.status(200).json({
            message: 'Post deleted successfully'
          });
          _context4.next = 26;
          break;

        case 22:
          _context4.prev = 22;
          _context4.t0 = _context4["catch"](4);
          console.error("Error occurred while deleting post with ID ".concat(id, ":"), _context4.t0);
          res.status(500).json({
            message: 'Error deleting post',
            error: _context4.t0.message,
            stack: _context4.t0.stack
          });

        case 26:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[4, 22]]);
}); // Server setup

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server is running on port ".concat(port));
});
//# sourceMappingURL=server.dev.js.map
