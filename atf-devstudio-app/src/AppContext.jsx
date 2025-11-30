// AppContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentDeployment, setCurrentDeployment] = useState(
    JSON.parse(localStorage.getItem('atf-dev-studio-current-deployment')) || null
  );
  useEffect(() => {
    if (currentDeployment)
      localStorage.setItem('atf-dev-studio-current-deployment', JSON.stringify(currentDeployment));
    else
      localStorage.removeItem('atf-dev-studio-current-deployment');
  }, [currentDeployment]);

  return (
    <AppContext.Provider value={{ currentDeployment, setCurrentDeployment }}>
      {children}
    </AppContext.Provider>
  );
}
