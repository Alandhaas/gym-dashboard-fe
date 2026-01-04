import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ExerciseProvider } from './context/ExerciseContext';
import AppLayout from "./layout/AppLayout"

import Dashboard from './pages/Dashboard';
import AddTraining from './pages/AddTraining';
import History from './pages/History';

export default function App() {
  return (
    <ExerciseProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-training" element={<AddTraining />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </AppLayout>
      </Router>
    </ExerciseProvider>
  )
}
