import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applySettings, loadSettings } from "./pages/Settings";

applySettings(loadSettings());

createRoot(document.getElementById("root")!).render(<App />);
