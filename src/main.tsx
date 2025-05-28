import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { StatusBar, Style } from "@capacitor/status-bar";

// import "@fontsource/inter";


const container = document.getElementById("root");
const root = createRoot(container!);



await StatusBar.show();

await StatusBar.setBackgroundColor({ color: "#dd2273" });

await StatusBar.setStyle({ style: Style.Dark });
root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
