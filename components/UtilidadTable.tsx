import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell
} from "@nextui-org/table"

interface VentasProps {
  ventasArray: any[]
  years: number[]
  totalUtilidad: number
  title: string
}

interface ColumnData {
  id: string
  label: string
}

export default function Utilitdad({
  ventasArray,
  totalUtilidad,
  years,
  title
}: VentasProps) {
  const sortedYears = years.sort((a, b) => a - b)

  const calcularTotalAnio = (year: string) => {
    return ventasArray
      .filter(venta => venta[year])
      .reduce((total, venta) => total + venta[year], 0)
      .toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN"
      })
  }

  const renderVentasCells = (mes: number, year: number) => {
    const ventasMesAnio = ventasArray.filter(
      venta => venta.mes === mes && venta[year]
    )
    const venta =
      ventasMesAnio.length > 0
        ? ventasMesAnio[0][year].toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN"
          })
        : "-"
    return <TableCell key={`${mes}-${year}`}>{venta}</TableCell>
  }

  const totalMes = (mes: number) => {
    const total = sortedYears
      .reduce((sum, year) => {
        const ventasMesAnio = ventasArray.filter(
          venta => venta.mes === mes && venta[year]
        )
        const totalAnio = ventasMesAnio.length > 0 ? ventasMesAnio[0][year] : 0
        return sum + totalAnio
      }, 0)
      .toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN"
      })
    return <TableCell key={`${mes}`}>{total}</TableCell>
  }

  const calcularTotalTodosAnios = () => {
    const total = sortedYears.reduce((sum, year) => {
      const totalAnio = calcularTotalAnio(String(year))
      return sum + parseFloat(totalAnio.replace(/[^0-9.-]+/g, ""))
    }, 0)
    return total.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN"
    })
  }

  const columns: ColumnData[] = [
    { id: "mes", label: "Mes" },
    ...sortedYears.map(year => ({ id: String(year), label: String(year) })),
    { id: "total", label: "Total" }
  ]

  const columnsYear: ColumnData[] = [
    { id: "año", label: "Año" },
    ...sortedYears.map(year => ({ id: String(year), label: String(year) })),
    { id: "total", label: "Total" }
  ]

  const sinFecha =
    totalUtilidad -
    parseFloat(calcularTotalTodosAnios().replace(/[^0-9.-]+/g, ""))

  return (
    <main className='bg-white rounded-md shadow-sm p-2'>
      <section className='flex flex-wrap gap-5 md:gap-10 p-4'>
        <article>
          <h2 className='text-lg text-gray-500 font-bold'>{title}</h2>
          <h3 className='text-2xl'>
            {parseFloat(
              calcularTotalTodosAnios().replace(/[^0-9.-]+/g, "")
            ).toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN"
            })}
          </h3>
        </article>
        <article>
          <h2 className='text-lg text-gray-500 font-bold'>Sin Fecha</h2>
          <h3 className='text-2xl'>
            {sinFecha.toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN"
            })}
          </h3>
        </article>
        <article>
          <h2 className='text-lg text-gray-500 font-bold'>Utilidad Total</h2>
          <h3 className='text-2xl'>
            {totalUtilidad.toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN"
            })}
          </h3>
        </article>
      </section>
      <section className='overflow-scroll'>
        <Table aria-label='Example static collection table' removeWrapper>
          <TableHeader>
            {columns.map(column => (
              <TableColumn key={column.id}>{column.label}</TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {[...Array(12)].map((_, index) => {
              const mes = index + 1
              return (
                <TableRow key={mes}>
                  {columns.map(column => {
                    if (column.id === "mes") {
                      return <TableCell key={column.id}>{mes}</TableCell>
                    } else if (column.id === "total") {
                      return totalMes(mes)
                    } else {
                      return renderVentasCells(mes, parseInt(column.id))
                    }
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <Table
          aria-label='Example static collection table'
          removeWrapper
          hideHeader
        >
          <TableHeader>
            {columnsYear.map(column => (
              <TableColumn key={column.id}>{column.label}</TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            <TableRow>
              {columnsYear.map(column => {
                if (column.id === "año") {
                  return (
                    <TableCell key={column.id} className='text-xs md:text-sm'>
                      Total
                    </TableCell>
                  )
                } else if (column.id === "total") {
                  const totalTodosAnios = calcularTotalTodosAnios()
                  return (
                    <TableCell key={column.id} className='md:pr-[14px]'>
                      {totalTodosAnios}
                    </TableCell>
                  )
                } else {
                  const totalAnio = calcularTotalAnio(column.id)
                  return (
                    <TableCell key={column.id} className='text-xs md:text-sm '>
                      {totalAnio}
                    </TableCell>
                  )
                }
              })}
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </main>
  )
}
