import { cloneDeep, sample } from 'lodash-es';
import { calculateFitness } from './fitness.js';

let task = []

export const evolve = (initialSessions, availableRooms, timeSlots, fitnessOptions = {}) => {
    let population = [];
    const POP_SIZE = 50;
    const GENERATIONS = 100;
    const days = Array.isArray(fitnessOptions?.days) && fitnessOptions.days.length > 0
        ? fitnessOptions.days
        : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"];

    const effectiveFitnessOptions = {
        ...fitnessOptions,
        timeSlots
    };


    // 1. Initialize: Assign random room/time to the Admin's sessions
    console.log("Initializing population...");
    for (let i = 0; i < POP_SIZE; i++) {
        const individual = initialSessions.map(session => ({
            ...session,
            day: sample(days),
            ...(function () {
                const pickedSlot = sample(timeSlots);
                return { startTime: pickedSlot.start, endTime: pickedSlot.end };
            })(),
            room: sample(availableRooms)._id
        }));
        population.push(individual);
        //console.log(population);
    }


    // 2. Evolution Loop
    console.log("Starting evolution...");
    for (let g = 0; g < GENERATIONS; g++) {
        // Sort by fitness (cache to avoid recomputing during sort)
        const scored = population
            .map((p) => ({ p, score: calculateFitness(p, availableRooms, effectiveFitnessOptions) }))
            .sort((a, b) => b.score - a.score);

        population = scored.map((x) => x.p);

        if (scored[0]?.score === 0) break; // Perfect score!


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


    console.log("Evolution complete.");
    //console.log(population);
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