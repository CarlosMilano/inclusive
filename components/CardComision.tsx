import currencyFormatter from "currency-formatter";

interface CardComision {
  comision: number;
  abonocomision: number;
  id: string;
  factura: string;
  onClick?: (rowData: { id: string }) => void;
}

export default function CardComision(props: CardComision) {
  const handleRowClick = (rowData: { id: string }) => {
    if (props.onClick) {
      props.onClick(rowData);
    }
  };

  return (
    <main
      className="shadow-sm rounded-lg p-4 w-[340px] justify-between flex flex-row bg-white m-2 gap-6 items-center hover:scale-105 transition-all cursor-pointer duration-300 focus:outline-none"
      onClick={() => handleRowClick(props)}
    >
      <article>
        <h2 className="text-gray-400 text-xs">Factura</h2>
        <p>{props.factura}</p>
      </article>
      <article className="text-sm flex flex-col">
        <h2 className="text-gray-400 text-xs">Comisión</h2>
        <p>
          {currencyFormatter.format(props.comision, {
            code: "MXN",
            precision: 0,
          })}
        </p>
      </article>
      <article className="text-sm flex flex-col">
        <h2 className="text-gray-400 text-xs">Abonado</h2>
        <p>
          {currencyFormatter.format(props.abonocomision, {
            code: "MXN",
            precision: 0,
          })}
        </p>
      </article>
    </main>
  );
}
