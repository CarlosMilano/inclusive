import { useEffect, useState } from "react";
import supabase from "../../../api/supabase";
import Table from "@/components/Table";
import { useRouter } from "next/router";
import { Box, CircularProgress } from "@mui/material";
import Head from "next/head";

interface Viaje {
  id: string;
  origen: string;
  destino: string;
  tarifa: number;
  factura: string;
  referencia: string;
  fechafactura: string;
  abonado: number;
  dolares: boolean;
  viaje_id: string;
  viaje: {
    id: string;
    tipodecambio: number;
    referencia: string;
    folio: string;
  };
}

interface Proveedor {
  id: string;
  nombre: string;
}

export default function Historial() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [proveedor, setProveedor] = useState<Proveedor>();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProveedorData = async () => {
      try {
        const { data: proveedorData, error: clienteError } = await supabase
          .from("proveedor")
          .select("*")
          .eq("id", id)
          .single();

        if (clienteError) {
          console.error(clienteError);
        } else {
          setProveedor(proveedorData);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const fetchData = async () => {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viajeproveedor")
          .select("*, viaje:viaje_id(*,tipodecambio,referencia,folio,id)")
          .eq("proveedor_id", id);
        if (viajesError) console.error(viajesError);
        else {
          setTimeout(() => {
            setLoading(false);
          }, 1000);
          setViajes(viajesData || []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchProveedorData();
    fetchData();
  }, []);

  const sortedViajes = viajes.sort(
    (a, b) => parseInt(b.viaje.folio) - parseInt(a.viaje.folio)
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
            <h1 className="text-4xl font-bold">
              Historial {proveedor?.nombre}
            </h1>
          </section>
          <article className="flex flex-wrap justify-center">
            {sortedViajes.map((viaje) => {
              return (
                <Table
                  key={viaje.id}
                  origen={viaje.origen || ""}
                  destino={viaje.destino || ""}
                  monto={viaje.tarifa || 0}
                  factura={viaje.factura || ""}
                  referencia={viaje.viaje.referencia || ""}
                  id={viaje.viaje_id || ""}
                  fechafactura={viaje.fechafactura || ""}
                  diasRestantes={30}
                  onClick={(rowData) => {
                    router.push(`/viaje/${rowData.id}`);
                  }}
                  folio={viaje.viaje.folio || ""}
                  dolares={viaje.dolares}
                  tipodecambio={viaje.viaje.tipodecambio || 0}
                  historial
                />
              );
            })}
          </article>
        </main>
      )}
    </>
  );
}
