import { createContext, useContext, useState, useEffect } from 'react';

const ExerciseContext = createContext();

export const useExercise = () => {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error('useExercise must be used within ExerciseProvider');
  }
  return context;
};

export const ExerciseProvider = ({ children }) => {
  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem('gymapp-exercises');
    if (saved) {
      return JSON.parse(saved);
    }
    // Initialize with sample data
    return [
      { id: 1, date: '2024-01-01', week: 1, exercise: 'Leg Press', sets: 1, weight: 200, reps: 10, rir: 2 },
      { id: 2, date: '2024-01-01', week: 1, exercise: 'Leg Press', sets: 2, weight: 220, reps: 10, rir: 2 },
      { id: 3, date: '2024-01-01', week: 1, exercise: 'Leg Press', sets: 3, weight: 250, reps: 8, rir: 2 },
      { id: 4, date: '2024-01-01', week: 1, exercise: 'Leg Extension HS', sets: 1, weight: 75, reps: 10, rir: 0 },
      { id: 5, date: '2024-01-01', week: 1, exercise: 'Leg Extension HS', sets: 2, weight: 75, reps: 9, rir: 0 },
      { id: 6, date: '2024-01-01', week: 1, exercise: 'Bulgarian Split Squat', sets: 1, weight: 10, reps: 6, rir: '' },
      { id: 7, date: '2024-01-01', week: 1, exercise: 'Barbell Squat', sets: 1, weight: 80, reps: 10, rir: 1 },
      { id: 8, date: '2024-01-01', week: 1, exercise: 'Barbell Squat', sets: 2, weight: 100, reps: 10, rir: 1 },
      { id: 9, date: '2024-01-01', week: 1, exercise: 'Barbell Squat', sets: 3, weight: 110, reps: 4, rir: 1 },
      { id: 10, date: '2024-01-01', week: 1, exercise: 'RDL', sets: 1, weight: 60, reps: 10, rir: '' },
      { id: 11, date: '2024-01-01', week: 1, exercise: 'RDL', sets: 2, weight: 80, reps: 10, rir: '' },
      { id: 12, date: '2024-01-01', week: 1, exercise: 'Incline DB Press', sets: 1, weight: 36, reps: 10, rir: 1 },
      { id: 13, date: '2024-01-01', week: 1, exercise: 'Incline DB Press', sets: 2, weight: 40, reps: 10, rir: 1 },
      { id: 14, date: '2024-01-01', week: 1, exercise: 'Dips', sets: 1, weight: 120, reps: 10, rir: 0 },
      { id: 15, date: '2024-01-01', week: 1, exercise: 'Dips', sets: 2, weight: 140, reps: 7, rir: 0 },
      { id: 16, date: '2024-01-01', week: 1, exercise: 'Barbell Curl', sets: 1, weight: 10, reps: 10, rir: '' },
      { id: 17, date: '2024-01-01', week: 1, exercise: 'Barbell Curl', sets: 2, weight: 20, reps: 10, rir: '' },
      { id: 18, date: '2024-01-01', week: 1, exercise: 'Weighted Pull Up', sets: 1, weight: 10, reps: 9, rir: 1 },
      { id: 19, date: '2024-01-01', week: 1, exercise: 'Weighted Pull Up', sets: 2, weight: 20, reps: 6, rir: 1 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('gymapp-exercises', JSON.stringify(exercises));
  }, [exercises]);

  const addExercise = (exerciseData) => {
    const today = new Date().toISOString().split('T')[0];
    const todayExercises = exercises.filter(e => e.date === today && e.exercise === exerciseData.exercise);
    const nextSetNumber = todayExercises.length > 0 
      ? Math.max(...todayExercises.map(e => e.sets)) + 1 
      : 1;

    const newExercise = {
      id: Date.now(),
      date: today,
      week: exerciseData.week,
      exercise: exerciseData.exercise,
      sets: nextSetNumber,
      weight: exerciseData.weight,
      reps: exerciseData.reps,
      rir: exerciseData.rir || '',
    };

    setExercises([...exercises, newExercise]);
  };

  const getExercisesByDate = (date) => {
    return exercises.filter(e => e.date === date);
  };

  const getExerciseHistory = (exerciseName) => {
    return exercises
      .filter(e => e.exercise === exerciseName)
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.sets - b.sets;
      });
  };

  const getAllExerciseNames = () => {
    return [...new Set(exercises.map(e => e.exercise))].sort();
  };

  const getProgressData = (exerciseName) => {
    const history = getExerciseHistory(exerciseName);
    const dates = [...new Set(history.map(e => e.date))].sort();
    
    return dates.map(date => {
      const dayExercises = history.filter(e => e.date === date);
      const maxWeight = Math.max(...dayExercises.map(e => e.weight));
      const totalVolume = dayExercises.reduce((sum, e) => sum + (e.weight * e.reps), 0);
      const avgReps = dayExercises.reduce((sum, e) => sum + e.reps, 0) / dayExercises.length;
      
      // Format date for display
      const dateObj = new Date(date);
      const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
      
      return {
        date,
        dateFormatted: formattedDate,
        maxWeight,
        totalVolume,
        avgReps: Math.round(avgReps * 10) / 10,
        sets: dayExercises.length,
      };
    });
  };

  const value = {
    exercises,
    addExercise,
    getExercisesByDate,
    getExerciseHistory,
    getAllExerciseNames,
    getProgressData,
  };

  return (
    <ExerciseContext.Provider value={value}>
      {children}
    </ExerciseContext.Provider>
  );
};

