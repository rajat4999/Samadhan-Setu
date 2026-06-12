import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Landing from "./pages/Landing";
import StudentDashboard from "./pages/StudentDashboard";
import CaretakerDashboard from "./pages/CaretakerDashboard";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/caretaker-dashboard" element={<CaretakerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;