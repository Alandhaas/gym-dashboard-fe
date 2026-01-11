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
  const normalizeExercises = (data) => {
    if (!data) return [];
    const flatArray = Array.isArray(data)
      ? data
      : Array.isArray(data.exercises)
        ? data.exercises
        : Array.isArray(data.data)
          ? data.data
          : null;

    if (flatArray) {
      return flatArray.map(e => ({
        id: e.id,
        date: e.date ?? (e.performed_at ? String(e.performed_at).slice(0, 10) : undefined),
        week: e.week,
        exercise: e.exercise,
        set: e.set ?? e.sets,
        weight: e.weight,
        reps: e.reps,
        rir: e.rir ?? '',
        performed_at: e.performed_at,
      }));
    }

    const weeksData = data.weeks || data.data?.weeks || data;
    if (!weeksData || typeof weeksData !== 'object') return [];

    let weekEntries;
    if (Array.isArray(weeksData)) {
      weekEntries = weeksData.map((entry, index) => [
        entry?.week ?? index + 1,
        entry?.days ?? entry,
      ]);
    } else {
      const keys = Object.keys(weeksData);
      const hasDateKeys = keys.some(key => /^\d{4}-\d{2}-\d{2}/.test(key));
      weekEntries = hasDateKeys ? [[1, weeksData]] : Object.entries(weeksData);
    }

    return weekEntries.flatMap(([weekKey, days]) => {
      if (!days || typeof days !== 'object') return [];
      const weekValue = Number.isNaN(Number(weekKey)) ? weekKey : Number(weekKey);

      return Object.entries(days).flatMap(([date, exercisesByName]) => {
        if (!exercisesByName || typeof exercisesByName !== 'object') return [];

        return Object.entries(exercisesByName).flatMap(([exerciseName, sets]) => {
          if (!Array.isArray(sets)) return [];

          return sets.map((setEntry) => ({
            id: setEntry.id,
            date,
            week: weekValue,
            exercise: exerciseName,
            set: setEntry.set ?? setEntry.sets,
            weight: setEntry.weight,
            reps: setEntry.reps,
            rir: setEntry.rir ?? '',
            performed_at: setEntry.performed_at ?? date,
          }));
        });
      });
    });
  };

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
        setExercises(normalizeExercises(data));
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
      date: exerciseData.date || null,
    };

    try {
      await api.saveExercise(user, payload);
      const data = await api.fetchAllExercises(user);
      setExercises(normalizeExercises(data));
    } catch (err) {
      console.error('Failed saving exercise', err);
      throw err;
    }
  };

  const updateExercise = async (exerciseData) => {
    if (!user) return;

    try {
      await api.updateExercise(user, exerciseData);
      const data = await api.fetchAllExercises(user);
      setExercises(normalizeExercises(data));
    } catch (err) {
      console.error('Failed updating exercise', err);
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
    updateExercise,
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
