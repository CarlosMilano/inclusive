import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Box, CircularProgress } from '@mui/material'
import Anual from '@/components/Anual'
import Mensual from '@/components/Mensual'
import Utilidad from '@/components/UtilidadTable'
import { Select, SelectItem } from '@nextui-org/select'
import supabase from '../api/supabase'
import { Cliente } from '@/types/Cliente'
import { Proveedor } from '@/types/Proveedor'

export default function Reportes() {
  const [loading, setLoading] = useState(true)
  const [loadingReporte, setLoadingReporte] = useState(true)
  const [reporte, setReporte] = useState('Utilidad')
  const [utilidadData, setUtilidadData] = useState<{
    ventasArray: any[]
    totalUtilidad: number
  }>({ ventasArray: [], totalUtilidad: 0 })

  const [years, setYears] = useState<number[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [ventasData, setVentasData] = useState<{
    ventasArray: any[]
    totalVentas: number
    utilidadArray: any[]
  }>({ ventasArray: [], totalVentas: 0, utilidadArray: [] })
  const [proveedoresData, setProveedoresData] = useState<{
    proveedoresArray: any[]
    totalProveedores: number
  }>({ proveedoresArray: [], totalProveedores: 0 })

  useEffect(() => {
    async function fetchUtilidadData() {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from('viaje')
          .select('*')
        const { data: proveedoresData, error: proveedoresError } =
          await supabase.from('viajeproveedor').select('*')

        if (viajesError) throw viajesError
        if (proveedoresError) throw proveedoresError

        const uniqueYears = Array.from(
          new Set(
            viajesData
              .filter(
                (viaje: any) => viaje.fechafactura && viaje.fechafactura !== ''
              )
              .map((viaje: any) => new Date(viaje.fechafactura).getFullYear())
          )
        ).sort((a, b) => a - b)
        setYears(uniqueYears)

        const ventasPorMesAnio = viajesData.reduce((acc: any, viaje: any) => {
          if (viaje.fechafactura && viaje.fechafactura !== '') {
            const fecha = new Date(viaje.fechafactura)
            const mes = fecha.getUTCMonth() + 1 // Los meses en JavaScript son base 0, +1 para base 1
            const anio = fecha.getUTCFullYear()
            let tarifaViaje = viaje.tarifa
            if (viaje.dolares && viaje.tipodecambio) {
              tarifaViaje *= viaje.tipodecambio
            }

            const proveedoresDelViaje = proveedoresData.filter(
              (proveedor: any) => proveedor.viaje_id === viaje.id
            )
            let tarifaProveedores = 0
            proveedoresDelViaje.forEach((proveedor: any) => {
              let tarifaProveedor = proveedor.tarifa
              if (proveedor.dolares && viaje.tipodecambio) {
                tarifaProveedor *= viaje.tipodecambio
              }
              tarifaProveedores += tarifaProveedor
            })

            const comision = viaje.comision
            const utilidad = tarifaViaje - comision - tarifaProveedores

            if (!acc[mes]) {
              acc[mes] = { mes, [anio]: utilidad }
            } else {
              if (!acc[mes][anio]) {
                acc[mes][anio] = utilidad
              } else {
                acc[mes][anio] += utilidad
              }
            }
          }
          return acc
        }, {})

        const ventasArray = Object.keys(ventasPorMesAnio).map(mes => ({
          mes: parseInt(mes, 10),
          ...ventasPorMesAnio[mes]
        }))

        const totalUtilidad = viajesData.reduce((acc: number, viaje: any) => {
          let tarifaViaje = viaje.tarifa
          if (viaje.dolares && viaje.tipodecambio) {
            tarifaViaje *= viaje.tipodecambio
          }

          const proveedoresDelViaje = proveedoresData.filter(
            (proveedor: any) => proveedor.viaje_id === viaje.id
          )
          let tarifaProveedores = 0
          proveedoresDelViaje.forEach((proveedor: any) => {
            let tarifaProveedor = proveedor.tarifa
            if (proveedor.dolares && viaje.tipodecambio) {
              tarifaProveedor *= viaje.tipodecambio
            }
            tarifaProveedores += tarifaProveedor
          })

          const comision = viaje.comision
          const utilidad = tarifaViaje - comision - tarifaProveedores

          return acc + utilidad
        }, 0)

        setUtilidadData({ ventasArray, totalUtilidad })
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    async function fetchVentasData() {
      try {
        const { data: clientesData, error: clientesError } = await supabase
          .from('cliente')
          .select('*')
        if (clientesError) throw clientesError
        const clientes = clientesData || []

        const { data: viajesData, error: viajesError } = await supabase
          .from('viaje')
          .select('*')
        if (viajesError) throw viajesError
        const viajes = viajesData || []

        const { data: proveedoresData, error: proveedoresError } =
          await supabase.from('viajeproveedor').select('*')
        if (proveedoresError) throw proveedoresError

        const ventasPorClientePorAnio = viajes.reduce(
          (acc: any, viaje: any) => {
            if (viaje.fechafactura && viaje.fechafactura !== '') {
              const fecha = new Date(viaje.fechafactura)
              const anio = fecha.getFullYear()
              let tarifaViaje = viaje.tarifa
              if (viaje.dolares && viaje.tipodecambio) {
                tarifaViaje *= viaje.tipodecambio
              }

              if (!acc[viaje.cliente_id]) {
                acc[viaje.cliente_id] = { cliente_id: viaje.cliente_id }
              }

              if (!acc[viaje.cliente_id][anio]) {
                acc[viaje.cliente_id][anio] = tarifaViaje
              } else {
                acc[viaje.cliente_id][anio] += tarifaViaje
              }
            }
            return acc
          },
          {}
        )

        const utilidadPorClientePorAnio = viajes.reduce(
          (acc: any, viaje: any) => {
            if (viaje.fechafactura && viaje.fechafactura !== '') {
              const fecha = new Date(viaje.fechafactura)
              const anio = fecha.getFullYear()
              let tarifaViaje = viaje.tarifa
              if (viaje.dolares && viaje.tipodecambio) {
                tarifaViaje *= viaje.tipodecambio
              }

              const proveedoresDelViaje = proveedoresData.filter(
                (proveedor: any) => proveedor.viaje_id === viaje.id
              )
              let tarifaProveedores = 0
              proveedoresDelViaje.forEach((proveedor: any) => {
                let tarifaProveedor = proveedor.tarifa
                if (proveedor.dolares && viaje.tipodecambio) {
                  tarifaProveedor *= viaje.tipodecambio
                }
                tarifaProveedores += tarifaProveedor
              })

              const comision = viaje.comision
              const utilidad = tarifaViaje - comision - tarifaProveedores

              if (!acc[viaje.cliente_id]) {
                acc[viaje.cliente_id] = { cliente_id: viaje.cliente_id }
              }

              if (!acc[viaje.cliente_id][anio]) {
                acc[viaje.cliente_id][anio] = utilidad
              } else {
                acc[viaje.cliente_id][anio] += utilidad
              }
            }
            return acc
          },
          {}
        )

        const utilidadArray = Object.keys(utilidadPorClientePorAnio).map(
          clienteId => ({
            cliente_id: clienteId,
            ...utilidadPorClientePorAnio[clienteId]
          })
        )

        const ventasArray = Object.keys(ventasPorClientePorAnio).map(
          clienteId => ({
            cliente_id: clienteId,
            ...ventasPorClientePorAnio[clienteId]
          })
        )

        const totalVentas = viajes.reduce((acc: number, viaje: any) => {
          let tarifaViaje = viaje.tarifa
          if (viaje.dolares && viaje.tipodecambio) {
            tarifaViaje *= viaje.tipodecambio
          }
          return acc + tarifaViaje
        }, 0)

        setVentasData({ ventasArray, totalVentas, utilidadArray })
        setClientes(clientes)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    async function fetchProveedoresData() {
      try {
        const { data: proveedoresData, error: proveedoresError } =
          await supabase.from('proveedor').select('*')
        if (proveedoresError) throw proveedoresError
        const proveedores = proveedoresData || []

        const { data: viajeData, error: viajeError } = await supabase
          .from('viaje')
          .select('*')
        if (viajeError) throw viajeError
        const viajes = viajeData || []

        const { data: viajesProveedorData, error: viajesError } = await supabase
          .from('viajeproveedor')
          .select('*')
        if (viajesError) throw viajesError
        const viajesProveedor = viajesProveedorData || []

        const proveedoresPorAnio = viajesProveedor.reduce(
          (acc: any, viajeProveedor: any) => {
            const viajeCorrespondiente = viajes.find(
              viaje => viaje.id === viajeProveedor.viaje_id
            )

            if (
              viajeCorrespondiente &&
              viajeCorrespondiente.fechafactura &&
              viajeCorrespondiente.fechafactura !== ''
            ) {
              const fecha = new Date(viajeCorrespondiente.fechafactura)
              const anio = fecha.getFullYear()
              let tarifaProveedor = viajeProveedor.tarifa
              if (viajeProveedor.dolares && viajeCorrespondiente.tipodecambio) {
                tarifaProveedor *= viajeCorrespondiente.tipodecambio
              }

              if (!acc[viajeProveedor.proveedor_id]) {
                acc[viajeProveedor.proveedor_id] = {
                  proveedor_id: viajeProveedor.proveedor_id
                }
              }

              if (!acc[viajeProveedor.proveedor_id][anio]) {
                acc[viajeProveedor.proveedor_id][anio] = tarifaProveedor
              } else {
                acc[viajeProveedor.proveedor_id][anio] += tarifaProveedor
              }
            }
            return acc
          },
          {}
        )

        const proveedoresArray = Object.keys(proveedoresPorAnio).map(
          proveedorId => ({
            proveedor_id: proveedorId,
            ...proveedoresPorAnio[proveedorId]
          })
        )

        const totalProveedores = viajesProveedor.reduce(
          (acc: number, viajeProveedor: any) => {
            let tarifaProveedor = viajeProveedor.tarifa
            const viajeCorrespondiente = viajes.find(
              viaje => viaje.id === viajeProveedor.viaje_id
            )
            if (
              viajeCorrespondiente &&
              viajeProveedor.dolares &&
              viajeCorrespondiente.tipodecambio
            ) {
              tarifaProveedor *= viajeCorrespondiente.tipodecambio
            }
            return acc + tarifaProveedor
          },
          0
        )

        setProveedoresData({ proveedoresArray, totalProveedores })
        setProveedores(proveedores)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchProveedoresData()
    fetchVentasData()
    fetchUtilidadData()
  }, [])

  setTimeout(() => {
    setLoading(false)
  }, 1200)

  const handleReporte = (value: any) => {
    setLoadingReporte(true)
    setReporte(value)
    setTimeout(() => {
      setLoadingReporte(false)
    }, 1200)
  }

  setTimeout(() => {
    setLoadingReporte(false)
  }, 500)

  return (
    <>
      <Head>
        <title>Reportes</title>
      </Head>
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <main className='flex flex-col min-h-screen mt-[60px]'>
          <h1 className='text-4xl font-bold p-8'>Reportes</h1>
          <section className=' bg-white p-2 m-3 rounded-md shadow-sm flex flex-wrap gap-2 '>
            <article className='w-[200px]'>
              <Select
                label='Reporte'
                radius='sm'
                placeholder={reporte}
                value={reporte}
              >
                <SelectItem key='1' onClick={() => handleReporte('Utilidad')}>
                  Utilidad
                </SelectItem>
                <SelectItem key='2' onClick={() => handleReporte('UxC')}>
                  Utilidad x Cliente
                </SelectItem>
                <SelectItem
                  key='3'
                  onClick={() => handleReporte('Proveedores')}
                >
                  Proveedores
                </SelectItem>
                <SelectItem key='4' onClick={() => handleReporte('Ventas')}>
                  Ventas
                </SelectItem>
                <SelectItem key='5' onClick={() => handleReporte('VxC')}>
                  Viajes x Cliente
                </SelectItem>
              </Select>
            </article>
          </section>
          {loadingReporte ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <section className='m-3'>
              {reporte === 'Utilidad' && (
                <Utilidad
                  ventasArray={utilidadData.ventasArray}
                  totalUtilidad={utilidadData.totalUtilidad}
                  years={years}
                />
              )}
              {reporte === 'Ventas' && (
                <Anual
                  ventasArray={ventasData.ventasArray}
                  years={years}
                  clientes={clientes}
                  total={ventasData.totalVentas}
                  isCliente={true}
                  title='Ventas'
                />
              )}
              {reporte === 'Proveedores' && (
                <Anual
                  ventasArray={proveedoresData.proveedoresArray}
                  years={years}
                  clientes={proveedores}
                  total={proveedoresData.totalProveedores}
                  isCliente={false}
                  title='Proveedores'
                />
              )}
              {reporte === 'UxC' && (
                <Anual
                  ventasArray={ventasData.utilidadArray}
                  years={years}
                  clientes={clientes}
                  total={utilidadData.totalUtilidad}
                  isCliente={true}
                  title='Utilidad x Cliente'
                />
              )}
            </section>
          )}
        </main>
      )}
    </>
  )
}
