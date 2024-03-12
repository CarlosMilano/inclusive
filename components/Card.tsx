import currencyFormatter from "currency-formatter";
import Skeleton from "@mui/material/Skeleton";

interface CardProps {
  title: string;
  subtitle: "Cliente" | "Proveedor";
  total: number;
  clientData: {
    cliente: string;
    monto: number;
    id: string;
  }[];
  loading: boolean;
  onClick?: (rowData: { cliente: string; monto: number; id: string }) => void;
}

export default function Card(props: CardProps) {
  const formattedTotal = currencyFormatter.format(props.total, {
    code: "MXN",
    precision: 0,
  });

  const filteredData = props.clientData.filter((data) => data.monto !== 0);

  filteredData.sort((a, b) => b.monto - a.monto);

  const handleRowClick = (rowData: {
    cliente: string;
    monto: number;
    id: string;
  }) => {
    if (props.onClick) {
      props.onClick(rowData);
    }
  };

  return (
    <main className="flex flex-col bg-white w-[90%] max-w-[370px] min-h-[510px] shadow-sm rounded-md p-3">
      <section className="flex flex-col items-center">
        <h1 className="text-4xl font-semibold p-5">
          {props.title || "Titulo"}
        </h1>
        {props.loading ? (
          <Skeleton width="60%" height={40} animation="wave" />
        ) : (
          <h2 className="text-xl p-3">{formattedTotal}</h2>
        )}
      </section>
      <section className="flex flex-col items-center">
        {props.loading ? (
          <div className="mt-3">
            <Skeleton
              variant="rectangular"
              width={290}
              height={310}
              animation="wave"
            />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className=" border-b-2 border-zinc-300">
                <th className="p-2 w-1/2">{props.subtitle}</th>
                <th className="p-2 w-1/2">Monto</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((data, index) => (
                <tr
                  key={index}
                  className=" border-b-2 border-zinc-200 cursor-pointer hover:bg-gray-100 transition duration-300 ease-in-out"
                  onClick={() => handleRowClick(data)}
                >
                  <td className="p-2 pl-8">{data.cliente}</td>
                  <td className="p-2 pl-8">
                    {currencyFormatter.format(data.monto, {
                      code: "MXN",
                      precision: 0,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
