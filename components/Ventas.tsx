import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";

interface VentasProps {
  data: any[];
  years: number[];
}

export default function Ventas({ data, years }: VentasProps) {
  const sortedYears = years.sort((a, b) => a - b);

  return (
    <main className="bg-white rounded-md shadow-sm p-2">
      <Table
        aria-label="Example static collection table"
        removeWrapper
        className=" overflow-auto"
      >
        <TableHeader>
          <TableColumn> Mes </TableColumn>
          {sortedYears.map((year) => (
            <TableColumn key={year}>{year}</TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {[...Array(12)].map((_, index) => {
            const mes = index + 1;
            return (
              <TableRow key={mes}>
                <TableCell>{mes}</TableCell>
                {sortedYears.map((year) => (
                  <TableCell key={`${mes}-${year}`}>
                    {data
                      .find((venta) => venta.mes === mes && venta[year])
                      ?.[year]?.toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      }) || "-"}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </main>
  );
}
