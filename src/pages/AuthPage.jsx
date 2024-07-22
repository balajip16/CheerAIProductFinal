import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import Logo from "../assets/logo.png";
import GoogleSvg from "../assets/google.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import './AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const errorMessages = {
    'auth/invalid-email': 'Invalid email address. Please include "@" in the email address.',
    'auth/user-disabled': 'User account is disabled.',
    'auth/user-not-found': 'User not found. Please check the email address.',
    'auth/wrong-password': 'Invalid credentials entered. Please check your password.',
  };

  const handleRegister = async () => {
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('User registered successfully');
      navigate('/chat');
    } catch (error) {
      console.error(error.message);
      const userFriendlyMessage = errorMessages[error.code] || 'An error occurred during sign up.';
      setError(userFriendlyMessage);
    }
  };

  const handleLogin = async () => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully');
      navigate('/chat');
    } catch (error) {
      console.error(error.message);
      const userFriendlyMessage = errorMessages[error.code] || 'Invalid credentials entered. Please try again.';
      setError(userFriendlyMessage);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/chat');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="authpage">
      <div className="login-main">
        <div className="login-left">
          <h1>Made for those who struggle.</h1>
        </div>
        <div className="divider"></div>
        <div className="login-right">
          <div className="login-right-container">
            <div className="login-logo">
              <img src={Logo} alt="Logo" />
            </div>
            <div className="login-center">
              <h2>Welcome back!</h2>
              <p>Please enter your details</p>
              {error && <p style={{ color: 'red', fontSize: '1.6rem', marginBottom: '10px', fontWeight: 'bold', textAlign: 'center' }}>{error}</p>}
              <form>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                />
                <div className="pass-input-div">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                  />
                  {showPassword ? (
                    <FaEyeSlash onClick={() => setShowPassword(!showPassword)} />
                  ) : (
                    <FaEye onClick={() => setShowPassword(!showPassword)} />
                  )}
                </div>
                <div className="login-center-options">
                  <a href="#" className="forgot-pass-link">Forgot password?</a>
                </div>
                <div className="login-center-buttons">
                  <button type="button" onClick={handleLogin}>Log In</button>
                  <button type="button">
                    <img src={GoogleSvg} alt="Google Icon" />
                    Log In with Google
                  </button>
                </div>
              </form>
            </div>
            <p className="login-bottom-p">
              Don't have an account? <a href="/signup">Sign Up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
