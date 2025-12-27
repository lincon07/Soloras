import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Toaster } from "@/components/ui/sonner"
import Providers from "./providers";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Toaster position="bottom-center" />
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>,
);
