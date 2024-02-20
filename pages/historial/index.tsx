import { useEffect, useState } from "react";
import supabase from "../api/supabase";
import Table from "@/components/Table";
import { useRouter } from "next/router";
import { Box, CircularProgress } from "@mui/material";
import Head from "next/head";

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
  folio: string;
}

export default function Historial() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViajes = async () => {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select("*");

        if (viajesError) console.error(viajesError);
        else {
          setTimeout(() => {
            setLoading(false);
          }, 1500);
          setViajes(viajesData || []);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchViajes();
  }, []);

  const sortedViajes = viajes.sort(
    (a, b) => parseInt(b.folio) - parseInt(a.folio)
  );

  return (
    <>
      <Head>
        <title>Historial</title>
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
        <main className="min-h-screen flex flex-col mt-[60px]">
          <section className="p-8">
            <h1 className="text-4xl font-bold">Historial</h1>
          </section>
          <article className="flex flex-wrap justify-center">
            {sortedViajes.map((viaje) => (
              <Table
                key={viaje.id}
                origen={viaje.origen || ""}
                destino={viaje.destino || ""}
                monto={viaje.tarifa || 0}
                factura={viaje.factura || ""}
                referencia={viaje.referencia || ""}
                id={viaje.id || ""}
                fechafactura={viaje.fechafactura || ""}
                diasRestantes={30}
                onClick={(rowData) => {
                  router.push(`/viaje/${rowData.id}`);
                }}
                historial
                folio={viaje.folio || ""}
              />
            ))}
          </article>
        </main>
      )}
    </>
  );
}
