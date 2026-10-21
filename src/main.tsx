import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "@/app/App";
import { AppProviders } from "@/app/providers/AppProviders";
import { AppToaster } from "@/shared/components/ui/AppToaster";
import "@/styles/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The application root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <App />
      <AppToaster />
    </AppProviders>
  </StrictMode>,
);
