import React from 'react'
import {Route, Routes} from "react-router-dom"
import HomePage from './pages/HomePage'
import './App.css'
import LandingPage from './pages/LandingPage'

function App() {
  return (
    <div className="App">
      <Routes>
      <Route path="/" element={<LandingPage />}/>
        <Route path="/home" element={<HomePage/>}/>
      </Routes>
    </div>
  );
}

export default App;
