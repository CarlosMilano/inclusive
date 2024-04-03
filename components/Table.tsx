import currencyFormatter from "currency-formatter";
import PaidIcon from "@mui/icons-material/Paid";
import { InputField } from "./InputField";
import { useState } from "react";
import supabase from "@/pages/api/supabase";
import { useRouter } from "next/router";

interface TableProps {
  origen: string;
  destino: string;
  monto: number;
  factura?: string;
  referencia?: string;
  id: string;
  idproveedor?: string;
  fechafactura: string;
  diasRestantes: number;
  onClick?: (rowData: { id: string }) => void;
  historial?: boolean;
  folio?: string;
  dolares: boolean;
  tipodecambio: number;
  comision?: number;
  tarifaProveedor?: number;
  utilidad?: boolean;
  abonado?: number;
  isCliente?: boolean;
}

export default function Table(props: TableProps) {
  const [openCobradoTarifaViaje, setOpenCobradoTarifaViaje] = useState(false);
  const [openAbonadoTarifaViaje, setOpenAbonadoTarifaViaje] = useState(false);
  const [nuevoAbonoTarifaViaje, setNuevoAbonoTarifaViaje] = useState(0);
  const router = useRouter();
  const handleRowClick = (rowData: { id: string }) => {
    if (props.onClick) {
      props.onClick(rowData);
    }
  };

  const clickCobradoTarifaViaje = () => {
    setOpenCobradoTarifaViaje(!openCobradoTarifaViaje);
  };

  const clickAbonadoTarifaViaje = () => {
    setOpenAbonadoTarifaViaje(!openAbonadoTarifaViaje);
  };

  const contadoTarifaViaje = async () => {
    const key = props.isCliente ? "viaje" : "viajeproveedor";
    const id = props.isCliente ? props.id : props.idproveedor;
    try {
      await supabase
        .from(key)
        .update({ abonado: props.monto })
        .eq("id", id);
      router.reload();
    } catch (error) {
      console.error("Error al cobrar tarifa del viaje:", error);
    }
  };

  const abonoTarifaViaje = async () => {
    const key = props.isCliente ? "viaje" : "viajeproveedor";
    const id = props.isCliente ? props.id : props.idproveedor;
    try {
      await supabase
        .from(key)
        .update({ abonado: nuevoAbonoTarifaViaje })
        .eq("id", id);
      router.reload();
    } catch (error) {
      console.error("Error al abonar a la tarifa del viaje:", error);
    }
  };

  const handleAbonoTarifaViajeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoAbonoTarifaViaje(parseInt(event.target.value));
  };


  const utilidadPorViaje = props.dolares
    ? props.monto * props.tipodecambio -
      (props.comision || 0) -
      (props.tarifaProveedor || 0)
    : props.monto - (props.comision || 0) - (props.tarifaProveedor || 0);

  return (
    <main className="flex flex-col m-2 transition-all cursor-pointer duration-300 relative">
      <article className="flex flex-col items-center justify-center absolute top-[66px] right-[-20px]">
                  {props.abonado !== props.monto && props.historial === false && (
                    <PaidIcon
                      onClick={clickCobradoTarifaViaje}
                      sx={{ color: "#2f9e44", cursor: "pointer" }}
                    />
                  )}
                  <section
                    className={`flex flex-col rounded-2xl shadow-sm z-20 w-[210px] p-3 bg-white transition-all duration-300${
                      openCobradoTarifaViaje
                        ? " scale-100 opacity-100 ease-out"
                        : " scale-50 opacity-0 ease-in"
                    }`}
                    style={{
                      visibility: openCobradoTarifaViaje ? "visible" : "hidden",
                    }}
                  >
                    <article className="flex space-x-3">
                      <button
                        className="py-2 bg-blue-600 text-lg  text-white shadow-sm rounded-lg w-[90px]"
                        onClick={contadoTarifaViaje}
                      >
                        Contado
                      </button>
                      <button
                        className="py-2 bg-blue-600 text-lg text-white shadow-sm rounded-lg w-[90px]"
                        onClick={clickAbonadoTarifaViaje}
                      >
                        Abono
                      </button>
                    </article>

                    <section
                      className={`transition-all flex flex-col items-center duration-300 overflow-hidden${
                        openAbonadoTarifaViaje
                          ? " max-h-[500px] opacity-100 p-2"
                          : " max-h-0 opacity-50"
                      }`}
                      style={{
                        visibility: openAbonadoTarifaViaje
                          ? "visible"
                          : "hidden",
                      }}
                    >
                      <InputField
                        name="abonado"
                        value={nuevoAbonoTarifaViaje}
                        onChange={handleAbonoTarifaViajeChange}
                        type="number"
                      />

                      <button
                        className="py-2 bg-blue-600 m-2 text-white shadow-sm rounded-lg w-[90px]"
                        onClick={abonoTarifaViaje}
                      >
                        Guardar
                      </button>
                    </section>
                  </section>
                </article>
      <section
        className={`shadow-sm rounded-lg p-3 w-[355px] flex flex-row bg-white justify-between items-center focus:outline-none  
                    ${props.diasRestantes < 0 ? "hover:border-red-500" : ""} 
                    ${props.historial ? "hover:border-none" : ""}
                    ${
                      props.fechafactura
                        ? "hover:border-green-500"
                        : "hover:border-orange-400"
                    }
                    
                            hover:border-[.5px]
                            
                        `}
        onClick={() => handleRowClick(props)}
      >
        <article className="flex flex-col text-xs ">
          <h2 className="text-gray-400 ">Origen</h2>
          <p className="pl-[2px]">{props.origen || "N/A"}</p>
          <h2 className="text-gray-400 ">Destino</h2>
          <p className="pl-[2px]">{props.destino || "N/A"}</p>
        </article>
        <article className="flex flex-row text-xs items-center justify-center">
          {props.factura && (
            <article className="p-1">
              <h2 className="text-gray-400">Factura</h2>
              <p className="pl-[2px]">{props.factura || "N/A"}</p>
            </article>
          )}
          {props.referencia && (
            <article className="p-1">
              <h2 className="text-gray-400">Referencia</h2>
              <p className="pl-[2px]">{props.referencia || "N/A"}</p>
            </article>
          )}
          {props.utilidad && (
            <article className="p-1 ">
              <h2 className="text-gray-400 ">Utilidad</h2>
              <p className="pl-[2px]">
                {currencyFormatter.format(utilidadPorViaje || 0, {
                  code: "MXN",
                  precision: 0,
                })}
              </p>
            </article>
          )}
        </article>
        <article className="text-xs flex flex-col justify-center items-end space-y-1">
          {props.historial ? (
            <div className="bg-blue-500 rounded-full w-9 h-9 flex justify-center items-center">
              <div className="bg-white rounded-full p-1 w-8 h-8 flex justify-center items-center">
                {props.folio || "N/A"}
              </div>
            </div>
          ) : (
            <div
              className={`${
                props.fechafactura ? "bg-green-500" : "bg-orange-400"
              } rounded-full w-8 h-8 flex justify-center items-center text-sm ${
                props.diasRestantes < 0 ? "bg-red-500" : ""
              }`}
            >
              <div className="bg-white rounded-full p-1 w-7 h-7 flex justify-center items-center">
                {props.diasRestantes >= 0
                  ? props.diasRestantes
                  : `-${Math.abs(props.diasRestantes)}`}
              </div>
            </div>
          )}
        <h2 className="text-gray-400 ">Tarifa</h2>
          {props.dolares ? (
            <p className="text-sm pr-[2px]">
              {currencyFormatter.format(props.monto * props.tipodecambio, {
                code: "MXN",
                precision: 0,
              })}
            </p>
          ) : (
            <p className="text-sm pr-[2px]">
              {currencyFormatter.format(props.monto, {
                code: "MXN",
                precision: 0,
              })}
            </p>
          )}
        </article>
      </section>
    </main>
  );
}
