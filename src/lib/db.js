import mongoose from 'mongoose';

export async function connectDB() {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB:', connection.connection.host);
    } catch (err) {
        console.log('Error connecting to DB:', err);
    }
}
