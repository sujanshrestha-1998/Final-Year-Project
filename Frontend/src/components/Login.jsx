import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post("http://localhost:3000/api/login", {
        email,
        password,
      });

      const { user, role } = response.data;

      // Handle routing based on role
      if (role === "students") {
        navigate("/student-dashboard");
      } else if (role === "teachers" || role === "rte") {
        navigate("/teacher-dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Handle error appropriately
    }
  };

  return <div>{/* Render your login form here */}</div>;
};

export default Login;
