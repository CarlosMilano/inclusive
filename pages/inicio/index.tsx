import Head from "next/head";
import supabase from "../api/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Cliente {
  id: number;
  nombre: string;
  diascredito: number;
}

export default function Home() {
  const [cliente, setCliente] = useState<Cliente[]>([]);
  const [nombreCliente, setNombreCliente] = useState("");
  const [diasCredito, setDiasCredito] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fecthData = async () => {
      const { data, error } = await supabase.from("cliente").select("*");
      if (error) {
        console.error("Error al obtener los datos", error);
      } else {
        setCliente(data);
      }
    };
    fecthData();
  }, []);

  const addClient = async () => {
    if (nombreCliente.trim() === "") {
      return;
    }
    const { data, error } = await supabase
      .from("cliente")
      .insert([{ nombre: nombreCliente, diascredito: diasCredito }]);
    if (error) {
      console.error("Error al obtener los datos", error);
    } else {
      setCliente([...cliente]);
      setNombreCliente("");
      setDiasCredito(0);
      router.reload();
    }
  };

  const deleteClient = async () => {
    const { data, error } = await supabase
      .from("cliente")
      .delete()
      .match({ nombre: nombreCliente });
    if (error) {
      console.error("Error al obtener los datos", error);
    } else {
      setCliente(data || []);
      setNombreCliente("");
      setDiasCredito(0);
      router.reload();
    }
  };

  return (
    <>
      <Head>
        <title>Inicio</title>
      </Head>
      <div>
        {cliente.map((cliente) => (
          <div key={cliente.id} className="flex justify-between w-[150px]">
            <div>{cliente.nombre || "No Disponible"}</div>
            <div>{cliente.diascredito || "No Disponible"}</div>
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Name"
        className="p-3 m-2"
        value={nombreCliente}
        onChange={(e) => setNombreCliente(e.target.value)}
      />
      <input
        type="text"
        placeholder="Dias Credito"
        className="p-3 m-2"
        value={diasCredito}
        onChange={(e) => setDiasCredito(Number(e.target.value))}
      />
      <button
        onClick={addClient}
        className="p-3 bg-slate-600 m-3 text-lg text-white rounded-md shadow-xl hover:bg-slate-900 transition-all duration-300"
      >
        Add Client
      </button>
      <button
        onClick={deleteClient}
        className="p-3 bg-red-600 m-3 text-lg text-white rounded-md shadow-xl hover:bg-red-900 transition-all duration-300"
      >
        Delete Client
      </button>
    </>
  );
}
