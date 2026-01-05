const BASE = 'https://gym-dashboard-app-k3jaw.ondigitalocean.app';
// const BASE = 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function register(username, password) {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function login(username, password) {
  try {
    await request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return true;
  } catch {
    return false;
  }
}

// --------------------
// Exercises
// --------------------

export async function saveExercise(username, exercise) {
  return request(`/exercises/${encodeURIComponent(username)}`, {
    method: 'POST',
    body: JSON.stringify(exercise),
  });
}

export async function fetchAllExercises(username) {
  return request(`/exercises/${encodeURIComponent(username)}`);
}

export async function fetchTodayExercises(username) {
  return request(`/exercises/${encodeURIComponent(username)}/today`);
}

export default {
  register,
  login,
  saveExercise,
  fetchAllExercises,
  fetchTodayExercises,
};
