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
    likedBy: [String],  // Store usernames or user IDs of users who liked the post
    dislikedBy: [String],  // Store usernames or user IDs of users who disliked the post
    comments: [{ username: String, comment: String, timestamp: Date }]
});

// Create the model for posts
const Post = mongoose.model('Post', postSchema);

export default async function handler(req, res) {
    const { postId, username, action, comment } = req.body;

    await connectToDatabase(); // Ensure you're connected to the DB

    if (req.method === 'POST') {
        try {
            // Find the post by postId
            const post = await Post.findById(postId);

            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            // Handle the "like" action
            if (action === 'like') {
                // Check if the user has already disliked this post
                if (post.dislikedBy.includes(username)) {
                    return res.status(400).json({ message: 'You cannot like a post you have disliked' });
                }

                // Check if the user has already liked this post
                if (post.likedBy.includes(username)) {
                    return res.status(400).json({ message: 'You have already liked this post' });
                }

                post.likes += 1;
                post.likedBy.push(username); // Add the user to the likedBy array

            // Handle the "dislike" action
            } else if (action === 'dislike') {
                // Check if the user has already liked this post
                if (post.likedBy.includes(username)) {
                    return res.status(400).json({ message: 'You cannot dislike a post you have liked' });
                }

                // Check if the user has already disliked this post
                if (post.dislikedBy.includes(username)) {
                    return res.status(400).json({ message: 'You have already disliked this post' });
                }

                post.dislikes += 1;
                post.dislikedBy.push(username); // Add the user to the dislikedBy array

           
            // Handle the "comment" action
            } else if (action === 'comment') {
                if (!comment || !comment.trim()) {
                    return res.status(400).json({ message: 'Comment cannot be empty' });
                }

                post.comments.push({ username, comment, timestamp: new Date() });

            } else {
                return res.status(400).json({ message: 'Invalid action type' });
            }

            // Save the updated post
            await post.save();
            res.json(post);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating post', error });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
