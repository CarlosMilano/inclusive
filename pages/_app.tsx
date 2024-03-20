import "@/styles/globals.css";
import type { AppProps } from "next/app";
import dotenv from "dotenv";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "@/config/firebase";
import Header from "@/components/Header";
import { Box, CircularProgress } from "@mui/material";
import { NextUIProvider } from "@nextui-org/system";

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
      <NextUIProvider>
        {user && <Header />}
        <Component {...pageProps} />
      </NextUIProvider>
    </>
  ) : (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
}
