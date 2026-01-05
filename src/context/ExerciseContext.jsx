import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api';

const ExerciseContext = createContext();

export const useExercise = () => {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error('useExercise must be used within ExerciseProvider');
  }
  return context;
};

export const ExerciseProvider = ({ children }) => {
  const [exercises, setExercises] = useState([]);
  const [user, setUser] = useState(() => {
    return localStorage.getItem('gymapp-user');
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('gymapp-user', user);
    } else {
      localStorage.removeItem('gymapp-user');
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;

    const loadExercises = async () => {
      if (!user) return;

      try {
        const data = await api.fetchAllExercises(user);
        if (!mounted) return;

        const mapped = (data || []).map(e => ({
          id: e.id,
          date: e.date,
          week: e.week,
          exercise: e.exercise,
          set: e.set,
          weight: e.weight,
          reps: e.reps,
          rir: e.rir ?? '',
          performed_at: e.performed_at,
        }));

        setExercises(mapped);
      } catch (err) {
        console.error('Failed to load exercises', err);
        setUser(null);
        setExercises([]);
      }
    };

    loadExercises();
    return () => { mounted = false; };
  }, [user]);

  // --------------------
  // Actions
  // --------------------

  const addExercise = async (exerciseData) => {
    if (!user) return;

    const payload = {
      exercise: exerciseData.exercise,
      set: exerciseData.set,
      weight: exerciseData.weight,
      reps: exerciseData.reps,
      rir: exerciseData.rir || null,
    };

    try {
      await api.saveExercise(user, payload);
      const data = await api.fetchAllExercises(user);

      const mapped = (data || []).map(e => ({
        id: e.id,
        date: e.date,
        week: e.week,
        exercise: e.exercise,
        set: e.set,
        weight: e.weight,
        reps: e.reps,
        rir: e.rir ?? '',
        performed_at: e.performed_at,
      }));

      setExercises(mapped);
    } catch (err) {
      console.error('Failed saving exercise', err);
      throw err;
    }
  };

  const registerUser = async (username, password) => {
    await api.register(username, password);
    setUser(username);
  };

  const loginUser = async (username, password) => {
    const ok = await api.login(username, password);
    if (ok) {
      setUser(username);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setExercises([]);
  };

  const getExercisesByDate = (date) => {
    return exercises.filter(e => e.date === date);
  };

  const getExerciseHistory = (exerciseName) => {
    return exercises
      .filter(e => e.exercise === exerciseName)
      .sort((a, b) => {
        const d = a.date.localeCompare(b.date);
        if (d !== 0) return d;
        return a.set - b.set;
      });
  };

  const getAllExerciseNames = () => {
    return [...new Set(exercises.map(e => e.exercise))].sort();
  };

  const getProgressData = (exerciseName) => {
    const history = getExerciseHistory(exerciseName);
    const dates = [...new Set(history.map(e => e.date))].sort();

    return dates.map(date => {
      const day = history.filter(e => e.date === date);
      const maxWeight = Math.max(...day.map(e => e.weight));
      const totalVolume = day.reduce((s, e) => s + e.weight * e.reps, 0);
      const avgReps =
        day.reduce((s, e) => s + e.reps, 0) / day.length;

      return {
        date,
        dateFormatted: new Date(date).toLocaleDateString(),
        maxWeight,
        totalVolume,
        avgReps: Math.round(avgReps * 10) / 10,
        sets: day.length,
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
    user,
    registerUser,
    loginUser,
    logout,
  };

  return (
    <ExerciseContext.Provider value={value}>
      {children}
    </ExerciseContext.Provider>
  );
};