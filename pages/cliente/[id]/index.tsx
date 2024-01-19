import Head from "next/head";
import { useState, useEffect } from "react";
import supabase from "../../api/supabase";
import { useRouter } from "next/router";

interface Viaje {
  id: string;
  origen: string;
  destino: string;
  tarifa: number;
  comision: number;
}

export default function Home() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select("*")
          .eq("cliente_id", id)
          .order("fechafactura", { ascending: false });
        if (viajesError) console.error(viajesError);
        else setViajes(viajesData || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [id]);

  return (
    <>
      <Head>
        <title>Viajes Cliente</title>
      </Head>
      <main>
        {viajes.map((viaje) => (
          <div key={viaje.id}>
            <p>{viaje.origen}</p>
            <p>{viaje.destino}</p>
            <p>{viaje.tarifa}</p>
            <p>{viaje.comision}</p>
          </div>
        ))}
      </main>
    </>
  );
}
