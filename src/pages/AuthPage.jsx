import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
	try {
	  await createUserWithEmailAndPassword(auth, email, password);
	  console.log('User registered successfully');
      navigate('/');
	} catch (error) {
	  console.error(error.message);
	}
  };

  const handleLogin = async () => {
	try {
	  await signInWithEmailAndPassword(auth, email, password);
	  console.log('User logged in successfully');
      navigate('/');
	} catch (error) {
	  console.error(error.message);
	}
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully');
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);


  return (
	<div>
	  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
	  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
	  <button onClick={handleRegister}>Register</button>
	  <button onClick={handleLogin}>Login</button>
	  <button onClick={handleLogout}>Logout</button>
	</div>
  );
};

export default AuthPage;
