import React, { useContext, useState } from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import DarkMode from "./DarkMode";
import bulb from '../../assets/bulb_icon.png'


const Sidebar = () => {
  const { onSent, prevPrompts, setRecentPrompt, newChat } = useContext(Context);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const loadPrompt = async (prompt) => {
    setRecentPrompt(prompt);
    await onSent(prompt);
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      console.log('User logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="sidebar">
      <div className="top">
        <div onClick={() => newChat()} className="new-chat">
          <img src={assets.plus_icon} alt="New Chat" />
        </div>
        <div className="recent">
          {prevPrompts.map((item, index) => (
            <div key={index} onClick={() => loadPrompt(item)} className="recent-entry">
              <img src={assets.message_icon} alt="Recent" />
            </div>
          ))}
        </div>
      </div>
      <div className="bottom">
        <div className="bottom-item">
          <img src={assets.question_icon} alt="Help" />
          <div className="tooltip">
            Got questions or need assistance? <br />
            Reach out to the CheersAI team at 
            <a className="email-link" href="mailto:dhruvreddy05@gmail.com"> dhruvreddy05@gmail.com. </a>
            Our AI therapist securely remembers all chat and call conversations, ensuring your privacy.
            We're proud to offer a free platform dedicated to supporting mental health. Led by a passionate
            team, we're here to help you navigate your journey. For data deletion, privacy concerns, or any
            other inquiries, don't hesitate to contact us.
          </div>
        </div>
        <div className="bottom-item" onClick={() => setShowLogoutModal(true)}>
        <img src={assets.setting_icon} alt="Settings" style={{ width: "22px", height:"20px", marginLeft:"5px" }} />

        </div>
        <div className="bottom-item">
          <img src= {bulb} alt="Dark Mode" className="mydarkmodeIcon" />
          <DarkMode />
        </div>
      </div>

      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <p>Are you sure you want to log out?</p>
            <div className="logout-buttons">
              <button onClick={handleLogout}>Log Out</button>
              <button onClick={() => setShowLogoutModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
