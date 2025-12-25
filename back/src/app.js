import express from 'express';
import userRouter from './routes/user.routes.js';
import preferenceRouter from './routes/preference.routes.js';
import roomRouter from './routes/room.routes.js';
import sessionRouter from './routes/session.routes.js';
import subjectRouter from './routes/subject.routes.js';
import timeTableRouter from './routes/timeTable.routes.js';
import groupeRouter from './routes/groupe.routes.js';


const app = express();
app.use(express.json());

// Routes
app.use('/users', userRouter);
app.use('/preferences', preferenceRouter);
app.use('/rooms', roomRouter);
app.use('/sessions', sessionRouter);
app.use('/subjects', subjectRouter);
app.use('/groupes', groupeRouter);
app.use('/timetables', timeTableRouter);


export default app;