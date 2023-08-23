import React, { useContext, useEffect, useState } from "react";

export const AppStateContext = React.createContext();

export function AppStateProvider({ children }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AppStateContext.Provider
      value={{ email, setEmail, password, setPassword }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  return useContext(AppStateContext);
}
