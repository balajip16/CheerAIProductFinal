import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from '../firebase/config'; // Import googleProvider
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
  const [error, setError] = useState('');

  const errorMessages = {
    'auth/invalid-email': 'Invalid email address. Please include "@" in the email address.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    // Add more error messages here if needed
  };

  const handleRegister = async () => {
    setError(''); // Clear previous error message
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user); // Send verification email
      console.log('User registered successfully. Verification email sent.');
      alert('Verification email sent. Please check your inbox and verify your email before logging in.');
      navigate('/login'); // Redirect to login page

    } catch (error) {
      const userFriendlyMessage = errorMessages[error.code] || 'An error occurred during sign up.';
      setError(userFriendlyMessage);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await sendEmailVerification(user); // Send verification email for Google sign-up
        alert('Verification email sent. Please check your inbox and verify your email before logging in.');
        auth.signOut();
      } else {
        navigate('/chat');
      }
    } catch (error) {
      console.error('Google sign-up error:', error.message);
      setError('Google sign-up failed. Please try again.');
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
              <h2>Sign Up</h2>
              <p>Please enter your details to create an account</p>
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
                <div className="login-center-buttons">
                  <button type="button" onClick={handleRegister}>Sign Up</button>
                  <button type="button" onClick={handleGoogleSignUp}>
                    <img src={GoogleSvg} alt="Google Icon" />
                    Sign Up with Google
                  </button>
                </div>
              </form>
            </div>
            <p className="login-bottom-p">
              Already have an account? <a href="/login">Log In</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
