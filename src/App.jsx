import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ExerciseProvider, useExercise } from './context/ExerciseContext';
import AppLayout from './layout/AppLayout';

import Dashboard from './pages/Dashboard';
import AddTraining from './pages/AddTraining';
import History from './pages/History';
import Login from './components/Login';

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-training" element={<AddTraining />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <ExerciseProvider>
      <Router>
        <AuthGate />
      </Router>
    </ExerciseProvider>
  );
}

function AuthGate() {
  const { user } = useExercise();

  if (!user) {
    return <Login />;
  }

  return <AppRoutes />;
}
