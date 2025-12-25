import {Router} from 'express';
import { regesterUser, getAllUsers, getUserById, updateUserById, deleteUserById , authUser} from '../controller/user.controller.js';

const userRouter = Router();

//register
userRouter.post('/register', regesterUser);
userRouter.post('/auth', authUser)

// REST API
userRouter.get('/', getAllUsers);
userRouter.get('/:id', getUserById);
userRouter.put('/:id', updateUserById);
userRouter.delete('/:id', deleteUserById);

export default userRouter;