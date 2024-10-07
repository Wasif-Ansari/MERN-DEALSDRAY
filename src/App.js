import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import EmployeeList from './components/EmployeeList';
import User from './components/User'
import Authorization from './components/Authorization';
import LoginRegister from './components/LoginRegister'
import CreateEmployee from './components/CreateEmployee'
import UpdateEmployee from './components/UpdateEmployee'
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';



function App() {
  return (
    
    
    <Router>
      <Routes>
      <Route path='/' element={<LoginRegister/>}/>
      <Route path='/admin-dashboard' element={<AdminDashboard/>}/>
      <Route path='/admin-dashboard/employees-list' element={<EmployeeList/>}/>
      <Route path='/user-dashboard' element={<User/>}/>
      <Route path='/authorization' element={<Authorization/>}/>
      <Route path='/admin-dashboard/create' element={<CreateEmployee/>}/>
      <Route path='/admin-dashboard/employees-list/update/:Id' element={<UpdateEmployee/>}/>
      </Routes>
    </Router>
 
    
    
  );
}

export default App;