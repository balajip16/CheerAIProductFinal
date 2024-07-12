import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import Logo from "../assets/logo.png";
import GoogleSvg from "../assets/google.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import './AuthPage.css';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('User registered successfully');
      navigate('/');
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
              <h2>Sign Up</h2>
              <p>Please enter your details to create an account</p>
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
                <div className="login-center-buttons">
                  <button type="button" onClick={handleRegister}>Sign Up</button>
                  <button type="button">
                    <img src={GoogleSvg} alt="Google Icon" />
                    Sign Up with Google
                  </button>
                </div>
              </form>
            </div>
            <p className="login-bottom-p">
              Already have an account? <a href="/auth">Log In</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;