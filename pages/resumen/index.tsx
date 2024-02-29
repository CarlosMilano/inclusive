import Head from "next/head";
import { useState, useEffect } from "react";
import supabase from "../../pages/api/supabase";
import { Box, CircularProgress } from "@mui/material";
import currencyFormatter from "currency-formatter";
import Resumen from "@/components/Resumen";

interface Viaje {
  id: string;
  tarifa: number;
  comision: number;
  abonocomision: number;
  abonado: number;
  dolares: boolean;
  tipodecambio: number;
}

interface ViajeProveedor {
  id: string;
  tarifa: number;
  abonado: number;
  dolares: boolean;
  viaje: {
    tipodecambio: number;
  };
}

export default function Home() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [viajesProveedor, setViajesProveedor] = useState<ViajeProveedor[]>([]);
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
    const fetchViajesProveedor = async () => {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viajeproveedor")
          .select("*, viaje:viaje_id(*,tipodecambio)");

        if (viajesError) console.error(viajesError);
        else {
          setViajesProveedor(viajesData || []);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchViajesProveedor();
    fetchViajes();
  }, []);

  const ventas = viajes
    .map((viaje) => {
      if (viaje.dolares) {
        return viaje.tarifa * viaje.tipodecambio;
      } else {
        return viaje.tarifa;
      }
    })
    .reduce((total, tarifa) => total + tarifa, 0);
  const ventasProveedor = viajesProveedor
    .map((viaje) => {
      if (viaje.dolares) {
        return viaje.tarifa * viaje.viaje.tipodecambio;
      } else {
        return viaje.tarifa;
      }
    })
    .reduce((total, tarifa) => total + tarifa, 0);
  const comisiones = viajes
    .map((viaje) => viaje.comision)
    .reduce((a, b) => a + b, 0);
  const utilidad = ventas - ventasProveedor - comisiones;
  const CxC = viajes.reduce((total, viaje) => {
    const tarifa = viaje.dolares
      ? viaje.tarifa * viaje.tipodecambio
      : viaje.tarifa;
    const abonado = viaje.dolares
      ? viaje.abonado * viaje.tipodecambio
      : viaje.abonado;

    return total + (tarifa - abonado);
  }, 0);

  const CxP = viajesProveedor.reduce((total, viaje) => {
    const tarifa = viaje.dolares
      ? viaje.tarifa * viaje.viaje.tipodecambio
      : viaje.tarifa;
    const abonado = viaje.dolares
      ? viaje.abonado * viaje.viaje.tipodecambio
      : viaje.abonado;

    return total + (tarifa - abonado);
  }, 0);
  const comisionSinAbono = viajes.reduce((total, viaje) => {
    return total + viaje.comision - viaje.abonocomision;
  }, 0);
  const UtxC = CxC - CxP - comisionSinAbono;
  const porcentaje = ((utilidad / ventas) * 100).toFixed(2);

  return (
    <>
      <Head>
        <title>Resumen</title>
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
          <h1 className="text-4xl font-bold p-8">Resumen</h1>
          <section className="flex flex-wrap justify-center">
            <Resumen
              title="Ventas"
              monto={currencyFormatter.format(ventas, {
                code: "MXN",
                precision: 0,
              })}
            />
            <Resumen
              title="Proveedores"
              monto={currencyFormatter.format(ventasProveedor, {
                code: "MXN",
                precision: 0,
              })}
            />
            <Resumen
              title="Utilidad"
              monto={currencyFormatter.format(utilidad, {
                code: "MXN",
                precision: 0,
              })}
            />
            <Resumen
              title="Ut x C"
              monto={currencyFormatter.format(UtxC, {
                code: "MXN",
                precision: 0,
              })}
            />
            <Resumen title="% Utilidad" monto={porcentaje} />
          </section>
        </main>
      )}
    </>
  );
}
