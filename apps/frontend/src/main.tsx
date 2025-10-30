import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "antd/es/style/reset";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
