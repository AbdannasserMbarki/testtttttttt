import {Router} from 'express';
import { createSubject, getAllSubjects, getSubjectById, updateSubjectById, deleteSubjectById } from '../controller/subject.controller.js';

const subjectRouter = Router();

// REST API
subjectRouter.get('/', getAllSubjects);
subjectRouter.get('/:id', getSubjectById);
subjectRouter.put('/:id', updateSubjectById);
subjectRouter.delete('/:id', deleteSubjectById);
subjectRouter.post('/create', createSubject);

export default subjectRouter;