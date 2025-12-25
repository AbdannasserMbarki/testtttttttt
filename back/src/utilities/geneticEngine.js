import { cloneDeep, sample } from 'lodash-es';
import { calculateFitness } from './fitness.js';

let task = []

export const evolve = (initialSessions, availableRooms, timeSlots, fitnessOptions = {}) => {
    let population = [];
    const POP_SIZE = 200;
    const GENERATIONS = 300;
    const days = Array.isArray(fitnessOptions?.days) && fitnessOptions.days.length > 0
        ? fitnessOptions.days
        : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];


    // 1. Initialize: Assign random room/time to the Admin's sessions
    for (let i = 0; i < POP_SIZE; i++) {
        const individual = initialSessions.map(session => ({
            ...session,
            day: sample(days),
            startTime: sample(timeSlots).start,
            endTime: sample(timeSlots).end,
            room: sample(availableRooms)._id
        }));
        population.push(individual);
    }


    // 2. Evolution Loop
    for (let g = 0; g < GENERATIONS; g++) {
        // Sort by fitness
        population.sort((a, b) => 
            calculateFitness(b, availableRooms, fitnessOptions) - calculateFitness(a, availableRooms, fitnessOptions)
        );

        if (calculateFitness(population[0], availableRooms, fitnessOptions) === 0) break; // Perfect score!

        // Keep the best (Elitism)
        let nextGen = population.slice(0, 5);

        // Fill rest with Crossover/Mutation
        while (nextGen.length < POP_SIZE) {
            let parent = population[0]; // Simplification: Breed with the best
            let child = mutate(cloneDeep(parent), availableRooms, timeSlots, days);
            nextGen.push(child);
        }
        population = nextGen;
    }


    return population[0]; // Return the best timetable found
};

const mutate = (individual, rooms, slots, days) => {
    const session = sample(individual); // Pick a random session
    session.day = sample(days);
    const pickedSlot = sample(slots);
    session.startTime = pickedSlot.start;
    session.endTime = pickedSlot.end;
    session.room = sample(rooms)._id;
    return individual;
};