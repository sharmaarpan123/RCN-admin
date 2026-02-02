"use client";
import store from "@/store";
import React from "react";
import { Provider } from "react-redux";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Progressbar from "./Progressbar";
import ReactQueryProvider from "./ReactQueryClient";
// import FirebaseProvider from "./FirebaseProvider";

const CommonProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>

      <Progressbar>
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
