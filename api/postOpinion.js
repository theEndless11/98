import { connectToDatabase } from '../utils/db';  // Corrected path
import mongoose from 'mongoose';
import { publishToAbly } from '../utils/ably';  // Corrected path
import fs from 'fs';
import path from 'path';

// Define the schema for the post
const postSchema = new mongoose.Schema({
    message: String,
    timestamp: Date,
    username: String,
    sessionId: String,
    profilePic: { type: String, default: 'default-profile-pic.png' }, // Store profile pic URL or base64
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    likedBy: [String],  // Store usernames or user IDs of users who liked the post
    dislikedBy: [String],  // Store usernames or user IDs of users who disliked the post
    comments: [{ username: String, comment: String, timestamp: Date }]
});
const Post = mongoose.model('Post', postSchema);

// Set CORS headers
const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');  // Allow all origins or set a specific domain
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, OPTIONS');  // Allowed methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');  // Allowed headers
};

// Function to save profile picture (Handle upload or base64 saving)
const saveProfilePic = async (profilePic) => {
    if (profilePic && profilePic.startsWith('data:image/')) {
        // If the profile picture is a base64 string, save it as a file
        const base64Data = profilePic.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
        const filename = `profile-${Date.now()}.png`;  // Unique filename based on timestamp
        const filePath = path.join(__dirname, '../uploads', filename);

        // Save file
        fs.writeFileSync(filePath, base64Data, 'base64');
        return `/uploads/${filename}`; // Return the file path relative to public directory
    }

    return profilePic; // If not base64, just return the URL or file path
};

// Serverless API handler for creating/editing posts
export default async function handler(req, res) {
    // Handle pre-flight OPTIONS request
    if (req.method === 'OPTIONS') {
        setCorsHeaders(res);
        return res.status(200).end(); // Respond with 200 OK for OPTIONS pre-flight
    }

    // Set CORS headers before processing the request
    setCorsHeaders(res);

    if (req.method === 'POST') {
        // Handle new post creation
        const { message, username, sessionId, profilePic } = req.body; // Include profilePic in the body

        if (!message || message.trim() === '') {
            return res.status(400).json({ message: 'Message cannot be empty' });
        }
        if (!username || !sessionId) {
            return res.status(400).json({ message: 'Username and sessionId are required' });
        }

        try {
            console.log('Connecting to database...');
            await connectToDatabase();  // Ensure this step completes
            console.log('Database connected successfully.');

            // Save the profile picture
            const savedProfilePic = await saveProfilePic(profilePic);

            // Create a new post including the profilePic
            const newPost = new Post({
                message,
                timestamp: new Date(),
                username,
                sessionId,
                profilePic: savedProfilePic || 'default-profile-pic.png'  // Default to placeholder if no profile pic
            });
            await newPost.save();

            console.log('New post saved:', newPost);

            // Publish to Ably
            try {
                await publishToAbly('newOpinion', newPost);
                console.log('Post published to Ably:', newPost);
            } catch (error) {
                console.error('Error publishing to Ably:', error);
            }

            // Send only the necessary data (not the full Mongoose document)
            const cleanPost = {
                _id: newPost._id,
                message: newPost.message,
                timestamp: newPost.timestamp,
                username: newPost.username,
                profilePic: newPost.profilePic,  // Include profilePic in response
                likes: newPost.likes,
                dislikes: newPost.dislikes,
                comments: newPost.comments,
            };

            res.status(201).json(cleanPost);  // Send clean post data without Mongoose metadata
        } catch (error) {
            console.error('Error saving post:', error);
            res.status(500).json({ message: 'Error saving post', error });
        }
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
        // Handle post edit
        const { postId, message, likes, dislikes, comments, profilePic } = req.body;

        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required' });
        }

        // Fetch the post by its ID
        try {
            console.log('Connecting to database...');
            await connectToDatabase();
            console.log('Database connected successfully.');

            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            // Update the fields (message, likes, dislikes, comments, profilePic)
            if (message && message.trim() !== '') {
                post.message = message;
            }
            if (likes !== undefined) {
                post.likes = likes;
            }
            if (dislikes !== undefined) {
                post.dislikes = dislikes;
            }
            if (comments !== undefined) {
                post.comments = comments;
            }
            if (profilePic) {
                post.profilePic = await saveProfilePic(profilePic);  // Update profile pic if provided
            }

            // Save the updated post
            await post.save();

            console.log('Post updated:', post);

            // Publish to Ably
            try {
                await publishToAbly('editOpinion', post);
                console.log('Post updated in Ably:', post);
            } catch (error) {
                console.error('Error publishing to Ably:', error);
            }

            // Send only the necessary data (not the full Mongoose document)
            const updatedPost = {
                _id: post._id,
                message: post.message,
                timestamp: post.timestamp,
                username: post.username,
                profilePic: post.profilePic,  // Include updated profilePic
                likes: post.likes,
                dislikes: post.dislikes,
                comments: post.comments,
            };

            res.status(200).json(updatedPost);  // Send updated post data

        } catch (error) {
            console.error('Error editing post:', error);
            res.status(500).json({ message: 'Error editing post', error });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}

