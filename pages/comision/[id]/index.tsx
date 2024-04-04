import Head from "next/head";
import { useState, useEffect } from "react";
import supabase from "../../api/supabase";
import { useRouter } from "next/router";
import Table from "@/components/Table";
import { addDays, differenceInDays, parseISO } from "date-fns";
import Pagination from "@mui/material/Pagination";
import { Box, CircularProgress } from "@mui/material";
import CardComision from "@/components/CardComision";
import { Viaje } from "@/types/Viaje";
import { Cliente } from "@/types/Cliente";


export default function Home() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [cliente, setCliente] = useState<Cliente>();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);

  const filterViajes = viajes.filter(
    (viaje) => viaje.comision !== viaje.abonocomision
  );

  useEffect(() => {
    const fetchClienteData = async () => {
      try {
        const { data: clienteData, error: clienteError } = await supabase
          .from("cliente")
          .select("*")
          .eq("id", id)
          .single();

        if (clienteError) {
          console.error(clienteError);
        } else {
          setCliente(clienteData);
          setTimeout(() => {
            setLoading(false);
          }, 1500);
        }
      } catch (error) {
        console.error(error);
      }
    };
    const fetchData = async () => {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select("*")
          .eq("cliente_id", id);
        if (viajesError) console.error(viajesError);
        else {
          const viajesConDiasCredito = viajesData.map((viaje: Viaje) => ({
            ...viaje,
            diasCredito: cliente?.diascredito || 0,
          }));
          setViajes(viajesConDiasCredito || []);
        }
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error(error);
      }
    };
    fetchClienteData();
    fetchData();
  }, [id]);

  return (
    <>
      <Head>
        <title>Comisión {cliente?.nombre}</title>
      </Head>
      {loading ? (
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
      ) : (
        <main className="flex flex-col h-screen mt-[60px]">
          <section className="p-8">
            <h1 className="text-4xl font-bold">Comisión {cliente?.nombre}</h1>
          </section>
          <section className="flex flex-wrap justify-center">
            {filterViajes.map((viaje) => (
              <CardComision
                key={viaje.id}
                comision={viaje.comision}
                abonocomision={viaje.abonocomision}
                id={viaje.id}
                onClick={() => router.push(`/viaje/${viaje.id}`)}
                factura={viaje.factura}
              />
            ))}
          </section>
        </main>
      )}
    </>
  );
}
