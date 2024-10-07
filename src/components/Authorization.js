import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role === 'admin') {
            navigate('/user-dashboard');
        } else if (role === 'user') {
            navigate('/user-dashboard');
        } else {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div>Redirecting...</div>
    );
}

export default Home;