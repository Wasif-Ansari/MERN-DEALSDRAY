import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../components/LoginRegister.css";

function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");  
  const [Pwd, setPwd] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const resetForm = () => {
    setUserName("");
    setEmail("");
    setPwd("");
    setRole("user");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      if (isLogin) {
        // Handle login
        const response = await axios.post("http://localhost:8081/login", {
          userName,
          email,
          Pwd,
        });
  
        if (response.data.message === "Login successful") {
          localStorage.setItem("role", response.data.user.role);
          localStorage.setItem("userName", userName);
          localStorage.setItem("email", email);
  
          if (response.data.user.role === "admin") {
            navigate("/admin-dashboard");
          } else if (response.data.user.role === "user") {
            navigate("/user-dashboard");
          } else {
            alert("Invalid role!");
          }
        } else {
          alert(response.data.error || "Login failed. Please check your credentials and try again.");
        }
      } else {
        // Handle registration
        const response = await axios.post("http://localhost:8081/register", {
          userName,
          email,
          Pwd,
          role,
        });
  
        if (response.data.message === "User registered successfully") {
          alert("Registration successful! You can now log in.");
          setIsLogin(true);
          resetForm();
        } else {
          // Check for specific error messages
          if (response.data.error) {
            if (response.data.error === "Email already in use") {
              alert("This email is already registered. Please use a different email.");
            } else {
              alert(response.data.error || "Registration failed. Please try again.");
            }
          } else if (response.data.message === "An admin already exists") {
            alert("An admin already exists. Only one admin can be registered.");
          }
        }
      }
    } catch (err) {
      console.error("Request failed:", err.response?.data || err.message);
      alert("Check your credentials")
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container ">
      <div className="auth-toggle">
        <button onClick={handleToggle}>
          {isLogin ? "Switch to Register" : "Switch to Login"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={Pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
          />
        </div>
        {!isLogin && (
          <div className="form-group">
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}

        <button type="submit" className="btn1" disabled={loading}>
          {loading ? "Processing..." : isLogin ? "Login" : "Register"}
        </button>
      </form>
    </div>
  );
}

export default LoginRegister;
