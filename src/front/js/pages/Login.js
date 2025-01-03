import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from "./Auth"; // Correct import path



const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        const data = await login(email, password);

        if (data.success) {
            alert("Login successful! ");
            // navigate("/"); // Redirect to the login page
            console.log("data from login", data)
            sessionStorage.setItem("token", data.data.access_token)
            sessionStorage.setItem("currentUser", JSON.stringify(data.data.user))

        } else {
            // const errorMessage=data.data?.message || data.error || "unknown error ocurred";
            console.log("login failed message", data)
            const errorMessage = data.data.error
            alert(`Login failed: ${errorMessage}`);
        }
    };


    return (
        <div className="login-container">
            <h1>Login</h1>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
            <Link to="/forgot-password">Forgot Password?</Link>
        </div>


    );
};

export default Login;
