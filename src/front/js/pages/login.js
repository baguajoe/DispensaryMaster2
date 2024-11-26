// import React, { useState } from 'react';
// import { login } from './auth';
// import { useNavigate } from 'react-router-dom';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     const data = await login(email, password);
//     if (data.access_token) {
//       localStorage.setItem('token', data.access_token);
//       navigate('/products');
//     } else {
//       alert('Login failed: ' + data.error);
//     }
//   };

//   return (
//     <div>
//       <h1>Login</h1>
//       <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
//       <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
//       <button onClick={handleLogin}>Login</button>
//     </div>
//   );
// };

// export default Login;
