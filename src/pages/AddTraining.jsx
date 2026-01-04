import { useState } from 'react';
import { useExercise } from '../context/ExerciseContext';

const AddTraining = () => {
  const { addExercise, getExercisesByDate } = useExercise();
  const today = new Date().toISOString().split('T')[0];
  const todayExercises = getExercisesByDate(today);

  const [formData, setFormData] = useState({
    exercise: '',
    weight: '',
    reps: '',
    rir: '',
  });

  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.exercise || !formData.weight || !formData.reps) {
      alert('Please fill in exercise, weight, and reps');
      return;
    }

    addExercise({
      exercise: formData.exercise,
      weight: parseFloat(formData.weight),
      reps: parseInt(formData.reps),
      rir: formData.rir || '',
    });

    setSuccessMessage('Exercise added successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);

    // Reset form but keep exercise name for easy adding multiple sets
    setFormData({
      ...formData,
      weight: '',
      reps: '',
      rir: '',
    });
  };

  // Group today's exercises by name
  const exercisesByName = todayExercises.reduce((acc, ex) => {
    if (!acc[ex.exercise]) {
      acc[ex.exercise] = [];
    }
    acc[ex.exercise].push(ex);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Add Training Data</h1>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Set</h2>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercise Name
              </label>
              <input
                type="text"
                value={formData.exercise}
                onChange={(e) => setFormData({ ...formData, exercise: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Leg Press, Barbell Squat"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reps
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.reps}
                  onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RIR (Reps in Reserve) - Optional
              </label>
              <input
                type="number"
                min="0"
                value={formData.rir}
                onChange={(e) => setFormData({ ...formData, rir: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Leave empty if not applicable"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Set
            </button>
          </form>
        </div>

        {/* Today's Exercises */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Today's Exercises ({new Date().toLocaleDateString()})
          </h2>
          
          {todayExercises.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No exercises added today yet</p>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {Object.entries(exercisesByName).map(([exerciseName, sets]) => (
                <div key={exerciseName} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{exerciseName}</h3>
                  <div className="space-y-2">
                    {sets.map((set) => (
                      <div
                        key={set.id}
                        className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                      >
                        <span className="text-gray-600">
                          Set {set.sets}: {set.weight}kg × {set.reps} reps
                        </span>
                        {set.rir !== '' && (
                          <span className="text-blue-600 font-medium">RIR: {set.rir}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTraining;

