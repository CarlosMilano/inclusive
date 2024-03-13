import { useEffect, useState } from "react";
import supabase from "../../../api/supabase";
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
}

interface ViajeProveedor {
  id: string;
  tarifa: number;
  viaje_id: string;
  dolares: boolean;
}

interface Cliente {
  id: string;
  nombre: string;
}

export default function Historial() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [cliente, setCliente] = useState<Cliente>();
  const [proveedor, setProveedor] = useState<ViajeProveedor[]>([]);
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);

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
          setViajes(viajesData || []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const fetchDataProveedor = async () => {
      try {
        const { data: viajesDataProveedor, error: viajesError } = await supabase
          .from("viajeproveedor")
          .select("*");
        if (viajesError) console.error(viajesError);
        else {
          setTimeout(() => {
            setLoading(false);
          }, 1000);
          setProveedor(viajesDataProveedor || []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchClienteData();
    fetchData();
    fetchDataProveedor();
  }, []);

  const calcularSumaTarifasProveedor = (viajeId: string) => {
    const viajesProveedorRelacionados = proveedor.filter(
      (viajeProveedor) => viajeProveedor.viaje_id === viajeId
    );

    const sumaTarifasProveedor = viajesProveedorRelacionados.reduce(
      (acc, viajeProveedor) => {
        const viajeCorrespondiente = viajes.find(
          (viaje) => viaje.id === viajeProveedor.viaje_id
        );

        if (
          viajeCorrespondiente &&
          viajeProveedor.dolares &&
          viajeCorrespondiente.tipodecambio
        ) {
          return (
            acc + viajeProveedor.tarifa * viajeCorrespondiente.tipodecambio
          );
        } else {
          return acc + viajeProveedor.tarifa;
        }
      },
      0
    );

    return sumaTarifasProveedor;
  };

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
        <main className="min-h-screen flex flex-col mt-[60px] ">
          <section className="p-8">
            <h1 className="text-4xl font-bold">Historial {cliente?.nombre}</h1>
          </section>
          <article className="flex flex-wrap justify-center">
            {sortedViajes.map((viaje) => {
              const sumaTarifasProveedor = calcularSumaTarifasProveedor(
                viaje.id
              );

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
                  diasRestantes={30}
                  onClick={(rowData) => {
                    router.push(`/viaje/${rowData.id}`);
                  }}
                  historial
                  folio={viaje.folio || ""}
                  dolares={viaje.dolares}
                  tipodecambio={viaje.tipodecambio}
                  tarifaProveedor={sumaTarifasProveedor}
                  comision={viaje.comision || 0}
                  utilidad
                />
              );
            })}
          </article>
        </main>
      )}
    </>
  );
}
