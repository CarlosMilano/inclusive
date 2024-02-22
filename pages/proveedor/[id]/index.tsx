import Head from "next/head";
import { useState, useEffect } from "react";
import supabase from "../../api/supabase";
import { useRouter } from "next/router";
import { addDays, differenceInDays, parseISO } from "date-fns";
import { Box, CircularProgress } from "@mui/material";
import Table from "@/components/Table";

interface Viaje {
  id: string;
  origen: string;
  destino: string;
  tarifa: number;
  comision: number;
  factura: string;
  fechafactura: string;
  abonado: number;
  viaje_id: string;
  dolares: boolean;
  viaje: {
    tipodecambio: number;
  };
}

interface Proveedor {
  id: string;
  diascredito?: number;
  nombre: string;
}

export default function Home() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [proveedor, setProveedor] = useState<Proveedor>();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const today = new Date();

  const filterViajes = viajes.filter((viaje) => viaje.tarifa !== viaje.abonado);

  const sortedViajes = filterViajes.sort((viajeA, viajeB) => {
    const fechaLimiteA = viajeA.fechafactura
      ? addDays(parseISO(viajeA.fechafactura), proveedor?.diascredito || 0)
      : null;

    const diasRestantesA = fechaLimiteA
      ? differenceInDays(fechaLimiteA, today)
      : null;

    const fechaLimiteB = viajeB.fechafactura
      ? addDays(parseISO(viajeB.fechafactura), proveedor?.diascredito || 0)
      : null;

    const diasRestantesB = fechaLimiteB
      ? differenceInDays(fechaLimiteB, today)
      : null;

    if (diasRestantesA === null || diasRestantesB === null) {
      return diasRestantesA === null ? 1 : -1;
    }

    return diasRestantesA - diasRestantesB;
  });

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
          setProveedor({
            ...proveedorData,
            diascredito: proveedorData.diascredito || 30,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };
    const fetchData = async () => {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viajeproveedor")
          .select("*, viaje:viaje_id(*,tipodecambio)")
          .eq("proveedor_id", id);
        if (viajesError) console.error(viajesError);
        else {
          setViajes(viajesData || []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    setTimeout(() => {
      setLoading(false);
    }, 1500);

    fetchProveedorData();
    fetchData();
  }, [id]);

  return (
    <>
      <Head>
        <title>Viajes {proveedor?.nombre}</title>
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
            <h1 className="text-4xl font-bold">Viajes {proveedor?.nombre}</h1>
          </section>
          <section className="flex flex-wrap justify-center">
            {sortedViajes.slice().map((viaje) => {
              const fechaLimite = viaje.fechafactura
                ? addDays(
                    parseISO(viaje.fechafactura),
                    proveedor?.diascredito || 0
                  )
                : null;

              const diasRestantes = fechaLimite
                ? differenceInDays(fechaLimite, today)
                : 0;

              return (
                <Table
                  key={viaje.id}
                  origen={viaje.origen || ""}
                  destino={viaje.destino || ""}
                  monto={viaje.tarifa || 0}
                  id={viaje.viaje_id || ""}
                  factura={viaje.factura || ""}
                  fechafactura={viaje.fechafactura || ""}
                  diasRestantes={diasRestantes}
                  onClick={(rowData) => {
                    router.push(`/viaje/${rowData.id}`);
                  }}
                  dolares={viaje.dolares}
                  tipodecambio={viaje.viaje.tipodecambio || 0}
                />
              );
            })}
          </section>
        </main>
      )}
    </>
  );
}
