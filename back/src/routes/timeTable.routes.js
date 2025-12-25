import { Router } from "express";
import {
    createTimetable,
    getAllTimetables,
    getTimetableById,
    updateTimetableById,
    deleteTimetableById,
    generateTimetable
} from "../controller/timeTable.controller.js";

const timeTableRouter = Router();

// Generation
timeTableRouter.post("/generate", generateTimetable);

// CRUD
timeTableRouter.get("/", getAllTimetables);
timeTableRouter.get("/:id", getTimetableById);
timeTableRouter.post("/create", createTimetable);
timeTableRouter.put("/:id", updateTimetableById);
timeTableRouter.delete("/:id", deleteTimetableById);

export default timeTableRouter;
