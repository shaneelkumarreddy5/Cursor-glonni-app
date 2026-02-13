import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AdminAuthResult = {
  ok: boolean;
  message: string;
};

type AdminContextValue = {
  isLoggedIn: boolean;
  adminName: string;
  loginAdmin: (email: string, password: string) => AdminAuthResult;
  logoutAdmin: () => void;
};

const ADMIN_NAME = "Glonni Admin";

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  function loginAdmin(email: string, password: string): AdminAuthResult {
    if (!email.trim() || !password.trim()) {
      return {
        ok: false,
        message: "Enter both email and password to continue.",
      };
    }

    setIsLoggedIn(true);
    return {
      ok: true,
      message: "Admin login successful.",
    };
  }

  function logoutAdmin() {
    setIsLoggedIn(false);
  }

  const value = useMemo<AdminContextValue>(
    () => ({
      isLoggedIn,
      adminName: ADMIN_NAME,
      loginAdmin,
      logoutAdmin,
    }),
    [isLoggedIn],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
}
