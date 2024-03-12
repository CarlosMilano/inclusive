import Head from "next/head";
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import Anual from "@/components/Anual";
import Mensual from "@/components/Mensual";
import { Select, SelectItem } from "@nextui-org/select";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [reporte, setReporte] = useState("Ventas");
  const [tipo, setTipo] = useState("Anual");

  setTimeout(() => {
    setLoading(false);
  }, 1000);

  const handleTipo = (value: any) => {
    setTipo(value);
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
        <main className="flex flex-col h-screen mt-[60px]">
          <h1 className="text-4xl font-bold p-8">Reportes</h1>
          <section className="bg-white p-2 m-3 rounded-md shadow-sm flex flex-wrap gap-2 ">
            <article className="w-[200px]">
              <Select
                label="Reporte"
                radius="sm"
                placeholder="Selecciona un Reporte"
              >
                <SelectItem value="Ventas" key="1">
                  Ventas
                </SelectItem>
                <SelectItem value="UxC" key="2">
                  Utilidad x Cliente
                </SelectItem>
                <SelectItem value="Utilidad" key="3">
                  Utilidad
                </SelectItem>
                <SelectItem value="Proveedores" key="4">
                  Proveedores
                </SelectItem>
              </Select>
            </article>
            <article className="w-[200px]">
              <Select label="Tipo" radius="sm" placeholder="Selecciona un Tipo">
                <SelectItem key="1" onClick={() => handleTipo("Anual")}>
                  Anual
                </SelectItem>
                <SelectItem key="2" onClick={() => handleTipo("Mensual")}>
                  Mensual
                </SelectItem>
              </Select>
            </article>
            {tipo === "Mensual" && (
              <article className="w-[200px]">
                <Select label="Año" radius="sm" placeholder="Selecciona un Año">
                  <SelectItem key="1">2022</SelectItem>
                </Select>
              </article>
            )}
          </section>
        </main>
      )}
    </>
  );
}
