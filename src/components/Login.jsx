import { useState, useEffect } from 'react';
import { useExercise } from '../context/ExerciseContext';

export default function Login() {
  const { user, registerUser, loginUser, logout } = useExercise();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) setUsername(user);
  }, [user]);

  const handleRegister = async () => {
    setError(null);

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    try {
      await registerUser(username.trim(), password);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError(null);

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    try {
      const ok = await loginUser(username.trim(), password);
      if (!ok) setError('Invalid username or password');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-sm w-full p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        {user ? (
          <div className="text-center space-y-4">
            <div className="text-gray-700">
              Signed in as <span className="font-semibold">{user}</span>
            </div>
            <button
              onClick={logout}
              className="w-full px-4 py-2 rounded-md bg-red-500 text-white font-medium hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Signing in…' : 'Login'}
              </button>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-md bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition disabled:opacity-50"
              >
                Register
              </button>
            </div>

            {error && (
              <div className="text-sm text-red-600 text-center">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
