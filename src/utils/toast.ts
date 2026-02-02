/**
 * Common toast helpers using react-hot-toast.
 * Use toastSuccess, toastError, toastWarning where needed.
 */
import toast from "react-hot-toast";

export const toastSuccess = (message: string) => {
  toast.dismiss();
  toast.success(message);
};

export const toastError = (message: string) => {
  toast.dismiss();
  toast.error(message);
};

export const toastWarning = (message: string) => {
  toast.dismiss();
  toast(message, { icon: "⚠️" });
};

export const toastInfo = (message: string) => {
  toast.dismiss();
  toast(message);
};
