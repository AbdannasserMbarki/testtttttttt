import {Router} from 'express';
import { createRoom, getAllRooms, getRoomById, updateRoomById, deleteRoomById } from '../controller/room.controller.js';

const roomRouter = Router();

// REST API
roomRouter.get('/', getAllRooms);
roomRouter.get('/:id', getRoomById);
roomRouter.put('/:id', updateRoomById);
roomRouter.delete('/:id', deleteRoomById);
roomRouter.post('/create', createRoom);

export default roomRouter;