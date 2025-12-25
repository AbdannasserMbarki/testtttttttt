import mongoose from 'mongoose';

const connectDB = async () =>{
    try {
        const conn= await mongoose.connect(`${process.env.MongoDB_URL}`);
        console.log(`mangoDB connected :${conn.connection.host}`);
    } catch (error) {
        console.log('error connecting to MongoDB:', error);
        process.exit(1);
    }
}

export default connectDB;