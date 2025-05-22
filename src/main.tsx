import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// import "@fontsource/inter";

import { StatusBar, Style } from "@capacitor/status-bar";

const container = document.getElementById("root");
const root = createRoot(container!);

(async () => {
  try {
    await StatusBar.show();
    await StatusBar.setBackgroundColor({ color: "#dd2273" });
    await StatusBar.setStyle({ style: Style.Dark });
  } catch (error) {
    console.warn("Erro ao configurar StatusBar:", error);
  }

  root.render(
    // <React.StrictMode>
    <App />
    // </React.StrictMode>
  );
})();
