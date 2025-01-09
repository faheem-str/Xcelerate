import logo from './logo.svg';
import './App.css';
import './index.css';
import Login from './Components/LoginPage/Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './Components/Dashboard/Dashboard';
import Layouts from './Components/Layouts/Layouts';
import NewDashboard from './Components/NewDashboard/NewDashboard';
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/XcelerateCRM" element={<Login />} />
      <Route path="/dashboard" element={<Layouts />} />
      <Route path="/newdashboard" element={<NewDashboard />} />
    </Routes>
  </Router>
  );
}

export default App;
