import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";

interface VentasProps {
  ventasArray: any[];
  years: number[];
  clientes: any[];
  totalVentas: number;
}

interface ColumnData {
  id: string;
  label: string;
}

export default function Anual({
  ventasArray,
  years,
  clientes,
  totalVentas,
}: VentasProps) {
  const sortedYears = years.sort((a, b) => a - b);
  const sortedClientes = clientes.sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  );

  const renderVentasCells = (clienteId: number, year: number) => {
    const ventaClienteAnio = ventasArray?.find(
      (venta) => venta.cliente_id === clienteId && venta[year]
    );
    const venta =
      ventaClienteAnio && ventaClienteAnio[year]
        ? ventaClienteAnio[year].toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN",
          })
        : "-";
    return <TableCell key={`${clienteId}-${year}`}>{venta}</TableCell>;
  };

  const calcularTotalAnio = (year: string) => {
    return ventasArray
      .filter((venta) => venta[year])
      .reduce((total, venta) => total + venta[year], 0)
      .toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
      });
  };

  const renderTotalAnual = (clienteId: number) => {
    const totalAnual = years.reduce((sum, year) => {
      const ventaClienteAnio = ventasArray?.find(
        (venta) => venta.cliente_id === clienteId && venta[year]
      );
      const venta =
        ventaClienteAnio && ventaClienteAnio[year] ? ventaClienteAnio[year] : 0;
      return sum + venta;
    }, 0);
    const total =
      totalAnual?.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
      }) || "-";
    return <TableCell key={`${clienteId}-total`}>{total}</TableCell>;
  };

  const calcularTotalTodosAnios = () => {
    const total = sortedYears.reduce((sum, year) => {
      const totalAnio = calcularTotalAnio(String(year));
      return sum + parseFloat(totalAnio.replace(/[^0-9.-]+/g, ""));
    }, 0);
    return total.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });
  };

  const sinFecha =
    totalVentas -
    parseFloat(calcularTotalTodosAnios().replace(/[^0-9.-]+/g, ""));

  const columns: ColumnData[] = [
    { id: "cliente", label: "Clientes" },
    ...sortedYears.map((year) => ({ id: String(year), label: String(year) })),
    { id: "total", label: "Total" },
  ];

  const columnsYear: ColumnData[] = [
    { id: "año", label: "Clientes" },
    ...sortedYears.map((year) => ({ id: String(year), label: String(year) })),
    { id: "total", label: "Total" },
  ];

  return (
    <main className="bg-white rounded-md shadow-sm p-2">
      <section className="flex flex-wrap gap-5 md:gap-10 p-4">
        <article>
          <h2 className="text-lg text-gray-500 font-bold">Venta</h2>
          <h3 className="text-2xl">
            {parseFloat(
              calcularTotalTodosAnios().replace(/[^0-9.-]+/g, "")
            ).toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN",
            })}
          </h3>
        </article>
        <article>
          <h2 className="text-lg text-gray-500 font-bold">Sin Fecha</h2>
          <h3 className="text-2xl">
            {sinFecha.toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN",
            })}
          </h3>
        </article>
        <article>
          <h2 className="text-lg text-gray-500 font-bold">Venta Total</h2>
          <h3 className="text-2xl">
            {totalVentas.toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN",
            })}
          </h3>
        </article>
      </section>
      <section className="overflow-scroll">
        <Table aria-label="Example static collection table" removeWrapper>
          <TableHeader>
            {columns.map((column) => (
              <TableColumn key={column.id}>{column.label}</TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {sortedClientes.map((cliente) => {
              return (
                <TableRow key={cliente.id}>
                  {columns.map((column) => {
                    if (column.id === "cliente") {
                      return (
                        <TableCell key={`${cliente.id}-cliente`}>
                          {cliente.nombre}
                        </TableCell>
                      );
                    } else if (column.id === "total") {
                      return renderTotalAnual(cliente.id);
                    } else {
                      return renderVentasCells(cliente.id, parseInt(column.id));
                    }
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Table
          aria-label="Example static collection table"
          removeWrapper
          hideHeader
        >
          <TableHeader>
            {columnsYear.map((column) => (
              <TableColumn key={column.id}>{column.label}</TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            <TableRow>
              {columnsYear.map((column) => {
                if (column.id === "año") {
                  return (
                    <TableCell
                      key={column.id}
                      className="text-md pr-5 md:pr-16"
                    >
                      Total
                    </TableCell>
                  );
                } else if (column.id === "total") {
                  const totalTodosAnios = calcularTotalTodosAnios();
                  return (
                    <TableCell key={column.id} className=" text-left">
                      {totalTodosAnios}
                    </TableCell>
                  );
                } else {
                  const totalAnio = calcularTotalAnio(column.id);
                  return <TableCell key={column.id}>{totalAnio}</TableCell>;
                }
              })}
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </main>
  );
}
