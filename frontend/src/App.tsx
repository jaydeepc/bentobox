import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Classification from './pages/Classification';
import Parsing from './pages/Parsing';

function App() {
  return (
    <Router>
      <div className="min-h-screen gradient-bg text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/classification" element={<Classification />} />
          <Route path="/parsing" element={<Parsing />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
