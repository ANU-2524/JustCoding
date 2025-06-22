import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import MainEditor from "./components/MainEditor";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor" element={<MainEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
