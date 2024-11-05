import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Classification from './pages/Classification';
import Parsing from './pages/Parsing';
import Matching from './pages/Matching';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/classification" element={<Classification />} />
        <Route path="/parsing" element={<Parsing />} />
        <Route path="/matching" element={<Matching />} />
      </Routes>
    </Router>
  );
}

export default App;
