import { useState } from 'react';
import { useExercise } from '../context/ExerciseContext';

const AddTraining = () => {
  const {
    addExercise,
    updateExercise,
    getExercisesByDate,
    getAllExerciseNames,
  } = useExercise();
  const today = new Date().toISOString().split('T')[0];
  const todayExercises = getExercisesByDate(today);

  const [formData, setFormData] = useState({
    exercise: '',
    weight: '',
    reps: '',
    sets: '',
    rir: '',
    date: '',
  });
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [editValues, setEditValues] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.exercise || !formData.weight || !formData.reps || !formData.sets) {
      setSuccessMessage('Please fill in exercise, weight, reps, and set number');
      return;
    }

    try {
      await addExercise({
        exercise: formData.exercise,
        weight: parseFloat(formData.weight),
        reps: parseInt(formData.reps),
        set: parseInt(formData.sets),
        rir: formData.rir || null,
        date: formData.date || null,
      });
      setSuccessMessage('Exercise added successfully!');
      setSuccessMessage('');
    } catch (error) {
      setSuccessMessage(`Error: ${error.message}`);  
    }

    setTimeout(() => setSuccessMessage(''), 3000);

    // Reset form but keep exercise name for easy adding multiple sets
    setFormData({
      ...formData,
      weight: '',
      reps: '',
      sets: '',
      rir: '',
      date: '',
    });
  };

  const handleEditChange = (setId, field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [setId]: {
        ...prev[setId],
        [field]: value,
      },
    }));
  };

  const handleEditBlur = async (setEntry) => {
    const edits = editValues[setEntry.id];
    if (!edits) return;

    const payload = {
      exercise: setEntry.exercise,
      set: setEntry.set,
      date: setEntry.date || null,
    };

    if (edits.weight !== undefined && edits.weight !== '' && Number(edits.weight) !== setEntry.weight) {
      payload.weight = parseFloat(edits.weight);
    }
    if (edits.reps !== undefined && edits.reps !== '' && Number(edits.reps) !== setEntry.reps) {
      payload.reps = parseInt(edits.reps);
    }
    if (edits.rir !== undefined) {
      if (edits.rir === '') {
        payload.rir = null;
      } else if (Number(edits.rir) !== setEntry.rir) {
        payload.rir = parseInt(edits.rir);
      }
    }

    if (payload.weight === undefined && payload.reps === undefined && payload.rir === undefined) {
      return;
    }

    try {
      await updateExercise(payload);
      setEditValues((prev) => {
        const next = { ...prev };
        delete next[setEntry.id];
        return next;
      });
    } catch (error) {
      setSuccessMessage(`Error: ${error.message}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const getEditValue = (setEntry, field) => {
    const edit = editValues[setEntry.id];
    if (edit && edit[field] !== undefined) return edit[field];
    if (field === 'rir') return setEntry.rir ?? '';
    return setEntry[field] ?? '';
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
              <select
                value={isAddingNew ? '__add_new__' : formData.exercise}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '__add_new__') {
                    setIsAddingNew(true);
                    setFormData({ ...formData, exercise: '' });
                  } else {
                    setIsAddingNew(false);
                    setFormData({ ...formData, exercise: v });
                  }
                }}
                className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select exercise...</option>
                {getAllExerciseNames().map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
                <option value="__add_new__">+ Add new exercise...</option>
              </select>

              {isAddingNew && (
                <input
                  type="text"
                  value={formData.exercise}
                  onChange={(e) => setFormData({ ...formData, exercise: e.target.value })}
                  className="text-gray-700 w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="New exercise name"
                  required
                />
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
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
                  className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set #
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.sets}
                  onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                  className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Leave empty if not applicable"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date (optional)
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="grid grid-cols-1 gap-2 text-sm bg-gray-50 p-3 rounded md:grid-cols-5 md:items-center"
                      >
                        <span className="text-gray-600 md:col-span-1">
                          Set {set.set ?? set.sets}
                        </span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={getEditValue(set, 'weight')}
                          onChange={(e) => handleEditChange(set.id, 'weight', e.target.value)}
                          onBlur={() => handleEditBlur(set)}
                          className="text-gray-700 w-full px-2 py-1 border border-gray-300 rounded"
                          aria-label="Weight"
                        />
                        <input
                          type="number"
                          min="1"
                          value={getEditValue(set, 'reps')}
                          onChange={(e) => handleEditChange(set.id, 'reps', e.target.value)}
                          onBlur={() => handleEditBlur(set)}
                          className="text-gray-700 w-full px-2 py-1 border border-gray-300 rounded"
                          aria-label="Reps"
                        />
                        <input
                          type="number"
                          min="0"
                          value={getEditValue(set, 'rir')}
                          onChange={(e) => handleEditChange(set.id, 'rir', e.target.value)}
                          onBlur={() => handleEditBlur(set)}
                          className="text-gray-700 w-full px-2 py-1 border border-gray-300 rounded"
                          placeholder="RIR"
                          aria-label="RIR"
                        />
                        <span className="text-gray-500 md:text-right">
                          {set.weight}kg × {set.reps}
                          {set.rir !== '' && set.rir !== null ? `, RIR ${set.rir}` : ''}
                        </span>
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
