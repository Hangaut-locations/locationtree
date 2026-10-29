import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import ReactQueryProvider from "./components/provider/ReactQueryProvider.tsx";
import { Toaster } from "react-hot-toast";
import "./index.css";
import AppProvider from "./components/provider/AppProvider.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <AppProvider>
        <ReactQueryProvider>
          <App />
          <Toaster position="top-center" />
        </ReactQueryProvider>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
);
