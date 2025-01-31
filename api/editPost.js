import mongoose from 'mongoose';
import { connectToDatabase } from '../utils/db'; // Your connection utility

// Define the schema for the post
const postSchema = new mongoose.Schema({
    message: String,
    timestamp: Date,
    username: String,
    sessionId: String,
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    comments: [{ username: String, comment: String }],
});

// Create the model for posts
const Post = mongoose.model('Post', postSchema);

// Assuming you have a `Post` model already defined

app.post('/api/editPost/:postId', async (req, res) => {
    const { postId } = req.params;
    const { username, action, comment } = req.body;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Handle like action
        if (action === 'like') {
            post.likes += 1;
        }
        // Handle dislike action
        else if (action === 'dislike') {
            post.dislikes += 1;
        }
        // Handle comment action
        else if (action === 'comment') {
            if (!comment || !comment.trim()) {
                return res.status(400).json({ message: 'Comment cannot be empty' });
            }
            post.comments.push({ username, comment, timestamp: new Date() });
        }
        // Invalid action type
        else {
            return res.status(400).json({ message: 'Invalid action type' });
        }

        // Save the post and respond with the updated post
        await post.save();
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating post', error });
    }
});
