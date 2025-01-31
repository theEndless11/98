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

// Serverless API handler for handling different request types
export default async function handler(req, res) {
    await connectToDatabase(); // Ensure you're connected to the database

    const { postId } = req.query;

    switch (req.method) {
        case 'POST':
            if (req.url.includes('/likePost')) {
                return likePost(req, res, postId);
            } else if (req.url.includes('/dislikePost')) {
                return dislikePost(req, res, postId);
            } else if (req.url.includes('/addComment')) {
                return addComment(req, res, postId);
            }
            break;

        case 'DELETE':
            return deletePost(req, res, postId);

        default:
            res.status(405).json({ message: 'Method Not Allowed' });
            break;
    }
}

// Like a post
const likePost = async (req, res, postId) => {
    const { username } = req.body;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        post.likes += 1;
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error liking post' });
    }
};

// Dislike a post
const dislikePost = async (req, res, postId) => {
    const { username } = req.body;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        post.dislikes += 1;
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error disliking post' });
    }
};

// Add a comment to a post
const addComment = async (req, res, postId) => {
    const { username, comment } = req.body;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        post.comments.push({ username, comment });
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment' });
    }
};

// Delete a post
const deletePost = async (req, res, postId) => {
    const { username, sessionId } = req.body;

    try {
        // Check that the required fields are present
        if (!username || !sessionId) {
            return res.status(400).json({ message: 'Missing required fields: username, sessionId' });
        }

        // Find the post to delete
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Ensure the post belongs to the user making the request
        if (post.username !== username) {
            return res.status(403).json({ message: 'You can only delete your own posts' });
        }

        // Delete the post from the database
        await post.deleteOne();
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting post', error });
    }
};
