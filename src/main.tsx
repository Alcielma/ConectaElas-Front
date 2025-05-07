import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { StatusBar, Style } from "@capacitor/status-bar";

// import "@fontsource/inter";

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
