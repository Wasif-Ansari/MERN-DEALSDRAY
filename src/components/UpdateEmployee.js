import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams,Link } from 'react-router-dom';

function UpdateEmployee() {
    const [Name, setName] = useState('');
    const [Email, setEmail] = useState('');
    const [Mobile, setMobile] = useState('');
    const [Designation, setDesignation] = useState('HR'); // Default value
    const [gender, setGender] = useState('M'); // Default value
    const [Course, setCourse] = useState(''); // Single course value
    const [Image, setImage] = useState(null);
    const [OriginalImage, setOriginalImage] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { Id } = useParams();

    useEffect(() => {
        const fetchEmployee = async () => {
            const role = localStorage.getItem('role');
            if (!role || role !== 'admin') {
                console.error('Role not found in localStorage');
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:8081/admin-dashboard/employees-list/${Id}`, {
                    headers: { 'Role': role }
                });
                const data = response.data;

                setName(data.Name);
                setEmail(data.Email);
                setMobile(data.Mobile);
                setDesignation(data.Designation);
                setGender(data.gender);
                setCourse(data.Course); // Assuming this is a single course string
                setOriginalImage(data.Image);
            } catch (err) {
                console.error('Error fetching employee data:', err.response ? err.response.data : err.message);
            }
        };

        fetchEmployee();
    }, [Id, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Client-side validation
        
        const mobileRegex = /^[0-9]{10}$/;

        // Check email format
        const emailPattern =/^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.(com|in|org|net|edu)$/i;
        if (!emailPattern.test(Email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Check mobile format (numeric and exactly 10 digits)
        if (!mobileRegex.test(Mobile)) {
            alert('Please enter a valid 10-digit mobile number.');
            return;
        }
        if (!Image) {
            alert('Please upload an image file.');
            return;
        }

         // File type validation for image (jpg and png)
    if (Image) {
        const validImageTypes = ['image/jpeg', 'image/png'];
        if (!validImageTypes.includes(Image.type)) {
            alert('Please upload a valid image file (JPG or PNG only).');
            return;
        }
    }


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

    const role = localStorage.getItem('role');
    if (!role || role !== 'admin') {
        console.error('Role not found in localStorage');
        navigate('/login');
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
            formData.append('Course', Course); // Send selected course

            if (Image) formData.append('Image', Image);

            const response = await axios.put(`http://localhost:8081/admin-dashboard/employees-list/update/${Id}`, formData, {
                headers: {
                    'Role': role,
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Record updated:', response.data);
            if (Image) {
                const newImageURL = `http://localhost:8081${response.data.Image}`;
                setOriginalImage(newImageURL);
            }

            navigate('/admin-dashboard/employees-list');
        } catch (err) {
            console.error('Error updating employee:', err.response ? err.response.data : err.message);
        }
    };

    const handleCourseChange = (courseName) => {
        setCourse(courseName); // Set the selected course
    };
    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };
    const adminName = localStorage.getItem('userName');

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
                            <span className="navbar-text text-white me-3">Admin:{adminName}</span> 
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
            <h2>Edit Employee</h2>
        </div>
        
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        <div className='d-flex vh-100 bg-light justify-content-center align-items-center'>
        <div className="bg-white rounded p-4 shadow" style={{ maxHeight: "80vh", overflowY: "auto", width: "50%" }}>
                <form onSubmit={handleSubmit}>
                    <div className='mb-2'>
                        <label htmlFor='name' className='form-label'>Name</label>
                        <input
                            type="text"
                            id='name'
                            value={Name}
                            onChange={(e) => setName(e.target.value)}
                            className='form-control'
                            placeholder='Enter Name'
                            required
                        />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor='email' className='form-label'>Email</label>
                        <input
                            type="email"
                            id='email'
                            value={Email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='form-control'
                            placeholder='Enter Email'
                            required
                        />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor='mobileNo' className='form-label'>Mobile No</label>
                        <input
                            type="text"
                            id='mobileNo'
                            value={Mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className='form-control'
                            placeholder='Enter Mobile No'
                            required
                        />
                    </div>
                    <div className='mb-2'>
                        <label htmlFor='designation' className='form-label'>Designation</label>
                        <select
                            id='designation'
                            value={Designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className='form-control'
                            required
                        >
                            <option value="HR">HR</option>
                            <option value="Manager">Manager</option>
                            <option value="Sales">Sales</option>
                        </select>
                    </div>
                    <div className='mb-2'>
                        <label className='form-label'>Gender</label>
                        <div>
                            <input
                                type="radio"
                                id='genderM'
                                name='gender'
                                value='M'
                                checked={gender === 'M'}
                                onChange={(e) => setGender(e.target.value)}
                            />
                            <label htmlFor='genderM' className='form-label'>Male</label>
                        </div>
                        <div>
                            <input
                                type="radio"
                                id='genderF'
                                name='gender'
                                value='F'
                                checked={gender === 'F'}
                                onChange={(e) => setGender(e.target.value)}
                            />
                            <label htmlFor='genderF' className='form-label'>Female</label>
                        </div>
                    </div>
                    <div className='mb-2'>
                        <label className='form-label'>Course</label>
                        <div>
                            {['MCA', 'BCA', 'BSC'].map(course => (
                                <div key={course}>
                                    <input
                                        type="checkbox"
                                        id={course}
                                        checked={Course === course} // Check if this course is selected
                                        onChange={() => handleCourseChange(course)} // Set selected course
                                    />
                                    <label htmlFor={course} className='form-label'>{course}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='mb-2'>
                        <label className='form-label'>Current Image</label>
                        <div>
                            {OriginalImage ? (
                                <img
                                    alt={Name}
                                    src={`http://localhost:8081${OriginalImage}`}
                                    style={{ width: '100px', height: '80px' }}
                                />
                            ) : (
                                <p>No image available</p>
                            )}
                        </div>
                    </div>
                    <div className='mb-2'>
                        <label htmlFor='image' className='form-label'>Upload New Image</label>
                        <input
                            type="file"
                            id='Image'
                            name='Image'
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                            className='form-control'
                        />
                    </div>
                    <button type='submit' className='btn btn-success'>Update</button>
                </form>
            </div>
        </div>
        </div>
    );
}

export default UpdateEmployee;
