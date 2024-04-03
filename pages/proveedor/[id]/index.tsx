import Head from "next/head";
import { useState, useEffect } from "react";
import supabase from "../../api/supabase";
import { useRouter } from "next/router";
import { addDays, differenceInDays, parseISO } from "date-fns";
import { Box, CircularProgress } from "@mui/material";
import Table from "@/components/Table";
import currencyFormatter from "currency-formatter";

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
    referencia: string;
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
          .select("*, viaje:viaje_id(*,tipodecambio,referencia)")
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

  const totalVencido = sortedViajes.reduce((acc, viaje) => {
    const fechaLimite = viaje.fechafactura
      ? addDays(parseISO(viaje.fechafactura), proveedor?.diascredito || 0)
      : null;

    const diasRestantes = fechaLimite
      ? differenceInDays(fechaLimite, today)
      : 0;

      if (viaje.fechafactura && viaje.dolares) {
        return diasRestantes < 0
        ? acc + viaje.tarifa * viaje.viaje.tipodecambio
        : acc;
      } else if (viaje.fechafactura) {
        return diasRestantes < 0 ? acc + viaje.tarifa : acc;
      }

    return acc;
}, 0);

  const totalPorVencer = sortedViajes.reduce((acc, viaje) => {
    const fechaLimite = viaje.fechafactura
      ? addDays(parseISO(viaje.fechafactura), proveedor?.diascredito || 0)
      : null;

    const diasRestantes = fechaLimite
      ? differenceInDays(fechaLimite, today)
      : 0;

    if (viaje.fechafactura && viaje.dolares) {
      return diasRestantes >= 0
        ? acc + viaje.tarifa * viaje.viaje.tipodecambio
        : acc;
    } else if (viaje.fechafactura) {
      return diasRestantes >= 0 ? acc + viaje.tarifa : acc;
    }

    return acc;
  }, 0);

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
        <main className="flex flex-col min-h-screen mt-[60px]">
          <section className="p-8 flex flex-wrap items-center gap-6">
            <h1 className="text-3xl font-bold">Viajes {proveedor?.nombre}</h1>
            <article className="flex flex-col items-start space-y-1 text-sm">
              <article className="flex justify-center items-center gap-1">
                <div className=" bg-red-500 w-3 h-3 rounded-full" />
                {currencyFormatter.format(totalVencido, {
                  code: "MXN",
                  precision: 0,
                })}
              </article>
              <article className="flex justify-center items-center gap-1">
                <div className=" bg-green-500 w-3 h-3 rounded-full" />
                {currencyFormatter.format(totalPorVencer, {
                  code: "MXN",
                  precision: 0,
                })}
              </article>
            </article>
          </section>
          <section className="flex flex-wrap justify-center">
            {sortedViajes.map((viaje) => {
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
                  idproveedor={viaje.id}
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
                  referencia={viaje.viaje.referencia || ""}
                  abonado={viaje.abonado || 0}
                  isCliente={false}
                  historial={false}
                />
              );
            })}
          </section>
        </main>
      )}
    </>
  );
}
