// Converts "08:15" to 495
export const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// Checks if two sessions clash in time
export const isTimeOverlapping = (s1, s2) => {
    if (s1.day !== s2.day) return false;
    const start1 = timeToMinutes(s1.startTime);
    const end1 = timeToMinutes(s1.endTime);
    const start2 = timeToMinutes(s2.startTime);
    const end2 = timeToMinutes(s2.endTime);

    return start1 < end2 && start2 < end1;
};