"use client";

import { useEffect, useMemo, useState, createContext, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type UserContextType = {
  role: string;
  id?: string;
  name?: string;
  email?: string;
  imageUrl?: string;
};

const UserContext = createContext<UserContextType>({
  role: "listener",
});

export const useUserContext = () => {
  return useContext(UserContext);
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const getUser = useQuery(
    api.music.getUser,
    isSignedIn ? { userId: user?.id } : "skip"
  );
  const createUser = useMutation(api.music.createUserIfNeeded);
  const [userData, setUserData] = useState<any>(undefined);

  useEffect(() => {
    const initUser = async () => {
      if (isLoaded && isSignedIn && user) {
        // First try to get the existing user
        const existingUser = await getUser;
        if (!existingUser) {
          // If user doesn't exist, create them
          const newUser = await createUser({ userId: user.id });
          setUserData(newUser);
        } else {
          setUserData(existingUser);
        }
      }
    };

    initUser();
  }, [isLoaded, isSignedIn, user, getUser, createUser]);

  const contextValue = useMemo(
    () => ({
      ...userData,
      role:
        userData?.role || (user?.publicMetadata?.role as string) || "listener",
    }),
    [userData, user]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}
