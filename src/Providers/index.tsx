"use client";
import store from "@/store";
import React from "react";
import { Provider } from "react-redux";
import Progressbar from "./Progressbar";
import ReactQueryProvider from "./ReactQueryClient";
import { ToastProvider } from "@/Providers/ToastProvider";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";
// import FirebaseProvider from "./FirebaseProvider";

const CommonProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Progressbar>
        <ToastProvider />
        <ReactQueryProvider>
          <Provider store={store}>
            <GoogleMapsProvider>
              {children}
            </GoogleMapsProvider>
          </Provider>
        </ReactQueryProvider>
      </Progressbar>
    </>
  );
};

export default CommonProvider;
