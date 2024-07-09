import React from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Main from "./components/Main/Main";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/config";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";


const App = () => {
  const [user, loading] = useAuthState(auth);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsAuthReady(true);
    }
  }, [loading]);

  if (!isAuthReady) {
    return <div>Loading...</div>; //Loading indicator
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            loading ? (
              <div>Loading...</div> // Loading indicator
            ) : user ? (
              <>
                <Sidebar />
                <Main />
              </>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
