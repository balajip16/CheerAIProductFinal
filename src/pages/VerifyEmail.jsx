import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { applyActionCode } from "firebase/auth";
import { auth } from '../firebase/config';
import Spinner from "../assets/Spinner-2.gif"; // Assuming you have a spinner image

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const oobCode = query.get('oobCode');

    const verifyEmail = async () => {
      try {
        if (oobCode) {
          await applyActionCode(auth, oobCode);
          // Email has been verified, now redirect
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          navigate('/login'); // If there's no oobCode, redirect to login
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        navigate('/login');
      }
    };

    verifyEmail();
  }, [location, navigate]);

  return (
    <div className="verification-page">
      <div className="verification-message">
        <h1>Email verification successful!</h1>
        <p>Redirecting to login page...</p>
        <img src={Spinner} alt="Loading" className="spinner" />
      </div>
    </div>
  );
};

export default VerifyEmail;
