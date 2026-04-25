import { useEffect } from "react";
import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import AIChatbot from '../components/AIChatbot'

const DefaultLayout = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "#/login";
  }
  if (!localStorage.getItem("user")) {
 window.location.href = "#/login";
}
}, []);
  return (
    <div>
      <AppSidebar role={user?.role} />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
      <AIChatbot/>
    </div>
  );
};

export default DefaultLayout
