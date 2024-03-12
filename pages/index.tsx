import React, { FormEvent, FormEventHandler, useState } from "react";
import { auth } from "@/config/firebase";
import { useRouter } from "next/router";
import { UserCredential, signInWithEmailAndPassword } from "firebase/auth";
import { TextField } from "@mui/material";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Head from "next/head";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [wrongPassword, setWrongPassword] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin: FormEventHandler<HTMLFormElement> = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      const user: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      router.push("/inicio");
    } catch (err) {
      console.error("Credentials are not valid.");
      setWrongPassword(true);
    }
  };

  return (
    <>
      <Head>
        <title>Log in</title>
      </Head>
      <main className="flex flex-col justify-center items-center h-screen">
        <section className="h-[400px] justify-center flex bg-white flex-col space-y-10 items-center w-[350px] rounded-lg shadow-sm">
          <h1 className="text-5xl">Bienvenido</h1>
          <form onSubmit={handleLogin} className="flex flex-col space-y-5 w-72">
            <TextField
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
              className="p-3"
            />
            <TextField
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Contraseña"
              className="p-3"
            />
            <button
              className="py-2 bg-blue-600 text-xl m-3 text-white shadow-2xl rounded-lg"
              type="submit"
            >
              {wrongPassword && (
                <Alert severity="error">
                  <AlertTitle>Error</AlertTitle>
                  Usuario y/o contraseñas incorrectas{" "}
                  <strong>Vuelve a intentar!</strong>
                </Alert>
              )}
              Iniciar Sesión
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
