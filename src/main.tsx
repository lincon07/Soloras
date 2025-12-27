import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Toaster } from "@/components/ui/sonner"
import Providers from "./providers";
import { Menu } from "./menu-bar";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Providers>
      <Menu />
      <App />
    </Providers>
  </React.StrictMode>,
);
