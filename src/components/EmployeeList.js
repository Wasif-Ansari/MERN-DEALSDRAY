import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Admin() {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const role = localStorage.getItem('role');
        const storedUserName = localStorage.getItem('userName');

        if (storedUserName) {
          setUserName(storedUserName);
        }

        if (!role) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:8081/admin-dashboard/employees-list', {
          headers: { 'Role': role },
        });

        if (response.data.employees) {
          setEmployees(response.data.employees);
        }
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchEmployees();
  }, [navigate]);

  const handleDelete = async (Id) => {
    const role = localStorage.getItem('role');

    try {
      if (!role || role !== 'admin') {
        navigate('/login');
        return;
      }

      const response = await axios.delete(`http://localhost:8081/admin-dashboard/employees-list/delete/${Id}`, {
        headers: { role: 'admin' },
      });

      if (response.status === 200) {
        setEmployees((prevEmployees) => prevEmployees.filter((emp) => emp.Id !== Id));
      }
    } catch (err) {
      console.error('Error deleting employee:', err.response ? err.response.data : err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const filteredEmployees = employees.filter((emp) => {
    const searchLower = searchQuery.toLowerCase();
    const searchNumber = Number(searchQuery);
    const isValidNumber = !isNaN(searchNumber);
  
    // Check if the employee ID matches the number entered in the search
    const matchesId = isValidNumber && emp.Id === searchNumber;
  
    // Check if the employee Name matches the string entered in the search
    const matchesName = emp.Name && emp.Name.toLowerCase().includes(searchLower);
  
    // Check if the employee Email matches the string entered in the search
    const matchesEmail = emp.Email && emp.Email.toLowerCase().includes(searchLower);
  
    // Format the date to 'dd-MMM-yy' (like '13-Feb-21')
    const formattedDate = emp.Createdate && new Date(emp.Createdate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  
    // Check if the formatted date matches the search query
    const matchesDate = formattedDate && formattedDate.toLowerCase().includes(searchLower);
  
    // Return true if any of the conditions match
    return matchesId || matchesName || matchesEmail || matchesDate;
  });
  

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-GB', options).replace(/ /g, '-');
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg  py-3 navbar-light bg-primary">
        <div className="container">
          <Link className="navbar-brand text-white" to="/admin-dashboard">
            Admin Dashboard
          </Link>
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
              <li className="nav-item">
                <Link className="nav-link text-white" to="/admin-dashboard">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link text-white"
                  to="/admin-dashboard/employees-list"
                >
                  Employee List
                </Link>
              </li>
            </ul>
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <span className="navbar-text text-white me-3">
                  Admin: {userName}
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
      <h2 className="container mt-4">Employee List</h2>
      <div className="d-flex vh-100 bg-light justify-content-center align-items-start p-3">
        <div
          className="bg-white rounded p-3"
          style={{ maxHeight: "80vh", overflowY: "auto", width: "100%" }}
        >
          <div className="d-flex justify-content-end mb-3">
            <p className="mb-0 me-3">
              Total Employees: {filteredEmployees.length}
            </p>
            <Link to="/admin-dashboard/create" className="btn btn-primary">
              Create Employee
            </Link>
          </div>
          <div
            className="mb-3 d-flex align-items-center"
            style={{ width: "25%", marginLeft: "auto" }}
          >
            <label htmlFor="search" className="form-label me-2">
              Search
            </label>
            <input
              id="search"
              type="text"
              placeholder="Enter Search Keyword"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Unique Id</th>
                <th>Image Uploaded</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile No</th>
                <th>Designation</th>
                <th>Gender</th>
                <th>Course</th>
                <th>Created date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, index) => (
                <tr key={index}>
                  <td>{emp.Id}</td>
                  <td>
                    {emp.Image ? (
                      <img
                        alt={emp.Name}
                        src={`http://localhost:8081${emp.Image}`}
                        style={{ width: "100px", height: "80px" }}
                      />
                    ) : (
                      <p>No Image</p>
                    )}
                  </td>
                  <td>{emp.Name}</td>
                  <td>{emp.Email}</td>
                  <td>{emp.Mobile}</td>
                  <td>{emp.Designation}</td>
                  <td>{emp.gender}</td>
                  <td>{emp.Course}</td>
                  <td>{formatDate(emp.Createdate)}</td>
                  <td>
                    <Link
                      to={`/admin-dashboard/employees-list/update/${emp.Id}`}
                      className="btn btn-primary"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(emp.Id)}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Admin;
