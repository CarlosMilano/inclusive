import Head from "next/head";
import { useState, useEffect } from "react";
import supabase from "../api/supabase";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";

interface Cliente {
  id: string;
  nombre: string;
}

interface Proveedor {
  id: string;
  nombre: string;
}

export default function Home() {
  const [cliente, setCliente] = useState<Cliente[]>([]);
  const [proveedor, setProveedor] = useState<Proveedor[]>([]);
  const [cuentaPorCobrar, setCuentaPorCobrar] = useState<
    { cliente: Cliente; monto: number }[]
  >([]);
  const [cuentaPorPagar, setCuentaPorPagar] = useState<
    { proveedor: Proveedor; monto: number }[]
  >([]);
  const [comision, setComision] = useState<
    { cliente: Cliente; monto: number }[]
  >([]);
  const router = useRouter();
  const [nombreCliente, setNombreCliente] = useState("");
  const [nombreProveedor, setNombreProveedor] = useState("");
  const [diasCredito, setDiasCredito] = useState(0);
  const [openCliente, setOpenCliente] = useState(false);
  const [openProveedor, setOpenProveedor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: clientesData, error: clientesError } = await supabase
          .from("cliente")
          .select("*");
        if (clientesError) console.error(clientesError);
        else setCliente(clientesData || []);

        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select("*");
        if (viajesError) console.error(viajesError);

        const { data: proveedorData, error: proveedorError } = await supabase
          .from("proveedor")
          .select("*");
        if (proveedorError) console.log(proveedorError);
        else setProveedor(proveedorData || []);

        const { data: viajesProveedorData, error: viajesProveedorError } =
          await supabase.from("viajeproveedor").select("*");
        if (viajesProveedorError) console.log(viajesProveedorError);

        const CxC = clientesData?.map((cliente) => {
          const viajesCliente = viajesData?.filter(
            (viaje) => viaje.cliente_id === cliente.id
          );
          const sumaTarifas =
            viajesCliente?.reduce((total, viaje) => {
              if (viaje.dolares) {
                return total + viaje.tarifa * viaje.tipodecambio;
              } else {
                return total + viaje.tarifa;
              }
            }, 0) || 0;
          const sumaAbonos =
            viajesCliente?.reduce((total, viaje) => {
              if (viaje.dolares) {
                return total + viaje.abonado * viaje.tipodecambio;
              } else {
                return total + viaje.abonado;
              }
            }, 0) || 0;

          const monto = sumaTarifas - sumaAbonos;

          return { cliente, monto };
        });

        const comision = clientesData?.map((cliente) => {
          const viajesCliente = viajesData?.filter(
            (viaje) => viaje.cliente_id === cliente.id
          );
          const sumaTarifas =
            viajesCliente?.reduce(
              (total, viaje) => total + viaje.comision,
              0
            ) || 0;
          const sumaAbonos =
            viajesCliente?.reduce(
              (total, viaje) => total + viaje.abonocomision,
              0
            ) || 0;
          const monto = sumaTarifas - sumaAbonos;

          return { cliente, monto };
        });

        const CxP = proveedorData?.map((proveedor) => {
          const viajesProveedor = viajesProveedorData?.filter(
            (viajeProveedor) => viajeProveedor.proveedor_id === proveedor.id
          );
          const sumaTarifas =
            viajesProveedor?.reduce((total, viajeProveedor) => {
              const viajeEnViajes = viajesData?.find(
                (v) => v.id === viajeProveedor.viaje_id
              );

              if (viajeEnViajes && viajeProveedor.dolares) {
                return (
                  total + viajeProveedor.tarifa * viajeEnViajes.tipodecambio
                );
              } else {
                return total + viajeProveedor.tarifa;
              }
            }, 0) || 0;
          const sumaAbonos =
            viajesProveedor?.reduce((total, viajeProveedor) => {
              const viajeEnViajes = viajesData?.find(
                (v) => v.id === viajeProveedor.viaje_id
              );

              if (viajeEnViajes && viajeProveedor.dolares) {
                return (
                  total + viajeProveedor.abonado * viajeEnViajes.tipodecambio
                );
              } else {
                return total + viajeProveedor.abonado;
              }
            }, 0) || 0;
          const monto = sumaTarifas - sumaAbonos;

          return { proveedor, monto };
        });

        setCuentaPorCobrar(CxC || []);
        setCuentaPorPagar(CxP || []);
        setComision(comision || []);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClick = () => {
    const newId = uuidv4();
    router.push(`/viaje/${newId}`);
  };

  const handleAddClient = async () => {
    try {
      const { data, error } = await supabase
        .from("cliente")
        .insert([{ nombre: nombreCliente, diascredito: diasCredito }]);
      if (error) throw error;
      else {
        setNombreCliente("");
        setDiasCredito(0);
        setOpenCliente(false);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleAddProveedor = async () => {
    try {
      const { data, error } = await supabase
        .from("proveedor")
        .insert([{ nombre: nombreProveedor }]);
      if (error) throw error;
      else {
        setNombreProveedor("");
        setOpenProveedor(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const clickCliente = () => {
    setOpenCliente(!openCliente);
  };

  const clickProveedor = () => {
    setOpenProveedor(!openProveedor);
  };

  return (
    <>
      <Head>
        <title>Inicio</title>
      </Head>
      <main className="min-h-screen flex flex-col items-center gap-5 p-5 mt-[60px]">
        <section className="flex flex-wrap items-start justify-center gap-5">
          <article className="flex flex-col justify-center items-center z-20">
            <Button title="Añadir Cliente" onClick={clickCliente} />
            <div
              className={`flex flex-col justify-center items-center transition-all duration-300 overflow-hidden${
                openCliente
                  ? " max-h-[180px] opacity-100 translate-y-0"
                  : " max-h-0 opacity-0 translate-y-[-100%] z-0"
              }`}
              style={{
                visibility: openCliente ? "visible" : "hidden",
              }}
            >
              <input
                type="text"
                placeholder="Nombre"
                onChange={(e) => setNombreCliente(e.target.value)}
                className="p-3 m-1"
                required
              />
              <input
                type="text"
                placeholder="Dias de credito"
                onChange={(e) => setDiasCredito(Number(e.target.value))}
                className="p-3 m-1"
                required
              />
              <button
                onClick={handleAddClient}
                className="py-2 bg-blue-600 text-lg m-3 text-white shadow-md rounded-lg w-[100px]"
              >
                Guardar
              </button>
            </div>
          </article>
          <article className="flex flex-col justify-center items-center">
            <Button title="Añadir Proveedor" onClick={clickProveedor} />
            <div
              className={`flex flex-col justify-center items-center transition-all duration-300 overflow-hidden${
                openProveedor
                  ? " max-h-[125px] opacity-100 translate-y-0"
                  : " max-h-0 opacity-0 translate-y-[-100%] z-0"
              }`}
              style={{
                visibility: openProveedor ? "visible" : "hidden",
              }}
            >
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  placeholder="Nombre"
                  onChange={(e) => setNombreProveedor(e.target.value)}
                  className="p-3 m-1"
                  required
                />
                <button
                  onClick={handleAddProveedor}
                  className="py-2 bg-blue-600 text-lg m-3 text-white shadow-md rounded-lg w-[100px]"
                >
                  Guardar
                </button>
              </div>
            </div>
          </article>
          <article className="flex flex-col justify-center">
            <Button title="Añadir Viaje" onClick={handleClick} />
          </article>
        </section>
        <section className="flex flex-wrap justify-center gap-9 w-screen">
          <Card
            title="CXC"
            subtitle="Cliente"
            total={cuentaPorCobrar.reduce(
              (total, resultado) => total + resultado.monto,
              0
            )}
            clientData={cuentaPorCobrar.map((resultado) => ({
              cliente: resultado.cliente.nombre,
              monto: resultado.monto,
              id: resultado.cliente.id,
            }))}
            loading={loading}
            onClick={(rowData) => {
              router.push(`/cliente/${rowData.id}`);
            }}
          />
          <Card
            title="CXP"
            subtitle="Proveedor"
            total={cuentaPorPagar.reduce(
              (total, resultado) => total + resultado.monto,
              0
            )}
            clientData={cuentaPorPagar.map((resultado) => ({
              cliente: resultado.proveedor.nombre,
              monto: resultado.monto,
              id: resultado.proveedor.id,
            }))}
            loading={loading}
            onClick={(rowData) => {
              router.push(`/proveedor/${rowData.id}`);
            }}
          />
          <Card
            title="Comisión"
            subtitle="Cliente"
            total={comision.reduce(
              (total, resultado) => total + resultado.monto,
              0
            )}
            clientData={comision.map((resultado) => ({
              cliente: resultado.cliente.nombre,
              monto: resultado.monto,
              id: resultado.cliente.id,
            }))}
            loading={loading}
            onClick={(rowData) => {
              router.push(`/comision/${rowData.id}`);
            }}
          />
        </section>
      </main>
    </>
  );
}
