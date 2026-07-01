import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Keep-alive: pinga a funcao a cada 4min para evitar cold start da Netlify Function
const ping = () => fetch("/.netlify/functions/query").catch(() => {});
ping();
setInterval(ping, 4 * 60 * 1000);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
