import currencyFormatter from "currency-formatter";

interface TableProps {
  origen: string;
  destino: string;
  monto: number;
  factura?: string;
  referencia?: string;
  id: string;
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
}

export default function Table(props: TableProps) {
  const handleRowClick = (rowData: { id: string }) => {
    if (props.onClick) {
      props.onClick(rowData);
    }
  };

  const utilidadPorViaje = props.dolares
    ? props.monto * props.tipodecambio -
      (props.comision || 0) -
      (props.tarifaProveedor || 0)
    : props.monto - (props.comision || 0) - (props.tarifaProveedor || 0);

  return (
    <main className="flex flex-col m-2 hover:scale-105 transition-all cursor-pointer duration-300">
      <section
        className={`shadow-sm rounded-lg p-3 w-[355px] flex flex-row bg-white justify-between items-center focus:outline-none  
                    ${props.diasRestantes < 0 ? "hover:border-red-500" : ""} 
                    ${props.historial ? "hover:border-none" : ""}
                    ${
                      props.fechafactura
                        ? "hover:border-green-500"
                        : "hover:border-orange-400"
                    }
                    
                            hover:border-[1px]
                            
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
