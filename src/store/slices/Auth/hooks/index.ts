import { RootState } from "@/store";
import { useSelector } from "react-redux";



export const useAuth = () => {
  const auth = useSelector((s: RootState) => s.auth);
  return auth;
};
