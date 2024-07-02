import React from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell
} from '@nextui-org/table'

interface VxCProps {
  data: {
    clienteId: string
    nombre: string
    anio: number
    viajes: number
  }[]
}

interface ClienteData {
  clienteId: string
  nombre: string
  viajes: Record<string, number>
}

interface ColumnData {
  id: string
  label: string
}

export default function VxC({ data }: VxCProps) {
  const uniqueYears = Array.from(new Set(data.map(item => item.anio))).sort()

  const columns: ColumnData[] = [
    { id: 'cliente', label: 'Clientes' },
    ...uniqueYears.map(year => ({ id: String(year), label: String(year) }))
  ]

  const clientesData = Object.values(
    data.reduce((acc, item) => {
      if (!acc[item.clienteId]) {
        acc[item.clienteId] = {
          clienteId: item.clienteId,
          nombre: item.nombre,
          viajes: {}
        }
      }
      acc[item.clienteId].viajes[item.anio] = item.viajes
      return acc
    }, {} as Record<string, ClienteData>)
  )
  const sortedClientesData = clientesData.sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  )

  return (
    <Table>
      <TableHeader>
        {columns.map(column => (
          <TableColumn key={column.id}>{column.label}</TableColumn>
        ))}
      </TableHeader>
      <TableBody>
        {sortedClientesData.map(cliente => (
          <TableRow key={cliente.clienteId}>
            {columns.map(column => {
              if (column.id === 'cliente') {
                return <TableCell key={column.id}>{cliente.nombre}</TableCell>
              } else {
                return (
                  <TableCell key={column.id}>
                    {cliente.viajes[column.id] || '-'}
                  </TableCell>
                )
              }
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
