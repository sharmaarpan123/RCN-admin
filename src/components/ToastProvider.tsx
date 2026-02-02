"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 2600,
        style: {
          maxWidth: 360,
        },
      }}
    />
  );
}
