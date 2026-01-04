import { useState } from 'react';
import { useExercise } from '../context/ExerciseContext';

const History = () => {
  const { exercises, getAllExerciseNames, getExerciseHistory } = useExercise();
  const [selectedExercise, setSelectedExercise] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const exerciseNames = getAllExerciseNames();
  
  // Get all unique dates
  const allDates = [...new Set(exercises.map(e => e.date))].sort().reverse();

  // Filter exercises
  let filteredExercises = exercises;
  if (selectedExercise) {
    filteredExercises = filteredExercises.filter(e => e.exercise === selectedExercise);
  }
  if (filterDate) {
    filteredExercises = filteredExercises.filter(e => e.date === filterDate);
  }

  // Group by date
  const exercisesByDate = filteredExercises.reduce((acc, ex) => {
    if (!acc[ex.date]) {
      acc[ex.date] = [];
    }
    acc[ex.date].push(ex);
    return acc;
  }, {});

  const sortedDates = Object.keys(exercisesByDate).sort().reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Exercise History</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Exercise
            </label>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Exercises</option>
              {exerciseNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Date
            </label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Dates</option>
              {allDates.map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exercise History */}
      {sortedDates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No exercise history found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => {
            const dayExercises = exercisesByDate[date];
            const exercisesByName = dayExercises.reduce((acc, ex) => {
              if (!acc[ex.exercise]) {
                acc[ex.exercise] = [];
              }
              acc[ex.exercise].push(ex);
              return acc;
            }, {});

            return (
              <div key={date} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (Week {dayExercises[0]?.week})
                  </span>
                </h2>

                <div className="space-y-4">
                  {Object.entries(exercisesByName).map(([exerciseName, sets]) => (
                    <div key={exerciseName} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-lg text-gray-800 mb-2">
                        {exerciseName}
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Set
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Weight (kg)
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reps
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                RIR
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Volume
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {sets
                              .sort((a, b) => a.sets - b.sets)
                              .map((set) => (
                                <tr key={set.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {set.sets}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                    {set.weight}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                    {set.reps}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                    {set.rir !== '' ? set.rir : '-'}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                    {(set.weight * set.reps).toFixed(0)} kg
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td colSpan="4" className="px-4 py-3 text-sm font-semibold text-gray-700">
                                Total Volume
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                {sets.reduce((sum, s) => sum + s.weight * s.reps, 0).toFixed(0)} kg
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;

