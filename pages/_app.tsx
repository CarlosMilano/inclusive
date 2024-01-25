import "@/styles/globals.css";
import type { AppProps } from "next/app";
import dotenv from "dotenv";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "@/config/firebase";
import Header from "@/components/Header";

dotenv.config();

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    auth.onAuthStateChanged((UserCredentials: User | null) => {
      setUser(UserCredentials);
      console.log(UserCredentials);
    });
  }, []);

  useEffect(() => {
    if (user === null) {
      if (router.pathname !== "/") router.push("/");
    } else if (user) {
      if (router.pathname === "/") router.push("/inicio");
    }
  }, [user]);

  return router.pathname === "/" || user ? (
    <>
      {user && <Header />}
      <Component {...pageProps} />
    </>
  ) : (
    <div className="flex justify-center items-center min-h-screen min-w-screen bg-white transition-opacity">
      <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
    </div>
  );
}
