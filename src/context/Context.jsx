// In Context.jsx, replace the runChat function with the sendMessage function

import { createContext, useState } from "react";
import { getAuth } from "firebase/auth"; // Ensure you have this import if you're using Firebase for authentication

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");
  const [messages, setMessages] = useState([]); // Added state for messages
  const [tempImage, setTempImage] = useState(null);

  const delayPara = (index, nextWord) => {
    setTimeout(function () {
      setResultData((prev) => prev + nextWord);
    }, 75 * index);
  };

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
  };

  const sendImage = async (imageFile) => {
    setTempImage(imageFile);
  };

  const sendMessage = async (message) => {
    setMessages(prevMessages => [
      ...prevMessages,
      { text: message, sender: 'user' }
    ]);

    try {
      const user = getAuth().currentUser;
      const token = await user.getIdToken();
      const userId = user.uid;
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('message', message);
  
      if (tempImage) {
        formData.append('image', tempImage);
      }
  
      const response = await fetch(`https://api.cheersai.co/chat/`, { // change this to your server URL
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      setMessages(prevMessages => [
        ...prevMessages,
        { text: data.response, sender: 'bot' }
      ]);
      setShowResult(true);
      setLoading(false); 
      setResultData(data.response);
    } catch (error) {
      console.error("Failed to send message: ", error);
      setLoading(false); 
    }
  };

  const onSent = () => {
    sendMessage(input);
    setInput("");
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    recentPrompt,
    setRecentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    newChat,
    messages,
    setMessages,
    sendImage,
  };
  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;