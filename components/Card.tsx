import currencyFormatter from "currency-formatter";
import Skeleton from "@mui/material/Skeleton";
import Pagination from "@mui/material/Pagination";
import { useState } from "react";

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
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const filteredData = props.clientData.filter((data) => data.monto !== 0);

  filteredData.sort((a, b) => b.monto - a.monto);

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const displayedData = filteredData.slice(startIndex, endIndex);

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
    <main className="flex flex-col bg-white  m-5 w-[320px] h-[510px] justify-center shadow-xl rounded-md p-3">
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
          <table className="w-full my-3">
            <thead>
              <tr className=" border-b-2 border-zinc-400">
                <th className="p-2 w-1/2">{props.subtitle}</th>
                <th className="p-2 w-1/2">Monto</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((data, index) => (
                <tr
                  key={index}
                  className=" border-b-2 border-zinc-300 cursor-pointer hover:bg-gray-300 transition duration-300 ease-in-out"
                  onClick={() => handleRowClick(data)}
                >
                  <td className="p-2 pl-9">{data.cliente}</td>
                  <td className="p-2 pl-9">
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
      <section className="flex justify-center items-end h-full">
        <Pagination
          count={Math.ceil(displayedData.length / itemsPerPage)}
          page={page}
          onChange={handlePageChange}
        />
      </section>
    </main>
  );
}
