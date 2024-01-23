import currencyFormatter from "currency-formatter";
import Skeleton from "@mui/material/Skeleton";

interface CardProveedor {
  origen: string;
  destino: string;
  monto: number;
  factura: string;
  referencia: string;
  id: string;
  onClick?: (rowData: { id: string }) => void;
  loading: boolean;
}

export default function CardProveedor(props: CardProveedor) {
  const handleRowClick = (rowData: { id: string }) => {
    if (props.onClick) {
      props.onClick(rowData);
    }
  };

  return (
    <main
      className="shadow-md rounded-lg p-4 w-[320px] justify-between flex flex-row bg-white m-2 gap-6 items-center hover:scale-105 transition-all cursor-pointer duration-300 focus:outline-none"
      onClick={() => handleRowClick(props)}
    >
      <article className="flex flex-col text-sm">
        <h2 className="text-gray-400 text-xs">Origen</h2>
        <p>{props.origen}</p>
      </article>
      <article className="flex flex-col text-sm">
        <h2 className="text-gray-400 text-xs">Destino</h2>
        <p>{props.destino}</p>
      </article>
      <article className="text-sm flex flex-col">
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
