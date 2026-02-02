"use client";
import store from "@/store";
import React from "react";
import { Provider } from "react-redux";
import Progressbar from "./Progressbar";
import ReactQueryProvider from "./ReactQueryClient";
import { ToastProvider } from "@/Providers/ToastProvider";
// import FirebaseProvider from "./FirebaseProvider";

const CommonProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Progressbar>
        <ToastProvider />
        <ReactQueryProvider>
          <Provider store={store}>
            {children}
            {/* <FirebaseProvider>{children}</FirebaseProvider> */}
          </Provider>
        </ReactQueryProvider>
      </Progressbar>
    </>
  );
};

export default CommonProvider;
