import {Router} from 'express';
import { createSession, getAllSessions, getSessionById, updateSessionById, deleteSessionById } from '../controller/session.controller.js';

const sessionRouter = Router();

// REST API
sessionRouter.get('/', getAllSessions);
sessionRouter.get('/:id', getSessionById);
sessionRouter.put('/:id', updateSessionById);
sessionRouter.delete('/:id', deleteSessionById);
sessionRouter.post('/create', createSession);

export default sessionRouter;