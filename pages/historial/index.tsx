import { useEffect, useState } from "react";
import supabase from "../api/supabase";
import Table from "@/components/Table";
import { useRouter } from "next/router";
import { Box, CircularProgress } from "@mui/material";
import Head from "next/head";
import Pagination from "@mui/material/Pagination";

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
  tipodecambio: number;
  dolares: boolean;
  cliente: {
    id: string;
    nombre: string;
  };
}

export default function Historial() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const dataPerPage = 20;

  useEffect(() => {
    const fetchViajes = async () => {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select(
            `
            *,
            cliente:cliente_id(id, nombre)
          `
          );

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

  const paginatedViajes = sortedViajes.slice(
    (page - 1) * dataPerPage,
    page * dataPerPage
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
        <main className="min-h-screen flex flex-col mt-[60px] ">
          <section className="p-8">
            <h1 className="text-4xl font-bold">Historial</h1>
          </section>
          <article className="flex flex-wrap justify-center">
            {paginatedViajes.map((viaje) => (
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
                dolares={viaje.dolares}
                tipodecambio={viaje.tipodecambio}
                cliente={viaje.cliente.nombre || "Cliente"}
              />
            ))}
          </article>
          <section className=" p-3 flex justify-center w-screen">
            <Pagination
              count={Math.ceil(sortedViajes.length / dataPerPage)}
              page={page}
              onChange={(event, value) => {
                setPage(value);
              }}
            />
          </section>
        </main>
      )}
    </>
  );
}
