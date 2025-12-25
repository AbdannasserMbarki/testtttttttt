import {Router} from 'express';
import { createPreference, getAllPreferences, getPreferenceByTeacher, updatePreferenceByTeacher, deletePreferenceByTeacher } from '../controller/preference.controller.js';

const preferenceRouter = Router();

// REST API
preferenceRouter.get('/', getAllPreferences);
preferenceRouter.get('/:teacherId', getPreferenceByTeacher);
preferenceRouter.put('/:teacherId', updatePreferenceByTeacher);
preferenceRouter.delete('/:teacherId', deletePreferenceByTeacher);
preferenceRouter.post('/create', createPreference);

export default preferenceRouter;