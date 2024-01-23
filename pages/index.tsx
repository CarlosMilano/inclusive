import React, { FormEvent, FormEventHandler, useState } from "react";
import { auth } from "@/config/firebase";
import { useRouter } from "next/router";
import { UserCredential, signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    }
  };

  return (
    <main>
      <form onSubmit={handleLogin} className="flex flex-col space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="p-2"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="p-2"
        />
        <button type="submit">Iniciar Sesión</button>
      </form>
    </main>
  );
}
