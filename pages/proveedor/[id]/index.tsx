import Head from "next/head";
import { useState, useEffect } from "react";
import supabase from "../../api/supabase";
import { useRouter } from "next/router";
import { addDays, differenceInDays, parseISO } from "date-fns";
import CardProveedor from "@/components/CardProveedor";

interface Viaje {
  id: string;
  origen: string;
  destino: string;
  tarifa: number;
  comision: number;
  factura: string;
  referencia: string;
  fechafactura: string;
  abonado: number;
  viaje_id: string;
}

interface Proveedor {
  id: string;
  diascredito: number;
  nombre: string;
}

export default function Home() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [proveedor, setProveedor] = useState<Proveedor>();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);

  const filterViajes = viajes.filter((viaje) => viaje.tarifa !== viaje.abonado);

  useEffect(() => {
    const fetchClienteData = async () => {
      try {
        const { data: clienteData, error: clienteError } = await supabase
          .from("proveedor")
          .select("*")
          .eq("id", id)
          .single();

        if (clienteError) {
          console.error(clienteError);
        } else {
          setProveedor(clienteData);
        }
      } catch (error) {
        console.error(error);
      }
    };
    const fetchData = async () => {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viajeproveedor")
          .select("*")
          .eq("proveedor_id", id);
        if (viajesError) console.error(viajesError);
        else {
          setViajes(viajesData || []);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchClienteData();
    fetchData();
  }, [id]);

  return (
    <>
      <Head>
        <title>Viajes Proveedor</title>
      </Head>
      <main className="flex flex-col h-screen">
        <section className="p-8">
          <h1 className="text-4xl font-bold">Viajes {proveedor?.nombre}</h1>
        </section>
        <section className="flex flex-wrap justify-center">
          {filterViajes.slice().map((viaje) => {
            return (
              <CardProveedor
                key={viaje.id}
                origen={viaje.origen || ""}
                destino={viaje.destino || ""}
                monto={viaje.tarifa || 0}
                factura={viaje.factura || ""}
                referencia={viaje.referencia || ""}
                id={viaje.viaje_id || ""}
                onClick={(rowData) => {
                  router.push(`/viaje/${rowData.id}`);
                }}
                loading={loading}
              />
            );
          })}
        </section>
      </main>
    </>
  );
}
