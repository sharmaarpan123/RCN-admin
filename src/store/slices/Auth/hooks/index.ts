import { RootState } from "@/store";
import { useSelector } from "react-redux";

export const useCurrency = () => {
  const { currency, currencySymbol } = useSelector((s: RootState) => s.auth);
  return { currency, currencySymbol };
};

export const useAuth = () => {
  const auth = useSelector((s: RootState) => s.auth);
  return auth;
};
