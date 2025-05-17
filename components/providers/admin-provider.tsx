"use client";

import React, { createContext, useContext, useState } from "react";

type AdminContextType = {
  activePage: string;
  setActivePage: (page: string) => void;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <AdminContext.Provider value={{ activePage, setActivePage }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
