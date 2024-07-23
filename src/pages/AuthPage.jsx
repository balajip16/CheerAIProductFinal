import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from '../firebase/config'; // Import googleProvider
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

  const handleLogin = async () => {
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        console.log('User logged in successfully');
        navigate('/chat');
      } else {
        setError('Please verify your email before logging in.');
        auth.signOut();
      }
    } catch (error) {
      console.error(error.message);
      const userFriendlyMessage = errorMessages[error.code] || 'Invalid credentials entered. Please try again.';
      setError(userFriendlyMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      if (user.emailVerified) {
        console.log('User signed in with Google');
        navigate('/chat');
      } else {
        setError('Please verify your email before logging in.');
        auth.signOut();
      }
    } catch (error) {
      console.error('Google sign-in error:', error.message);
      setError('Google sign-in failed. Please try again.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        navigate('/chat');
      } else if (user) {
        setError('Please verify your email before logging in.');
        auth.signOut();
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
                {error && <p style={{ color: 'red', fontSize: '1.6rem', marginBottom: '10px', fontWeight: 'bold', textAlign: 'center' }}>{error}</p>}
                <div className="login-center-buttons">
                  <button type="button" onClick={handleLogin}>Log In</button>
                  <button type="button" onClick={handleGoogleSignIn}>
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
