import React, { useState, useEffect } from "react";
import axios from "axios";

const LoginDialog = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const [token, setToken] = useState(""); // Store JWT token

  useEffect(() => {
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setIsLoggedIn(true);
      setToken(storedToken);
    }
  }, []);

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const credentials = {
      username: username,
      password: password,
    };
    // Make login request
    const response = await axios.post(
      "http://localhost:3001/api/user/login",
      credentials
    );
    console.log(response.data);
    const token = response.data;
    console.log(token);
    setToken(token);
    setIsLoggedIn(true);
    // Store token in localStorage
    localStorage.setItem("token", token);
    console.log(localStorage.getItem("token"));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken("");
    // Remove token from localStorage on logout
    localStorage.removeItem("token");
  };

  const handleRegister = () => {
    setShowRegisterDialog(true);
  };

  const handleCloseRegisterDialog = () => {
    setShowRegisterDialog(false);
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-center font-bold">Login</h2>
        <div>
          <label>
            Email:
            <input
              className="border-2"
              type="text"
              value={username}
              onChange={handleUsernameChange}
            />
          </label>
          <br />
          <label>
            Password:
            <input
              className="border-2"
              type="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </label>
          <br />
          <button
            className="justify-center px-4 py-1 bg-gray-400"
            onClick={handleLogin}
          >
            Login
          </button>
          <div className="flex">
            <p>No account?</p>
            <button className="text-blue-400" onClick={handleRegister}>
              Register
            </button>
          </div>
        </div>
      </div>
      {showRegisterDialog && (
        <RegisterDialog onClose={handleCloseRegisterDialog} />
      )}
    </div>
  );
};

const RegisterDialog = ({ onClose }) => {
  // Add your registration logic and UI here
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    // Handle login logic here
    const credentials = {
      email: email,
      password: password,
    };
    await axios.post("http://localhost:3001/api/user/register", credentials);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-center font-bold">Register</h2>

        <div>
          <label>
            Email:
            <input
              className="border-2"
              type="text"
              value={username}
              onChange={handleUsernameChange}
            />
          </label>
          <br />
          <label>
            Password:
            <input
              className="border-2"
              type="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </label>
          <br />
          <button
            className="justify-center px-4 py-1 bg-gray-400"
            onClick={handleRegister}
          >
            Register
          </button>
          <div className="flex">
            <p>No account?</p>
            <button className="text-blue-400" onClick={handleRegister}>
              Register
            </button>
          </div>
        </div>
        <button
          className="justify-center px-4 py-1 bg-gray-400"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LoginDialog;
