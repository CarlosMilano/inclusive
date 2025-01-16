import React, { useEffect, useState } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@nextui-org/table"
import currencyFormatter from "currency-formatter"
import { Viaje } from "@/types/Viaje"
import { Skeleton } from "@mui/material"
import supabase from "@/pages/api/supabase"
import { Vendedor } from "@/types/Vendedor"
import { useRouter } from "next/router"

interface VendedorMonto {
  vendedor: string
  monto: number
}

interface VendedoresTableProps {
  viajes: Viaje[]
  loading: boolean
}

const VendedoresTable: React.FC<VendedoresTableProps> = ({
  viajes,
  loading
}) => {
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const router = useRouter()
  const vendedoresMontos = viajes.reduce<{ [key: string]: VendedorMonto }>(
    (acc, viaje) => {
      if (viaje.abonado !== viaje.tarifa) {
        const montoViaje = viaje.dolares
          ? (viaje.tarifa - viaje.abonado) * viaje.tipodecambio
          : viaje.tarifa - viaje.abonado

        acc[viaje.vendedor_id] = {
          monto: (acc[viaje.vendedor_id]?.monto || 0) + montoViaje,
          vendedor: viaje.vendedor_id
        }
      }
      return acc
    },
    {}
  )

  const fetchVendedores = async (vendedorIds: string[]) => {
    const { data, error } = await supabase
      .from("vendedor")
      .select("id, nombre")
      .in("id", vendedorIds)

    if (error) {
      console.error("Error fetching vendedores:", error)
      return []
    }

    return data
  }

  const vendedoresList = Object.values(vendedoresMontos).map(item => {
    const vendedor = vendedores.find(v => v.id === item.vendedor)
    return {
      ...item,
      vendedor: vendedor ? vendedor.nombre : "Cargando...",
      id: vendedor ? vendedor.id : "Cargando..."
    }
  })
  const totalMonto = vendedoresList.reduce((sum, item) => sum + item.monto, 0)

  useEffect(() => {
    const cargarVendedores = async () => {
      const vendedorIds = Array.from(new Set(viajes.map(v => v.vendedor_id))) // IDs únicos
      const vendedoresData = await fetchVendedores(vendedorIds)
      setVendedores(vendedoresData)
    }

    if (viajes.length > 0) {
      cargarVendedores()
    }
  }, [viajes])

  const handleRowClick = (id: string) => {
    router.push(`/vendedor/${id}`)
  }

  return (
    <main className='flex flex-col w-[90%] max-w-[370px] bg-white rounded-[14px] p-3 shadow-sm'>
      <section className='flex flex-col gap-2 items-center p-5'>
        <h1 className='text-2xl text-gray-500 font-bold '>Vendedores</h1>
        {loading ? (
          <Skeleton width='60%' height={40} animation='wave' />
        ) : (
          <h2 className='text-3xl'>
            {currencyFormatter.format(totalMonto, {
              code: "MXN",
              precision: 0
            })}
          </h2>
        )}
      </section>
      <section className='flex flex-col items-center'>
        {loading ? (
          <div className='mt-3'>
            <Skeleton
              variant='rectangular'
              width={330}
              height={400}
              animation='wave'
            />
          </div>
        ) : (
          <Table aria-label='Example static collection table' removeWrapper>
            <TableHeader>
              <TableColumn className='text-base'>Vendedor</TableColumn>
              <TableColumn className='text-base'>Monto</TableColumn>
            </TableHeader>
            <TableBody>
              {vendedoresList.map((item, index) => (
                <TableRow
                  key={index}
                  onClick={() => handleRowClick(item.id)}
                  className='cursor-pointer hover:bg-[#F4F4F5]  transition-all ease-in-out duration-300'
                >
                  <TableCell className='text-base'>{item.vendedor}</TableCell>
                  <TableCell className='text-base'>
                    {currencyFormatter.format(item.monto, {
                      code: "MXN",
                      precision: 0
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </main>
  )
}

export default VendedoresTable
