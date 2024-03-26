import Head from "next/head";
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import Anual from "@/components/Anual";
import Mensual from "@/components/Mensual";
import Utilidad from "@/components/UtilidadTable";
import { Select, SelectItem } from "@nextui-org/select";
import supabase from "../api/supabase";
import ProveedoresTable from "@/components/ProveedoresTable";

interface Cliente {
  id: string;
  nombre: string;
}

export default function Reportes() {
  const [loading, setLoading] = useState(true);
  const [reporte, setReporte] = useState("Utilidad");
  const [utilidadData, setUtilidadData] = useState<{
    ventasArray: any[];
    totalUtilidad: number;
  }>({ ventasArray: [], totalUtilidad: 0 });

  const [years, setYears] = useState<number[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ventasData, setVentasData] = useState<{
    ventasArray: any[];
    totalVentas: number;
  }>({ ventasArray: [], totalVentas: 0 });

  useEffect(() => {
    async function fetchUtilidadData() {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select("*");
        const { data: proveedoresData, error: proveedoresError } =
          await supabase.from("viajeproveedor").select("*");

        if (viajesError) throw viajesError;
        if (proveedoresError) throw proveedoresError;

        const uniqueYears = Array.from(
          new Set(
            viajesData
              .filter(
                (viaje: any) => viaje.fechafactura && viaje.fechafactura !== ""
              )
              .map((viaje: any) => new Date(viaje.fechafactura).getFullYear())
          )
        ).sort((a, b) => a - b);
        setYears(uniqueYears);

        const ventasPorMesAnio = viajesData.reduce((acc: any, viaje: any) => {
          if (viaje.fechafactura && viaje.fechafactura !== "") {
            const fecha = new Date(viaje.fechafactura);
            const mes = fecha.getMonth() + 1;
            const anio = fecha.getFullYear();
            let tarifaViaje = viaje.tarifa;
            if (viaje.dolares && viaje.tipodecambio) {
              tarifaViaje *= viaje.tipodecambio;
            }

            const proveedoresDelViaje = proveedoresData.filter(
              (proveedor: any) => proveedor.viaje_id === viaje.id
            );
            let tarifaProveedores = 0;
            proveedoresDelViaje.forEach((proveedor: any) => {
              let tarifaProveedor = proveedor.tarifa;
              if (proveedor.dolares && viaje.tipodecambio) {
                tarifaProveedor *= viaje.tipodecambio;
              }
              tarifaProveedores += tarifaProveedor;
            });

            const comision = viaje.comision;
            const utilidad = tarifaViaje - comision - tarifaProveedores;

            if (!acc[mes]) {
              acc[mes] = { mes, [anio]: utilidad };
            } else {
              if (!acc[mes][anio]) {
                acc[mes][anio] = utilidad;
              } else {
                acc[mes][anio] += utilidad;
              }
            }
          }
          return acc;
        }, {});

        const ventasArray = Object.keys(ventasPorMesAnio).map((mes) => ({
          mes: parseInt(mes, 10),
          ...ventasPorMesAnio[mes],
        }));

        const totalUtilidad = viajesData.reduce((acc: number, viaje: any) => {
          let tarifaViaje = viaje.tarifa;
          if (viaje.dolares && viaje.tipodecambio) {
            tarifaViaje *= viaje.tipodecambio;
          }

          const proveedoresDelViaje = proveedoresData.filter(
            (proveedor: any) => proveedor.viaje_id === viaje.id
          );
          let tarifaProveedores = 0;
          proveedoresDelViaje.forEach((proveedor: any) => {
            let tarifaProveedor = proveedor.tarifa;
            if (proveedor.dolares && viaje.tipodecambio) {
              tarifaProveedor *= viaje.tipodecambio;
            }
            tarifaProveedores += tarifaProveedor;
          });

          const comision = viaje.comision;
          const utilidad = tarifaViaje - comision - tarifaProveedores;

          return acc + utilidad;
        }, 0);

        setUtilidadData({ ventasArray, totalUtilidad });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    }

    async function fetchVentasData() {
      try {
        const { data: clientesData, error: clientesError } = await supabase
          .from("cliente")
          .select("*");
        if (clientesError) throw clientesError;
        const clientes = clientesData || [];

        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select("*");
        if (viajesError) throw viajesError;
        const viajes = viajesData || [];

        const ventasPorClientePorAnio = viajes.reduce(
          (acc: any, viaje: any) => {
            if (viaje.fechafactura && viaje.fechafactura !== "") {
              const fecha = new Date(viaje.fechafactura);
              const anio = fecha.getFullYear();
              let tarifaViaje = viaje.tarifa;
              if (viaje.dolares && viaje.tipodecambio) {
                tarifaViaje *= viaje.tipodecambio;
              }

              if (!acc[viaje.cliente_id]) {
                acc[viaje.cliente_id] = { cliente_id: viaje.cliente_id };
              }

              if (!acc[viaje.cliente_id][anio]) {
                acc[viaje.cliente_id][anio] = tarifaViaje;
              } else {
                acc[viaje.cliente_id][anio] += tarifaViaje;
              }
            }
            return acc;
          },
          {}
        );

        const ventasArray = Object.keys(ventasPorClientePorAnio).map(
          (clienteId) => ({
            cliente_id: clienteId,
            ...ventasPorClientePorAnio[clienteId],
          })
        );

        const totalVentas = viajes.reduce((acc: number, viaje: any) => {
          let tarifaViaje = viaje.tarifa;
          if (viaje.dolares && viaje.tipodecambio) {
            tarifaViaje *= viaje.tipodecambio;
          }
          return acc + tarifaViaje;
        }, 0);

        setVentasData({ ventasArray, totalVentas });
        setClientes(clientes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchVentasData();
    fetchUtilidadData();
  }, []);

  setTimeout(() => {
    setLoading(false);
  }, 1000);

  const handleReporte = (value: any) => {
    setReporte(value);
  };

  return (
    <>
      <Head>
        <title>Reportes</title>
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
          <h1 className="text-4xl font-bold p-8">Reportes</h1>
          <section className=" bg-white p-2 m-3 rounded-md shadow-sm flex flex-wrap gap-2 ">
            <article className="w-[200px]">
              <Select
                label="Reporte"
                radius="sm"
                placeholder={reporte}
                value={reporte}
              >
                <SelectItem key="1" onClick={() => handleReporte("Utilidad")}>
                  Utilidad
                </SelectItem>
                <SelectItem key="2" onClick={() => handleReporte("UxC")}>
                  Utilidad x Cliente
                </SelectItem>
                <SelectItem
                  key="3"
                  onClick={() => handleReporte("Proovedores")}
                >
                  Proveedores
                </SelectItem>
                <SelectItem key="4" onClick={() => handleReporte("Ventas")}>
                  Ventas
                </SelectItem>
                <SelectItem key="5" onClick={() => handleReporte("VxC")}>
                  Viajes x Cliente
                </SelectItem>
              </Select>
            </article>
          </section>
          <section className="m-3">
            {reporte === "Utilidad" && (
              <Utilidad
                ventasArray={utilidadData.ventasArray}
                totalUtilidad={utilidadData.totalUtilidad}
                years={years}
              />
            )}
            {reporte === "Ventas" && (
              <Anual
                ventasArray={ventasData.ventasArray}
                years={years}
                clientes={clientes}
                totalVentas={ventasData.totalVentas}
              />
            )}
          </section>
        </main>
      )}
    </>
  );
}
