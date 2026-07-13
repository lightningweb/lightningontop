import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applySettings, loadSettings } from "./pages/Settings";
import { applyTheme, getLiveConfig, refreshConfigFromCloud } from "./lib/lightning";
import { applyColorTheme, loadColorTheme } from "./lib/themes";

applySettings(loadSettings());
applyTheme(getLiveConfig());
applyColorTheme(loadColorTheme());

// Pull the latest cloud config in the background; if it changes, refresh once.
refreshConfigFromCloud().then((changed) => {
  if (changed) window.location.reload();
});

createRoot(document.getElementById("root")!).render(<App />);
