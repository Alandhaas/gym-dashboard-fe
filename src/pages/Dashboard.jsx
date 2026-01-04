import { useState } from 'react';
import { useExercise } from '../context/ExerciseContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { getAllExerciseNames, getProgressData } = useExercise();
  const exerciseNames = getAllExerciseNames();

  const [selectedExercise, setSelectedExercise] = useState(exerciseNames[0] || '');

  const progressData = selectedExercise ? getProgressData(selectedExercise) : [];

  // Calculate stats
  const stats = exerciseNames.reduce((acc, name) => {
    const data = getProgressData(name);
    if (data.length > 0) {
      const latest = data[data.length - 1];
      acc.totalExercises++;
      acc.totalSessions += data.length;
      acc.totalVolume += latest.totalVolume;
    }
    return acc;
  }, { totalExercises: 0, totalSessions: 0, totalVolume: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        {exerciseNames.length > 0 && (
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {exerciseNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Exercises</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalExercises}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💪</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalSessions}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Volume</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.totalVolume.toLocaleString()} kg
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚖️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {selectedExercise && progressData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Max Weight Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Max Weight Progress - {selectedExercise}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateFormatted" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => {
                    const dataPoint = progressData.find(d => d.dateFormatted === value);
                    return dataPoint ? new Date(dataPoint.date).toLocaleDateString() : value;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="maxWeight" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Max Weight (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Volume Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Total Volume - {selectedExercise}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateFormatted" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => {
                    const dataPoint = progressData.find(d => d.dateFormatted === value);
                    return dataPoint ? new Date(dataPoint.date).toLocaleDateString() : value;
                  }}
                />
                <Legend />
                <Bar dataKey="totalVolume" fill="#10b981" name="Total Volume (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Average Reps Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Average Reps - {selectedExercise}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateFormatted" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => {
                    const dataPoint = progressData.find(d => d.dateFormatted === value);
                    return dataPoint ? new Date(dataPoint.date).toLocaleDateString() : value;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avgReps" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Avg Reps"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sets Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Sets per Session - {selectedExercise}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateFormatted" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => {
                    const dataPoint = progressData.find(d => d.dateFormatted === value);
                    return dataPoint ? new Date(dataPoint.date).toLocaleDateString() : value;
                  }}
                />
                <Legend />
                <Bar dataKey="sets" fill="#f59e0b" name="Sets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">
            {exerciseNames.length === 0 
              ? 'No exercise data yet. Start adding your training data!'
              : 'Select an exercise to view progress charts'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

