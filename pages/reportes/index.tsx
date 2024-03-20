import Head from "next/head";
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import Anual from "@/components/Anual";
import Mensual from "@/components/Mensual";
import Utilidad from "@/components/Utilidad";
import { Select, SelectItem } from "@nextui-org/select";
import supabase from "../api/supabase";

export default function Reportes() {
  const [loading, setLoading] = useState(true);
  const [reporte, setReporte] = useState("Utilidad");
  const [tipo, setTipo] = useState("Anual");
  const [ventasData, setVentasData] = useState<{
    ventasArray: any[];
    totalUtilidad: number;
  }>({ ventasArray: [], totalUtilidad: 0 });

  const [years, setYears] = useState<number[]>([]);
  const [anio, setAnio] = useState("");

  useEffect(() => {
    async function fetchVentasData() {
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

        setVentasData({ ventasArray, totalUtilidad });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    }

    fetchVentasData();
  }, []);

  setTimeout(() => {
    setLoading(false);
  }, 1000);

  const handleTipo = (value: any) => {
    setTipo(value);
  };

  const handleReporte = (value: any) => {
    setReporte(value);
  };

  const handleAnio = (value: any) => {
    setAnio(value);
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
              </Select>
            </article>
            {reporte !== "Utilidad" && (
              <article className="w-[200px]">
                <Select
                  label="Tipo"
                  radius="sm"
                  value={tipo}
                  placeholder="Selecciona un Tipo"
                >
                  <SelectItem
                    key="1"
                    onClick={() => handleTipo("Anual")}
                    value="Anual"
                  >
                    Anual
                  </SelectItem>
                  <SelectItem key="2" onClick={() => handleTipo("Mensual")}>
                    Mensual
                  </SelectItem>
                </Select>
              </article>
            )}
            {tipo === "Mensual" && (
              <article className="w-[200px]">
                <Select
                  label="Año"
                  placeholder="Selecciona un Año"
                  radius="sm"
                  value={anio}
                >
                  {years.map((year) => (
                    <SelectItem key={year} onClick={() => handleAnio(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </Select>
              </article>
            )}
          </section>
          <section className="m-3">
            {reporte === "Utilidad" && (
              <Utilidad
                ventasArray={ventasData.ventasArray}
                totalUtilidad={ventasData.totalUtilidad}
                years={years}
              />
            )}
          </section>
        </main>
      )}
    </>
  );
}
