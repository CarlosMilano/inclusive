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
}

export default function Table(props: TableProps) {
  const handleRowClick = (rowData: { id: string }) => {
    if (props.onClick) {
      props.onClick(rowData);
    }
  };

  return (
    <main
      className={`shadow-md rounded-lg p-5 w-[355px] flex flex-row bg-white m-2 justify-between items-center hover:scale-105 transition-all cursor-pointer duration-300 focus:outline-none  
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
      <article className="flex flex-col text-sm">
        <h2 className="text-gray-400 text-xs">Origen</h2>
        <p>{props.origen || "N/A"}</p>
        <h2 className="text-gray-400 text-xs">Destino</h2>
        <p>{props.destino || "N/A"}</p>
      </article>
      <article className="flex flex-row text-sm items-center justify-center">
        {props.factura && (
          <article className="p-2">
            <h2 className="text-gray-400 text-xs">Factura</h2>
            <p>{props.factura || "N/A"}</p>
          </article>
        )}
        {props.referencia && (
          <article className="p-2">
            <h2 className="text-gray-400 text-xs">Referencia</h2>
            <p>{props.referencia || "N/A"}</p>
          </article>
        )}
      </article>
      <article className="text-sm flex flex-col justify-center items-end space-y-1">
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
            } rounded-full w-8 h-8 flex justify-center items-center ${
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
        <h2 className="text-gray-400 text-xs">Tarifa</h2>
        <p>
          {currencyFormatter.format(props.monto, {
            code: "MXN",
            precision: 0,
          })}
        </p>
      </article>
    </main>
  );
}
