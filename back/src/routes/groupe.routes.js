import {Router} from 'express';
import { createGroupe, getAllGroupes, getGroupeById, updateGroupeById, deleteGroupeById } from '../controller/groupe.controller.js';

const groupeRouter = Router();

// REST API
groupeRouter.get('/', getAllGroupes);
groupeRouter.get('/:id', getGroupeById);
groupeRouter.put('/:id', updateGroupeById);
groupeRouter.delete('/:id', deleteGroupeById);
groupeRouter.post('/create', createGroupe);

export default groupeRouter;