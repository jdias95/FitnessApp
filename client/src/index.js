import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "normalize.css";
import { AppStateProvider } from "./RootContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AppStateProvider>
    <App />
  </AppStateProvider>
);
