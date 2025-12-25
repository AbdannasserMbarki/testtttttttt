import dotenv from 'dotenv';
import connectDB from './config/config.js';
import app from './app.js';
import seedDB from './seed.js';

dotenv.config({
    path: './.env'
});

const startServer=async ()=>{
    try {
        await connectDB();
        await seedDB();
        app.on("error",(error)=>{
            console.log('error starting server (try):', error);
        });
        app.listen(process.env.PORT,()=>{
            console.log(`server running on port :${process.env.PORT}`);
        });
    } catch (error) {
        console.log('error starting server (catch) :', error);
    }
};


startServer();