// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const adminName = localStorage.getItem('userName'); // Get admin name from localStorage
 
  const handleLogout = () => {
    localStorage.clear(); // Clear localStorage
    navigate('/'); // Redirect to login page
  };
  if (!role) {
    navigate('/login');
    return;
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light  py-3" style={{ backgroundColor: '#007BFF', color: 'white' }}>
        <div className="container">
          <Link className="navbar-brand text-white" to="/admin-dashboard">Admin Dashboard</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link text-white" to="/admin-dashboard">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/admin-dashboard/employees-list">Employee List</Link>
              </li>
            </ul>
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <span className="navbar-text text-white me-3">Admin: {adminName}</span>
              </li>
              <li className="nav-item">
                <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="container mt-4">
                <h2>Dashboard</h2>
            </div>

      <div className="d-flex justify-content-center align-items-center vh-100 bg-light"> {/* Centering the welcome message */}
        <h3 className="text-center text-primary">Welcome to Admin Dashboard!</h3>
      </div>
    </>
  );
}

export default Navbar;
