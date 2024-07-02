import React from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell
} from '@nextui-org/table'

interface MensualProps {
  data: {
    clienteId: string
    nombre: string
    data: { [key: number]: number }
  }[]
  mostrarMoneda: boolean
}

interface ColumnData {
  id: string
  label: string
}

export default function Mensual({ data, mostrarMoneda }: MensualProps) {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ]

  const columns: ColumnData[] = [
    { id: 'cliente', label: 'Clientes' },
    ...months.map((month, index) => ({ id: String(index + 1), label: month }))
  ]

  const sortedClientesData = data.sort((a, b) =>
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
                const cellData = cliente.data[Number(column.id)]
                return (
                  <TableCell key={column.id}>
                    {cellData !== undefined
                      ? mostrarMoneda
                        ? cellData.toLocaleString('es-MX', {
                            style: 'currency',
                            currency: 'MXN'
                          })
                        : cellData
                      : '-'}
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
