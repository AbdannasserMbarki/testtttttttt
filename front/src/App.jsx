
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const links=[
        {name :"Home", path :"/"},
        {name :"Login", path :"/login"},
        {name :"Teacher", path :"/login/teacher"},
        {name :"Admin", path :"/login/admin"},
        {name :"Timetable", path :"/timetable"}, // accessible to everyone 
  ]

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
