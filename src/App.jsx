import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EconomyDashboard from './components/EconomyDashboard';
import Magazine from './pages/Magazine';
import './App.css';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<EconomyDashboard />} />
          <Route path="/linhvodanh2004" element={<Magazine />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
