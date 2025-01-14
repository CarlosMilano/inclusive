import Head from "next/head"
import { useEffect, useState } from "react"
import { Box, CircularProgress } from "@mui/material"
import Anual from "@/components/Anual"
import Utilidad from "@/components/UtilidadTable"
import { Select, SelectItem } from "@nextui-org/select"
import supabase from "../api/supabase"
import { Cliente } from "@/types/Cliente"
import { Proveedor } from "@/types/Proveedor"
import VxC from "@/components/VxC"
import Mensual from "@/components/Mensual"
import { Vendedor } from "@/types/Vendedor"
import ComisionMensual from "@/components/ComisionMensual"

interface ClienteViajes {
  clienteId: string
  nombre: string
  data: { [key: number]: number }
}

export default function Reportes() {
  const [loading, setLoading] = useState(true)
  const [loadingReporte, setLoadingReporte] = useState(true)
  const [reporte, setReporte] = useState("Utilidad")
  const [vista, setVista] = useState("Anual")
  const [utilidadData, setUtilidadData] = useState<{
    ventasArray: any[]
    totalUtilidad: number
  }>({ ventasArray: [], totalUtilidad: 0 })

  const [years, setYears] = useState<number[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [ventasData, setVentasData] = useState<{
    ventasArray: any[]
    totalVentas: number
    utilidadArray: any[]
  }>({ ventasArray: [], totalVentas: 0, utilidadArray: [] })
  const [proveedoresData, setProveedoresData] = useState<{
    proveedoresArray: any[]
    totalProveedores: number
  }>({ proveedoresArray: [], totalProveedores: 0 })
  const [vxCData, setVxCData] = useState<any[]>([])
  const [vxCMensualData, setVxCMensualData] = useState<ClienteViajes[]>([])
  const [uxCMensualData, setUxCMensualData] = useState<ClienteViajes[]>([])
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  )
  const [ventasPorMes, setVentasPorMes] = useState<{
    ventasArray: any[]
    totalVentas: number
  }>({ ventasArray: [], totalVentas: 0 })
  const [uxVMensualData, setUxVMensualData] = useState<ClienteViajes[]>([])
  const [uxVAnualData, setUxVAnualData] = useState<{
    ventasArray: any[]
    totalUtilidad: number
  }>({ ventasArray: [], totalUtilidad: 0 })

  useEffect(() => {
    async function fetchUtilidadData() {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select("*")
        const { data: proveedoresData, error: proveedoresError } =
          await supabase.from("viajeproveedor").select("*")

        if (viajesError) throw viajesError
        if (proveedoresError) throw proveedoresError

        const uniqueYears = Array.from(
          new Set(
            viajesData
              .filter(
                (viaje: any) => viaje.fechafactura && viaje.fechafactura !== ""
              )
              .map((viaje: any) => new Date(viaje.fechafactura).getFullYear())
          )
        ).sort((a, b) => a - b)
        setYears(uniqueYears)

        const ventasPorMesAnio = viajesData.reduce((acc: any, viaje: any) => {
          if (viaje.fechafactura && viaje.fechafactura !== "") {
            const fecha = new Date(viaje.fechafactura)
            const mes = fecha.getUTCMonth() + 1
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
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    async function fetchVentasData() {
      try {
        const { data: clientesData, error: clientesError } = await supabase
          .from("cliente")
          .select("*")
        if (clientesError) throw clientesError
        const clientes = clientesData || []

        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select("*")
        if (viajesError) throw viajesError
        const viajes = viajesData || []

        const { data: proveedoresData, error: proveedoresError } =
          await supabase.from("viajeproveedor").select("*")
        if (proveedoresError) throw proveedoresError

        const ventasPorClientePorAnio = viajes.reduce(
          (acc: any, viaje: any) => {
            if (viaje.fechafactura && viaje.fechafactura !== "") {
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
            if (viaje.fechafactura && viaje.fechafactura !== "") {
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
        console.error("Error fetching data:", error)
      }
    }

    async function fetchProveedoresData() {
      try {
        const { data: proveedoresData, error: proveedoresError } =
          await supabase.from("proveedor").select("*")
        if (proveedoresError) throw proveedoresError
        const proveedores = proveedoresData || []

        const { data: viajeData, error: viajeError } = await supabase
          .from("viaje")
          .select("*")
        if (viajeError) throw viajeError
        const viajes = viajeData || []

        const { data: viajesProveedorData, error: viajesError } = await supabase
          .from("viajeproveedor")
          .select("*")
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
              viajeCorrespondiente.fechafactura !== ""
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
        console.error("Error fetching data:", error)
      }
    }

    async function fetchVxCData() {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select("*, cliente:cliente_id (nombre)")

        if (viajesError) throw viajesError

        const viajesPorClienteAnio = viajesData.reduce(
          (acc: any, viaje: any) => {
            if (viaje.fechafactura && viaje.fechafactura !== "") {
              const fecha = new Date(viaje.fechafactura)
              const anio = fecha.getFullYear()
              const clienteId = viaje.cliente_id
              const clienteNombre = viaje.cliente.nombre

              if (!acc[clienteId]) {
                acc[clienteId] = { nombre: clienteNombre, viajes: {} }
              }

              if (!acc[clienteId].viajes[anio]) {
                acc[clienteId].viajes[anio] = 1
              } else {
                acc[clienteId].viajes[anio] += 1
              }
            }
            return acc
          },
          {}
        )

        const viajesArray = []
        for (const clienteId in viajesPorClienteAnio) {
          const clienteData = viajesPorClienteAnio[clienteId]
          for (const anio in clienteData.viajes) {
            viajesArray.push({
              clienteId,
              nombre: clienteData.nombre,
              anio: parseInt(anio, 10),
              viajes: clienteData.viajes[anio]
            })
          }
        }

        setVxCData(viajesArray)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    async function fetchVentasPorMes() {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select("*")

        if (viajesError) throw viajesError

        const ventasPorMesAnio = viajesData.reduce((acc: any, viaje: any) => {
          if (viaje.fechafactura && viaje.fechafactura !== "") {
            const fecha = new Date(viaje.fechafactura)
            const mes = fecha.getUTCMonth() + 1
            const anio = fecha.getUTCFullYear()
            let tarifaViaje = viaje.tarifa
            if (viaje.dolares && viaje.tipodecambio) {
              tarifaViaje *= viaje.tipodecambio
            }

            if (!acc[mes]) {
              acc[mes] = { mes, [anio]: tarifaViaje }
            } else {
              if (!acc[mes][anio]) {
                acc[mes][anio] = tarifaViaje
              } else {
                acc[mes][anio] += tarifaViaje
              }
            }
          }
          return acc
        }, {})

        const ventasArray = Object.values(ventasPorMesAnio)

        const totalVentas = viajesData.reduce((acc: number, viaje: any) => {
          let tarifaViaje = viaje.tarifa
          if (viaje.dolares && viaje.tipodecambio) {
            tarifaViaje *= viaje.tipodecambio
          }
          return acc + tarifaViaje
        }, 0)

        setVentasPorMes({ ventasArray, totalVentas })
      } catch (error) {
        console.error("Error fetching ventas por mes data:", error)
      }
    }

    async function fetchUxVAnualData() {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select("*, vendedor:vendedor_id (nombre)")
        const { data: proveedoresData, error: proveedoresError } =
          await supabase.from("viajeproveedor").select("*")

        if (viajesError) throw viajesError
        if (proveedoresError) throw proveedoresError

        const utilidadPorVendedorAnio = viajesData.reduce(
          (acc: any, viaje: any) => {
            if (viaje.fechafactura && viaje.fechafactura !== "") {
              const fecha = new Date(viaje.fechafactura)
              const anio = fecha.getFullYear()
              const vendedorId = viaje.vendedor_id
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

              if (!acc[vendedorId]) {
                acc[vendedorId] = { vendedor_id: vendedorId }
              }

              if (!acc[vendedorId][anio]) {
                acc[vendedorId][anio] = utilidad
              } else {
                acc[vendedorId][anio] += utilidad
              }
            }
            return acc
          },
          {}
        )

        const ventasArray = Object.keys(utilidadPorVendedorAnio).map(
          vendedorId => ({
            cliente_id: vendedorId,
            ...utilidadPorVendedorAnio[vendedorId]
          })
        )

        const totalUtilidad = ventasArray.reduce(
          (total: number, vendedor: any) => {
            const utilidadVendedor = Object.keys(vendedor)
              .filter(key => !isNaN(Number(key)))
              .reduce((sum: number, year) => sum + vendedor[year], 0)
            return total + utilidadVendedor
          },
          0
        )

        setUxVAnualData({ ventasArray, totalUtilidad })
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    async function fetchVendedores() {
      try {
        const { data: vendedoresData, error: vendedoresError } = await supabase
          .from("vendedor")
          .select("*")
        if (vendedoresError) throw vendedoresError
        setVendedores(vendedoresData || [])
      } catch (error) {
        console.error("Error fetching vendedores:", error)
      }
    }

    fetchVentasPorMes()
    fetchProveedoresData()
    fetchVentasData()
    fetchUtilidadData()
    fetchVxCData()
    fetchUxVAnualData()
    fetchVendedores()
  }, [])

  useEffect(() => {
    async function fetchVxCMensualData(year: number) {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select("*, cliente:cliente_id (nombre)")

        if (viajesError) throw viajesError

        const viajesPorClienteMes = viajesData.reduce(
          (acc: any, viaje: any) => {
            const fecha = new Date(viaje.fechafactura)
            const mes = fecha.getUTCMonth() + 1
            const anio = fecha.getUTCFullYear()
            const clienteId = viaje.cliente_id
            const clienteNombre = viaje.cliente.nombre

            if (anio === year) {
              if (!acc[clienteId]) {
                acc[clienteId] = { nombre: clienteNombre, viajes: {} }
              }

              if (!acc[clienteId].viajes[mes]) {
                acc[clienteId].viajes[mes] = 1
              } else {
                acc[clienteId].viajes[mes] += 1
              }
            }
            return acc
          },
          {}
        )

        const viajesArray = Object.keys(viajesPorClienteMes).map(clienteId => ({
          clienteId,
          nombre: viajesPorClienteMes[clienteId].nombre,
          data: viajesPorClienteMes[clienteId].viajes
        }))

        setVxCMensualData(viajesArray)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    async function fetchUxCMensualData(year: number) {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select("*, cliente:cliente_id (nombre)")
        const { data: proveedoresData, error: proveedoresError } =
          await supabase.from("viajeproveedor").select("*")

        if (viajesError) throw viajesError
        if (proveedoresError) throw proveedoresError

        const utilidadPorClienteMes = viajesData.reduce(
          (acc: any, viaje: any) => {
            if (viaje.fechafactura && viaje.fechafactura !== "") {
              const fecha = new Date(viaje.fechafactura)
              const mes = fecha.getUTCMonth() + 1
              const anio = fecha.getUTCFullYear()
              const clienteId = viaje.cliente_id
              const clienteNombre = viaje.cliente.nombre
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

              if (anio === year) {
                if (!acc[clienteId]) {
                  acc[clienteId] = { nombre: clienteNombre, utilidad: {} }
                }

                if (!acc[clienteId].utilidad[mes]) {
                  acc[clienteId].utilidad[mes] = utilidad
                } else {
                  acc[clienteId].utilidad[mes] += utilidad
                }
              }
            }
            return acc
          },
          {}
        )

        const utilidadArray = Object.keys(utilidadPorClienteMes).map(
          clienteId => ({
            clienteId,
            nombre: utilidadPorClienteMes[clienteId].nombre,
            data: utilidadPorClienteMes[clienteId].utilidad
          })
        )

        setUxCMensualData(utilidadArray)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    async function fetchUxVMensualData(year: number) {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select("*, vendedor:vendedor_id (nombre)")
        const { data: proveedoresData, error: proveedoresError } =
          await supabase.from("viajeproveedor").select("*")

        if (viajesError) throw viajesError
        if (proveedoresError) throw proveedoresError

        const utilidadPorVendedorMes = viajesData.reduce(
          (acc: any, viaje: any) => {
            if (viaje.fechafactura && viaje.fechafactura !== "") {
              const fecha = new Date(viaje.fechafactura)
              const mes = fecha.getUTCMonth() + 1
              const anio = fecha.getUTCFullYear()
              const vendedorId = viaje.vendedor_id
              const vendedorNombre = viaje.vendedor?.nombre || "Sin Vendedor"
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

              if (anio === year) {
                if (!acc[vendedorId]) {
                  acc[vendedorId] = { nombre: vendedorNombre, utilidad: {} }
                }

                if (!acc[vendedorId].utilidad[mes]) {
                  acc[vendedorId].utilidad[mes] = utilidad
                } else {
                  acc[vendedorId].utilidad[mes] += utilidad
                }
              }
            }
            return acc
          },
          {}
        )

        const utilidadArray = Object.keys(utilidadPorVendedorMes).map(
          vendedorId => ({
            clienteId: vendedorId, // mantenemos clienteId para compatibilidad con el componente Mensual
            nombre: utilidadPorVendedorMes[vendedorId].nombre,
            data: utilidadPorVendedorMes[vendedorId].utilidad
          })
        )

        setUxVMensualData(utilidadArray)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchVxCMensualData(selectedYear)
    fetchUxCMensualData(selectedYear)
    fetchUxVMensualData(selectedYear)
  }, [selectedYear])

  setTimeout(() => {
    setLoading(false)
  }, 1200)

  const handleReporte = (value: any) => {
    setLoadingReporte(true)
    setReporte(value)
    setVista("Anual")
    setTimeout(() => {
      setLoadingReporte(false)
    }, 2000)
  }

  const handleVistaChange = (value: any) => {
    setLoadingReporte(true)
    setVista(value)
    setTimeout(() => {
      setLoadingReporte(false)
    }, 2000)
  }

  const handleYearChange = (value: any) => {
    setLoadingReporte(true)
    setSelectedYear(value)
    setTimeout(() => {
      setLoadingReporte(false)
    }, 2000)
  }

  setTimeout(() => {
    setLoadingReporte(false)
  }, 1000)

  const verVista = reporte === "VxC" || reporte === "UxC" || reporte === "UxV"

  return (
    <>
      <Head>
        <title>Reportes</title>
      </Head>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh"
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <main className='flex flex-col min-h-screen mt-[60px]'>
          <h1 className='text-4xl font-bold p-8'>Reportes</h1>
          <section className=' bg-white p-2 m-3 rounded-md shadow-sm flex flex-wrap gap-2 '>
            <article className='w-[170px]'>
              <Select
                label='Reporte'
                radius='sm'
                placeholder={reporte}
                value={reporte}
              >
                <SelectItem key='1' onClick={() => handleReporte("Utilidad")}>
                  Utilidad
                </SelectItem>
                <SelectItem key='2' onClick={() => handleReporte("UxC")}>
                  Utilidad x Cliente
                </SelectItem>
                <SelectItem
                  key='3'
                  onClick={() => handleReporte("Proveedores")}
                >
                  Proveedores
                </SelectItem>
                <SelectItem key='4' onClick={() => handleReporte("Ventas")}>
                  Ventas
                </SelectItem>
                <SelectItem key='5' onClick={() => handleReporte("VxC")}>
                  Viajes x Cliente
                </SelectItem>
                <SelectItem key='6' onClick={() => handleReporte("VxM")}>
                  Ventas x Mes
                </SelectItem>
                <SelectItem key='7' onClick={() => handleReporte("UxV")}>
                  Utilidad x Vendedor
                </SelectItem>
              </Select>
            </article>
            {verVista && (
              <article className='w-[170px]'>
                <Select
                  label='Vista'
                  radius='sm'
                  value={vista}
                  placeholder={vista}
                >
                  <SelectItem
                    key='anual'
                    onClick={() => handleVistaChange("Anual")}
                  >
                    Anual
                  </SelectItem>
                  <SelectItem
                    key='mensual'
                    onClick={() => handleVistaChange("Mensual")}
                  >
                    Mensual
                  </SelectItem>
                </Select>
              </article>
            )}
            {verVista && vista === "Mensual" && (
              <article className='w-[170px]'>
                <Select
                  label='Año'
                  radius='sm'
                  value={selectedYear}
                  placeholder={selectedYear.toString()}
                >
                  {years.map(year => (
                    <SelectItem
                      key={year}
                      onClick={() => handleYearChange(year)}
                    >
                      {year}
                    </SelectItem>
                  ))}
                </Select>
              </article>
            )}
          </section>
          {loadingReporte ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh"
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <section className='m-3'>
              {reporte === "Utilidad" && (
                <Utilidad
                  ventasArray={utilidadData.ventasArray}
                  totalUtilidad={utilidadData.totalUtilidad}
                  years={years}
                  title='Utilidad'
                />
              )}
              {reporte === "Ventas" && (
                <Anual
                  ventasArray={ventasData.ventasArray}
                  years={years}
                  clientes={clientes}
                  total={ventasData.totalVentas}
                  isCliente={true}
                  title='Ventas'
                />
              )}
              {reporte === "Proveedores" && (
                <Anual
                  ventasArray={proveedoresData.proveedoresArray}
                  years={years}
                  clientes={proveedores}
                  total={proveedoresData.totalProveedores}
                  isCliente={false}
                  title='Proveedores'
                />
              )}
              {reporte === "UxC" && vista === "Anual" && (
                <Anual
                  ventasArray={ventasData.utilidadArray}
                  years={years}
                  clientes={clientes}
                  total={utilidadData.totalUtilidad}
                  isCliente={true}
                  title='Utilidad x Cliente'
                />
              )}
              {reporte === "UxC" && vista === "Mensual" && (
                <Mensual data={uxCMensualData} mostrarMoneda />
              )}
              {reporte === "VxC" && vista === "Anual" && <VxC data={vxCData} />}
              {reporte === "VxC" && vista === "Mensual" && (
                <Mensual data={vxCMensualData} mostrarMoneda={false} />
              )}
              {reporte === "VxM" && (
                <Utilidad
                  ventasArray={ventasPorMes.ventasArray}
                  totalUtilidad={ventasPorMes.totalVentas}
                  years={years}
                  title='Ventas por Mes'
                />
              )}
              {reporte === "UxV" && vista === "Anual" && (
                <Anual
                  ventasArray={uxVAnualData.ventasArray}
                  years={years}
                  clientes={vendedores} // Asegúrate de tener el estado vendedores
                  total={uxVAnualData.totalUtilidad}
                  isCliente={false}
                  isVendedor
                  title='Utilidad x Vendedor'
                />
              )}
              {reporte === "UxV" && vista === "Mensual" && (
                <ComisionMensual data={uxVMensualData} />
              )}
            </section>
          )}
        </main>
      )}
    </>
  )
}
