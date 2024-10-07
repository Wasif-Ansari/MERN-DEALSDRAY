import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function User() {
    const [userData, setUserData] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
          try {
            const role = localStorage.getItem('role');
            const email = localStorage.getItem('email');
            
            console.log('role: ', role);
            
    
            if (role !== 'user') {
              navigate('/login');
              return;
            }
           
            const response = await axios.get('http://localhost:8081/user-dashboard', {
                params: { email },
              headers: {
                'Role': role,
                'Content-Type': 'multipart/form-data'
                
            }
            });
            console.log('response: ', response);
    
            setUserData(response.data);
          } catch (err) {
            console.error('Error fetching user data:', err.response || err.message);
            setError(err.response ? err.response.data : err.message);
          }
        };
    
        fetchUserData();
      }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('userName');
        navigate('/');
    };
    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-GB', options).replace(/ /g, '-');
    };
    const userName = localStorage.getItem('userName');

    return (

        <>
        <nav className="navbar navbar-expand-lg navbar-light bg-primary">
        <div className="container">
          
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              
              
            </ul>
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <span className="navbar-text text-white me-3">
                  User: {userName}
                </span>
              </li>
              <li className="nav-item">
                <button className="btn btn-danger" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <br/>
      
      <div className="container mt-5">
        <h2 className="text-center mb-4">User Dashboard</h2>
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="table-responsive">
              <table className="table table-bordered table-hover text-center">
                <thead className="table-primary">
            
              <tr>
                <th>Unique Id</th>
                <th>Image Uploaded</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile No</th>
                <th>Designation</th>
                <th>Gender</th>
                <th>Course</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {userData.map((emp, index) => (
                <tr key={index}>
                  <td>1</td>
                  <td>
                    {emp.Image ? (
                      <img
                        src={`http://localhost:8081${emp.Image}`}
                        alt={emp.Name}
                        width="100"
                        height="80px"
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td>{emp.Name}</td>
                  <td>{emp.Email}</td>
                  <td>{emp.Mobile}</td>
                  <td>{emp.Designation}</td>
                  <td>{emp.gender}</td>
                  <td>{emp.Course}</td>
                  <td>{formatDate(emp.Createdate)}</td>
                </tr>
              ))}
            </tbody>
            
          </table>
          </div>
        </div>
        </div>
        </div>
      </>
    );
}

export default User;
