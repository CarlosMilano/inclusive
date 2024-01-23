import currencyFormatter from "currency-formatter";
import Skeleton from "@mui/material/Skeleton";

interface TableProps {
  origen: string;
  destino: string;
  monto: number;
  factura: string;
  referencia: string;
  id: string;
  fechafactura: string;
  diasRestantes: number;
  onClick?: (rowData: { id: string }) => void;
  loading: boolean;
}

export default function Table(props: TableProps) {
  const handleRowClick = (rowData: { id: string }) => {
    if (props.onClick) {
      props.onClick(rowData);
    }
  };

  return (
    <main
      className={`shadow-md rounded-lg p-4 w-[320px] flex flex-row bg-white m-2 gap-6 items-center hover:scale-105 transition-all cursor-pointer duration-300 focus:outline-none 
                    ${
                      props.diasRestantes < 0
                        ? "hover:border-red-500"
                        : "hover:border-green-500"
                    } 
                            hover:border-[1px]
                        `}
      onClick={() => handleRowClick(props)}
    >
      <article className="flex flex-col text-sm w-[20%]">
        <h2 className="text-gray-400 text-xs">Origen</h2>
        <p>{props.origen}</p>
        <h2 className="text-gray-400 text-xs">Destino</h2>
        <p>{props.destino}</p>
      </article>
      <article className="flex flex-row text-sm w-[60%] items-center justify-center">
        <article className="p-2">
          <h2 className="text-gray-400 text-xs">Factura</h2>
          <p>{props.factura}</p>
        </article>
        <article className="p-2">
          <h2 className="text-gray-400 text-xs">Referencia</h2>
          <p>{props.referencia}</p>
        </article>
      </article>
      <article className="text-sm w-[20%] flex flex-col justify-center items-end space-y-1">
        <div
          className={`bg-green-500 rounded-full w-8 h-8 flex justify-center items-center ${
            props.diasRestantes < 0 ? "bg-red-500" : ""
          }`}
        >
          <div className="bg-white rounded-full p-1 w-7 h-7 flex justify-center items-center">
            {props.diasRestantes >= 0
              ? props.diasRestantes
              : `-${Math.abs(props.diasRestantes)}`}
          </div>
        </div>
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
