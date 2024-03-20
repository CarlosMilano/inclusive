import currencyFormatter from "currency-formatter";
import Skeleton from "@mui/material/Skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";

interface CardProps {
  title: string;
  subtitle: "Cliente" | "Proveedor";
  total: number;
  clientData: {
    cliente: string;
    monto: number;
    id: string;
    vencidas?: number;
  }[];
  loading: boolean;
  facturas?: boolean;
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
    <main className="flex flex-col w-[90%] max-w-[370px] bg-white rounded-[14px] p-3 shadow-sm">
      <section className="flex flex-col gap-2 items-center p-5">
        <h1 className="text-2xl text-gray-500 font-bold ">
          {props.title || "Titulo"}
        </h1>
        {props.loading ? (
          <Skeleton width="60%" height={40} animation="wave" />
        ) : (
          <h2 className="text-3xl">{formattedTotal}</h2>
        )}
      </section>
      <section className="flex flex-col items-center">
        {props.loading ? (
          <div className="mt-3">
            <Skeleton
              variant="rectangular"
              width={330}
              height={400}
              animation="wave"
            />
          </div>
        ) : (
          <Table aria-label="Example static collection table" removeWrapper>
            <TableHeader>
              <TableColumn className="text-base">{props.subtitle}</TableColumn>
              <TableColumn className="text-base">Monto</TableColumn>
              <TableColumn className="text-base">Vencidas</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredData.map((data, index) => (
                <TableRow
                  key={index}
                  onClick={() => handleRowClick(data)}
                  className="cursor-pointer hover:bg-[#F4F4F5]  transition-all ease-in-out duration-300"
                >
                  <TableCell className="text-base">{data.cliente}</TableCell>
                  <TableCell className="text-base">
                    {currencyFormatter.format(data.monto, {
                      code: "MXN",
                      precision: 0,
                    })}
                  </TableCell>
                  <TableCell className="text-base text-center">
                    {data.vencidas || 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </main>
  );
}
