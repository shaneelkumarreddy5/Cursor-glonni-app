import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./routes/AppRouter";
import { CommerceProvider } from "./state/CommerceContext";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <CommerceProvider>
        <AppRouter />
      </CommerceProvider>
    </BrowserRouter>
  </StrictMode>,
);
