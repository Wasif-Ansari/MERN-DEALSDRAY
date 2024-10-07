import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function CreateEmployee() {
    const [Name, setName] = useState('');
    const [Email, setEmail] = useState('');
    const [Mobile, setMobile] = useState('');
    const [Designation, setDesignation] = useState('HR'); // Default value
    const [gender, setGender] = useState('M'); // Default value
    const [Course, setCourse] = useState(''); // Single course value
    const [Image, setImage] = useState(null); // Keep image as file
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleImageChange = (event) => {
        setImage(event.target.files[0]); // Set image file directly
    };

    const emailPattern = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.(com|org|net|edu)$/i;
    const mobilePattern = /^[0-9]{10}$/;
    const checkDuplicate = async () => {
        try {
            const response = await axios.post('http://localhost:8081/admin-dashboard/check-duplicate', {
                Email,
                Mobile,
            });
            if (response.data.exists) {
                return response.data.message;
            }
            return '';
        } catch (err) {
            console.error('Error checking duplicates:', err);
            return 'Error checking duplicates';
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!emailPattern.test(Email)) {
            alert('Please enter a valid email address');
            return;
        }

        if (!mobilePattern.test(Mobile)) {
            alert('Please enter a valid 10-digit mobile number.');
            return;
        }

        if (!Image) {
            alert('Please upload an image file.');
            return;
        }

        const fileExtension = Image.name.split('.').pop().toLowerCase();
        const validExtensions = ['jpg', 'png'];
        if (!validExtensions.includes(fileExtension)) {
            alert('Please upload an image file (jpg, or png).');
            return;
        }

           // Check for duplicate email or mobile number
           const duplicateError = await checkDuplicate();
           if (duplicateError) {
               setErrorMessage(duplicateError);
               return;
           }

        try {
            const role = localStorage.getItem('role');
            if (!role || role !== 'admin') {
                console.error('Role not found in localStorage');
                navigate('/login');
                return;
            }

            const formData = new FormData();
            formData.append('Name', Name);
            formData.append('Email', Email);
            formData.append('Mobile', Mobile);
            formData.append('Designation', Designation);
            formData.append('gender', gender);
            formData.append('Course', Course);
            if (Image) {
                formData.append('Image', Image);
            }

            const response = await axios.post('http://localhost:8081/admin-dashboard/create', formData, {
                headers: {
                    'Role': role,
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Record created:', response.data);
            navigate('/admin-dashboard/employees-list');
        } catch (err) {
            console.error('Error creating employee:', err.response ? err.response.data : err.message);
        }
    };

    const handleCourseChange = (courseName) => {
        setCourse(courseName);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const adminName = localStorage.getItem('userName'); // Retrieve admin name from localStorage

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-primary">
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
                                <Link className="nav-link text-white" to="/admin-dashboard/employees-list">
                                    Employee List
                                </Link>
                            </li>
                        </ul>
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <span className="navbar-text text-white me-3">Admin:{adminName}</span> {/* Display admin name */}
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

            {/* Heading for Create Employee */}
            <div className="container mt-4">
                <h2>Create Employee</h2>
            </div>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            {/* Create Employee Form */}
            <div className="d-flex vh-100 bg-light justify-content-center align-items-center">
                <div className="bg-white rounded p-4 shadow" style={{ maxHeight: "80vh", overflowY: "auto", width: "50%" }}>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-2">
                            <label htmlFor="Name" className="form-label">Name</label>
                            <input
                                type="text"
                                id="Name"
                                value={Name}
                                onChange={(e) => setName(e.target.value)}
                                className="form-control"
                                placeholder="Enter Name"
                                required
                            />
                        </div>
                        <div className="mb-2">
                            <label htmlFor="Email" className="form-label">Email</label>
                            <input
                                type="email"
                                id="Email"
                                value={Email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-control"
                                placeholder="Enter Email"
                                required
                            />
                        </div>
                        <div className="mb-2">
                            <label htmlFor="MobileNo" className="form-label">Mobile No</label>
                            <input
                                type="text"
                                id="MobileNo"
                                value={Mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                className="form-control"
                                placeholder="Enter Mobile No"
                                required
                            />
                        </div>
                        <div className="mb-2">
                            <label htmlFor="Designation" className="form-label">Designation</label>
                            <select
                                id="Designation"
                                value={Designation}
                                onChange={(e) => setDesignation(e.target.value)}
                                className="form-control"
                                required
                            >
                                <option value="HR">HR</option>
                                <option value="Manager">Manager</option>
                                <option value="Sales">Sales</option>
                            </select>
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Gender</label>
                            <div>
                                <input
                                    type="radio"
                                    id="genderM"
                                    name="gender"
                                    value="M"
                                    checked={gender === "M"}
                                    onChange={(e) => setGender(e.target.value)}
                                />
                                <label htmlFor="genderM" className="form-label">Male</label>
                            </div>
                            <div>
                                <input
                                    type="radio"
                                    id="genderF"
                                    name="gender"
                                    value="F"
                                    checked={gender === "F"}
                                    onChange={(e) => setGender(e.target.value)}
                                />
                                <label htmlFor="genderF" className="form-label">Female</label>
                            </div>
                        </div>
                        <div className="mb-2">
                            <label className="form-label">Course</label>
                            <div>
                                <input
                                    type="checkbox"
                                    id="MCA"
                                    checked={Course === "MCA"}
                                    onChange={() => handleCourseChange("MCA")}
                                />
                                <label htmlFor="MCA" className="form-label">MCA</label>
                            </div>
                            <div>
                                <input
                                    type="checkbox"
                                    id="BCA"
                                    checked={Course === "BCA"}
                                    onChange={() => handleCourseChange("BCA")}
                                />
                                <label htmlFor="BCA" className="form-label">BCA</label>
                            </div>
                            <div>
                                <input
                                    type="checkbox"
                                    id="BSC"
                                    checked={Course === "BSC"}
                                    onChange={() => handleCourseChange("BSC")}
                                />
                                <label htmlFor="BSC" className="form-label">BSC</label>
                            </div>
                        </div>
                        <div className="mb-2">
                            <label htmlFor="image" className="form-label">Upload Image</label>
                            <input
                                type="file"
                                id="Image"
                                name="Image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Create</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateEmployee;
