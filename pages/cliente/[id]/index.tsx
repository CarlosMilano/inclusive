import Head from "next/head";
import { useState, useEffect } from "react";
import supabase from "../../api/supabase";
import { useRouter } from "next/router";
import Table from "@/components/Table";
import { addDays, differenceInDays, parseISO } from "date-fns";
import { Box, CircularProgress } from "@mui/material";

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
  tipodecambio: number;
  dolares: boolean;
}

interface Cliente {
  id: string;
  diascredito: number;
  nombre: string;
}

export default function Home() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [cliente, setCliente] = useState<Cliente>();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const today = new Date();

  const filterViajes = viajes.filter((viaje) => viaje.tarifa !== viaje.abonado);

  const sortedViajes = filterViajes.sort((viajeA, viajeB) => {
    const fechaLimiteA = viajeA.fechafactura
      ? addDays(parseISO(viajeA.fechafactura), cliente?.diascredito || 0)
      : null;

    const diasRestantesA = fechaLimiteA
      ? differenceInDays(fechaLimiteA, today)
      : null;

    const fechaLimiteB = viajeB.fechafactura
      ? addDays(parseISO(viajeB.fechafactura), cliente?.diascredito || 0)
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
          .eq("cliente_id", id)
          .order("fechafactura", { ascending: false });
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
        <title>Viajes {cliente?.nombre}</title>
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
            <h1 className="text-4xl font-bold">Viajes {cliente?.nombre}</h1>
          </section>
          <section className="flex flex-wrap justify-center">
            {sortedViajes.slice().map((viaje) => {
              const fechaLimite = viaje.fechafactura
                ? addDays(
                    parseISO(viaje.fechafactura),
                    cliente?.diascredito || 0
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
                  factura={viaje.factura || ""}
                  referencia={viaje.referencia || ""}
                  id={viaje.id || ""}
                  fechafactura={viaje.fechafactura || ""}
                  diasRestantes={diasRestantes}
                  onClick={(rowData) => {
                    router.push(`/viaje/${rowData.id}`);
                  }}
                  dolares={viaje.dolares}
                  tipodecambio={viaje.tipodecambio}
                />
              );
            })}
          </section>
        </main>
      )}
    </>
  );
}
