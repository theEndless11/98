import mongoose from 'mongoose';

const connectToDatabase = async () => {
    if (mongoose.connections[0].readyState) {
        // If we're already connected, just return
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, { // Make sure to use your MongoDB URI here
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw new Error('Error connecting to database');
    }
};

export { connectToDatabase };
