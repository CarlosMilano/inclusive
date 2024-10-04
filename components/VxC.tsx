import React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell
} from "@nextui-org/table"

interface VxCProps {
  data: {
    clienteId: string
    nombre: string
    anio: number
    viajes: number
  }[]
}

interface ColumnData {
  id: string
  label: string
}

export default function VxC({ data }: VxCProps) {
  const years = Array.from(new Set(data.map(item => item.anio))).sort(
    (a, b) => a - b
  )

  const columns: ColumnData[] = [
    { id: "cliente", label: "Cliente" },
    ...years.map(year => ({ id: String(year), label: String(year) })),
    { id: "total", label: "Total" }
  ]

  const viajesPorCliente = data.reduce((acc, item) => {
    if (!acc[item.clienteId]) {
      acc[item.clienteId] = { nombre: item.nombre, viajes: {} }
    }
    acc[item.clienteId].viajes[item.anio] = item.viajes
    return acc
  }, {} as Record<string, { nombre: string; viajes: Record<number, number> }>)

  const calcularTotalAnio = (year: number) => {
    return Object.values(viajesPorCliente).reduce((total, cliente) => {
      return total + (cliente.viajes[year] || 0)
    }, 0)
  }

  const calcularTotalCliente = (clienteId: string) => {
    return Object.values(viajesPorCliente[clienteId].viajes).reduce(
      (total, viajes) => total + viajes,
      0
    )
  }

  const calcularTotalGeneral = () => {
    return Object.values(viajesPorCliente).reduce((total, cliente) => {
      return (
        total +
        Object.values(cliente.viajes).reduce(
          (clienteTotal, viajes) => clienteTotal + viajes,
          0
        )
      )
    }, 0)
  }

  return (
    <main className='bg-white rounded-md shadow-sm p-2'>
      <section className='flex flex-wrap gap-5 md:gap-10 p-4'>
        <article>
          <h2 className='text-lg text-gray-500 font-bold'>Total de Viajes</h2>
          <h3 className='text-2xl'>{calcularTotalGeneral()}</h3>
        </article>
      </section>
      <section className='overflow-scroll'>
        <Table aria-label='Viajes por Cliente' removeWrapper>
          <TableHeader>
            {columns.map(column => (
              <TableColumn key={column.id}>{column.label}</TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {Object.entries(viajesPorCliente).map(([clienteId, cliente]) => (
              <TableRow key={clienteId}>
                {columns.map(column => {
                  if (column.id === "cliente") {
                    return (
                      <TableCell key={column.id}>{cliente.nombre}</TableCell>
                    )
                  } else if (column.id === "total") {
                    return (
                      <TableCell key={column.id}>
                        {calcularTotalCliente(clienteId)}
                      </TableCell>
                    )
                  } else {
                    const year = parseInt(column.id)
                    return (
                      <TableCell key={column.id}>
                        {cliente.viajes[year] || "-"}
                      </TableCell>
                    )
                  }
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Table aria-label='Totales por Año' removeWrapper hideHeader>
          <TableHeader>
            {columns.map(column => (
              <TableColumn key={column.id}>{column.label}</TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            <TableRow>
              {columns.map(column => {
                if (column.id === "cliente") {
                  return <TableCell key={column.id}>Total</TableCell>
                } else if (column.id === "total") {
                  return (
                    <TableCell key={column.id}>
                      {calcularTotalGeneral()}
                    </TableCell>
                  )
                } else {
                  const year = parseInt(column.id)
                  return (
                    <TableCell key={column.id}>
                      {calcularTotalAnio(year)}
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
