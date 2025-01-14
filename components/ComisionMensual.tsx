import React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell
} from "@nextui-org/table"

interface MensualProps {
  data: {
    clienteId: string
    nombre: string
    data: { [key: number]: number }
  }[]
}

interface ColumnData {
  id: string
  label: string
}

const calculateCommissionPercentage = (profit: number): number => {
  if (profit < 50000) return 0.1
  if (profit < 100000) return 0.15
  if (profit < 200000) return 0.2
  return 0.25
}

const calculateCommission = (profit: number): number => {
  return profit * calculateCommissionPercentage(profit)
}

export default function ComisionMensual({ data }: MensualProps) {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
  ]

  const columns: ColumnData[] = [
    { id: "cliente", label: "Vendedor" },
    ...months.map((month, index) => ({ id: String(index + 1), label: month }))
  ]

  const sortedClientesData = data.sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  )

  return (
    <section className='overflow-scroll bg-white  p-5'>
      <Table removeWrapper>
        <TableHeader>
          {columns.map(column => (
            <TableColumn
              key={column.id}
              className={column.id === "cliente" ? "sticky-column-header" : ""}
            >
              {column.label}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {sortedClientesData.map(cliente => (
            <TableRow key={cliente.clienteId} className='border-b'>
              {columns.map(column => {
                if (column.id === "cliente") {
                  return (
                    <TableCell key={column.id} className='sticky-column'>
                      {cliente.nombre}
                    </TableCell>
                  )
                } else {
                  const profit = cliente.data[Number(column.id)] || 0
                  const commission = calculateCommission(profit)

                  return (
                    <TableCell key={column.id} className='p-0'>
                      <div className='grid grid-rows-2 h-full'>
                        <div className='p-2 border-b bg-white'>
                          {profit !== 0
                            ? profit.toLocaleString("es-MX", {
                                style: "currency",
                                currency: "MXN"
                              })
                            : "-"}
                        </div>
                        <div className='p-2'>
                          {profit !== 0 ? (
                            <div className='flex flex-col'>
                              <span className='text-sm text-gray-600'>
                                {(
                                  calculateCommissionPercentage(profit) * 100
                                ).toFixed(0)}
                                %
                              </span>
                              <span>
                                {commission.toLocaleString("es-MX", {
                                  style: "currency",
                                  currency: "MXN"
                                })}
                              </span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </div>
                      </div>
                    </TableCell>
                  )
                }
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
