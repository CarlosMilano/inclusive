import Head from "next/head"
import { useState, useEffect } from "react"
import supabase from "../api/supabase"
import Card from "@/components/Card"
import Button from "@/components/Button"
import { useRouter } from "next/router"
import { v4 as uuidv4 } from "uuid"
import Resumen from "@/components/Resumen"
import currencyFormatter from "currency-formatter"
import Comision from "@/components/Comision"
import { Cliente } from "@/types/Cliente"
import { Proveedor } from "@/types/Proveedor"
import { Viaje } from "@/types/Viaje"
import { ViajeProveedor } from "@/types/ViajeProveedor"

export default function Home() {
  const [cliente, setCliente] = useState<Cliente[]>([])
  const [proveedor, setProveedor] = useState<Proveedor[]>([])
  const [cuentaPorCobrar, setCuentaPorCobrar] = useState<
    { cliente: Cliente; monto: number }[]
  >([])
  const [cuentaPorPagar, setCuentaPorPagar] = useState<
    { proveedor: Proveedor; monto: number }[]
  >([])
  const [comision, setComision] = useState<
    { cliente: Cliente; monto: number }[]
  >([])
  const router = useRouter()
  const [nombreCliente, setNombreCliente] = useState("")
  const [nombreVendedor, setNombreVendedor] = useState("")
  const [nombreProveedor, setNombreProveedor] = useState("")
  const [diasCredito, setDiasCredito] = useState(0)
  const [openCliente, setOpenCliente] = useState(false)
  const [openProveedor, setOpenProveedor] = useState(false)
  const [openVendedor, setOpenVendedor] = useState(false)
  const [loading, setLoading] = useState(true)
  const [viajes, setViajes] = useState<Viaje[]>([])
  const [viajesProveedor, setViajesProveedor] = useState<ViajeProveedor[]>([])

  useEffect(() => {
    const fetchViajes = async () => {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select("*")

        if (viajesError) console.error(viajesError)
        else {
          setTimeout(() => {
            setLoading(false)
          }, 1500)
          setViajes(viajesData || [])
        }
      } catch (error) {
        console.error(error)
      }
    }
    const fetchViajesProveedor = async () => {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viajeproveedor")
          .select("*, viaje:viaje_id(*,tipodecambio)")

        if (viajesError) console.error(viajesError)
        else {
          setViajesProveedor(viajesData || [])
        }
      } catch (error) {
        console.error(error)
      }
    }
    const fetchData = async () => {
      try {
        const { data: clientesData, error: clientesError } = await supabase
          .from("cliente")
          .select("*")
        if (clientesError) console.error(clientesError)
        else setCliente(clientesData || [])

        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select("*")
        if (viajesError) console.error(viajesError)

        const { data: proveedorData, error: proveedorError } = await supabase
          .from("proveedor")
          .select("*")
        if (proveedorError) console.log(proveedorError)
        else setProveedor(proveedorData || [])

        const { data: viajesProveedorData, error: viajesProveedorError } =
          await supabase.from("viajeproveedor").select("*")
        if (viajesProveedorError) console.log(viajesProveedorError)

        const CxC = clientesData?.map(cliente => {
          const viajesCliente = viajesData?.filter(
            viaje => viaje.cliente_id === cliente.id
          )
          const sumaTarifas =
            viajesCliente?.reduce((total, viaje) => {
              if (viaje.dolares) {
                return total + viaje.tarifa * viaje.tipodecambio
              } else {
                return total + viaje.tarifa
              }
            }, 0) || 0
          const sumaAbonos =
            viajesCliente?.reduce((total, viaje) => {
              if (viaje.dolares) {
                return total + viaje.abonado * viaje.tipodecambio
              } else {
                return total + viaje.abonado
              }
            }, 0) || 0

          const monto = sumaTarifas - sumaAbonos

          return { cliente, monto }
        })

        const comision = clientesData?.map(cliente => {
          const viajesCliente = viajesData?.filter(
            viaje => viaje.cliente_id === cliente.id
          )
          const sumaTarifas =
            viajesCliente?.reduce(
              (total, viaje) => total + viaje.comision,
              0
            ) || 0
          const sumaAbonos =
            viajesCliente?.reduce(
              (total, viaje) => total + viaje.abonocomision,
              0
            ) || 0
          const monto = sumaTarifas - sumaAbonos

          return { cliente, monto }
        })

        const CxP = proveedorData?.map(proveedor => {
          const viajesProveedor = viajesProveedorData?.filter(
            viajeProveedor => viajeProveedor.proveedor_id === proveedor.id
          )
          const sumaTarifas =
            viajesProveedor?.reduce((total, viajeProveedor) => {
              const viajeEnViajes = viajesData?.find(
                v => v.id === viajeProveedor.viaje_id
              )

              if (viajeEnViajes && viajeProveedor.dolares) {
                return (
                  total + viajeProveedor.tarifa * viajeEnViajes.tipodecambio
                )
              } else {
                return total + viajeProveedor.tarifa
              }
            }, 0) || 0
          const sumaAbonos =
            viajesProveedor?.reduce((total, viajeProveedor) => {
              const viajeEnViajes = viajesData?.find(
                v => v.id === viajeProveedor.viaje_id
              )

              if (viajeEnViajes && viajeProveedor.dolares) {
                return (
                  total + viajeProveedor.abonado * viajeEnViajes.tipodecambio
                )
              } else {
                return total + viajeProveedor.abonado
              }
            }, 0) || 0
          const monto = sumaTarifas - sumaAbonos

          return { proveedor, monto }
        })

        setCuentaPorCobrar(CxC || [])
        setCuentaPorPagar(CxP || [])
        setComision(comision || [])
        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }
    fetchViajesProveedor()
    fetchViajes()
    fetchData()
  }, [])

  const handleClick = () => {
    const newId = uuidv4()
    router.push(`/viaje/${newId}`)
  }

  const handleAddClient = async () => {
    try {
      const { data, error } = await supabase
        .from("cliente")
        .insert([{ nombre: nombreCliente, diascredito: diasCredito }])
      if (error) throw error
      else {
        setNombreCliente("")
        setDiasCredito(0)
        setOpenCliente(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddVendedor = async () => {
    try {
      const { data, error } = await supabase
        .from("vendedor")
        .insert([{ nombre: nombreVendedor }])
      if (error) throw error
      else {
        setNombreVendedor("")
        setOpenVendedor(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddProveedor = async () => {
    try {
      const { data, error } = await supabase
        .from("proveedor")
        .insert([{ nombre: nombreProveedor }])
      if (error) throw error
      else {
        setNombreProveedor("")
        setOpenProveedor(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const ventas = viajes
    .map(viaje => {
      if (viaje.dolares) {
        return viaje.tarifa * viaje.tipodecambio
      } else {
        return viaje.tarifa
      }
    })
    .reduce((total, tarifa) => total + tarifa, 0)
  const ventasProveedor = viajesProveedor
    .map(viaje => {
      if (viaje.dolares) {
        return viaje.tarifa * viaje.viaje.tipodecambio
      } else {
        return viaje.tarifa
      }
    })
    .reduce((total, tarifa) => total + tarifa, 0)
  const comisiones = viajes
    .map(viaje => viaje.comision)
    .reduce((a, b) => a + b, 0)
  const utilidad = ventas - ventasProveedor - comisiones
  const CxC = viajes.reduce((total, viaje) => {
    const tarifa = viaje.dolares
      ? viaje.tarifa * viaje.tipodecambio
      : viaje.tarifa
    const abonado = viaje.dolares
      ? viaje.abonado * viaje.tipodecambio
      : viaje.abonado

    return total + (tarifa - abonado)
  }, 0)

  const CxP = viajesProveedor.reduce((total, viaje) => {
    const tarifa = viaje.dolares
      ? viaje.tarifa * viaje.viaje.tipodecambio
      : viaje.tarifa
    const abonado = viaje.dolares
      ? viaje.abonado * viaje.viaje.tipodecambio
      : viaje.abonado

    return total + (tarifa - abonado)
  }, 0)
  const comisionSinAbono = viajes.reduce((total, viaje) => {
    return total + viaje.comision - viaje.abonocomision
  }, 0)
  const UtxC = CxC - CxP - comisionSinAbono
  const porcentaje = ((utilidad / ventas) * 100).toFixed(2)

  const clickCliente = () => {
    setOpenCliente(!openCliente)
  }

  const clickVendedor = () => {
    setOpenVendedor(!openVendedor)
  }

  const clickProveedor = () => {
    setOpenProveedor(!openProveedor)
  }

  const calcularFacturasVencidas = (viajes: Viaje[]) => {
    const facturasVencidasPorCliente: { [key: string]: number } = {}

    viajes.forEach(viaje => {
      if (viaje.fechafactura) {
        const clienteId = viaje.cliente_id
        const clientes = cliente.find(c => c.id === clienteId)

        if (cliente) {
          const diasCredito = clientes?.diascredito
          const fechaFactura = new Date(viaje.fechafactura)
          const fechaVencimiento = new Date(fechaFactura)
          fechaVencimiento.setDate(fechaFactura.getDate() + (diasCredito ?? 0))
          const hoy = new Date()
          if (hoy > fechaVencimiento && viaje.tarifa !== viaje.abonado) {
            facturasVencidasPorCliente[clienteId] =
              (facturasVencidasPorCliente[clienteId] || 0) + 1
          }
        }
      }
    })

    return facturasVencidasPorCliente
  }

  const calcularFacturasSinFecha = (viajes: Viaje[]) => {
    const facturasSinFechaPorCliente: { [key: string]: number } = {}

    viajes.forEach(viaje => {
      if (!viaje.fechafactura) {
        const clienteId = viaje.cliente_id
        facturasSinFechaPorCliente[clienteId] =
          (facturasSinFechaPorCliente[clienteId] || 0) + 1
      }
    })

    return facturasSinFechaPorCliente
  }

  const calcularFacturasVencidasProveedor = (
    viajesProveedor: ViajeProveedor[]
  ) => {
    const facturasVencidasPorProveedor: { [key: string]: number } = {}

    viajesProveedor.forEach(viajeProveedor => {
      if (viajeProveedor.fechafactura) {
        const proveedorId = viajeProveedor.proveedor_id
        if (proveedor) {
          const diasCredito = 30
          const fechaFactura = new Date(viajeProveedor.fechafactura)
          const fechaVencimiento = new Date(fechaFactura)
          fechaVencimiento.setDate(fechaFactura.getDate() + diasCredito)
          const hoy = new Date()
          if (
            hoy > fechaVencimiento &&
            viajeProveedor.tarifa !== viajeProveedor.abonado
          ) {
            facturasVencidasPorProveedor[proveedorId] =
              (facturasVencidasPorProveedor[proveedorId] || 0) + 1
          }
        }
      }
    })

    return facturasVencidasPorProveedor
  }

  const calcularFacturasSinFechaProveedor = (
    viajesProveedor: ViajeProveedor[]
  ) => {
    const facturasSinFechaPorProveedor: { [key: string]: number } = {}

    viajesProveedor.forEach(viajeProveedor => {
      if (!viajeProveedor.fechafactura) {
        const proveedorId = viajeProveedor.proveedor_id
        facturasSinFechaPorProveedor[proveedorId] =
          (facturasSinFechaPorProveedor[proveedorId] || 0) + 1
      }
    })

    return facturasSinFechaPorProveedor
  }

  const totalFacturasVencidasCxC = calcularFacturasVencidas(viajes)
  const totalFacturasVencidasCxP =
    calcularFacturasVencidasProveedor(viajesProveedor)

  const totalFacturasSinFechaCxC = calcularFacturasSinFecha(viajes)
  const totalFacturasSinFechaCxP =
    calcularFacturasSinFechaProveedor(viajesProveedor)

  return (
    <>
      <Head>
        <title>Inicio</title>
      </Head>
      <main className='min-h-screen flex flex-col items-center gap-5 p-5 mt-[60px]'>
        <section className='flex flex-wrap items-start justify-center gap-5'>
          <article className='flex flex-col justify-center items-center z-20'>
            <Button title='Añadir Cliente' onClick={clickCliente} />
            <div
              className={`flex flex-col justify-center items-center transition-all duration-300 overflow-hidden${
                openCliente
                  ? " max-h-[180px] opacity-100 translate-y-0"
                  : " max-h-0 opacity-0 translate-y-[-100%] z-0"
              }`}
              style={{
                visibility: openCliente ? "visible" : "hidden"
              }}
            >
              <input
                type='text'
                placeholder='Nombre'
                onChange={e => setNombreCliente(e.target.value)}
                className='p-3 m-1'
                required
              />
              <input
                type='text'
                placeholder='Dias de credito'
                onChange={e => setDiasCredito(Number(e.target.value))}
                className='p-3 m-1'
                required
              />
              <button
                onClick={handleAddClient}
                className='py-2 bg-blue-600 text-lg m-3 text-white shadow-md rounded-lg w-[100px]'
              >
                Guardar
              </button>
            </div>
          </article>
          <article className='flex flex-col justify-center items-center'>
            <Button title='Añadir Proveedor' onClick={clickProveedor} />
            <div
              className={`flex flex-col justify-center items-center transition-all duration-300 overflow-hidden${
                openProveedor
                  ? " max-h-[125px] opacity-100 translate-y-0"
                  : " max-h-0 opacity-0 translate-y-[-100%] z-0"
              }`}
              style={{
                visibility: openProveedor ? "visible" : "hidden"
              }}
            >
              <div className='flex flex-col items-center'>
                <input
                  type='text'
                  placeholder='Nombre'
                  onChange={e => setNombreProveedor(e.target.value)}
                  className='p-3 m-1'
                  required
                />
                <button
                  onClick={handleAddProveedor}
                  className='py-2 bg-blue-600 text-lg m-3 text-white shadow-md rounded-lg w-[100px]'
                >
                  Guardar
                </button>
              </div>
            </div>
          </article>
          <article className='flex flex-col justify-center items-center'>
            <Button title='Añadir Vendedor' onClick={clickVendedor} />
            <div
              className={`flex flex-col justify-center items-center transition-all duration-300 overflow-hidden${
                openVendedor
                  ? " max-h-[125px] opacity-100 translate-y-0"
                  : " max-h-0 opacity-0 translate-y-[-100%] z-0"
              }`}
              style={{
                visibility: openVendedor ? "visible" : "hidden"
              }}
            >
              <div className='flex flex-col items-center'>
                <input
                  type='text'
                  placeholder='Nombre'
                  onChange={e => setNombreVendedor(e.target.value)}
                  className='p-3 m-1'
                  required
                />
                <button
                  onClick={handleAddVendedor}
                  className='py-2 bg-blue-600 text-lg m-3 text-white shadow-md rounded-lg w-[100px]'
                >
                  Guardar
                </button>
              </div>
            </div>
          </article>
          <article className='flex flex-col justify-center'>
            <Button title='Añadir Viaje' onClick={handleClick} />
          </article>
        </section>
        <section className='flex flex-wrap justify-center gap-3'>
          <Resumen
            title='Ventas'
            monto={currencyFormatter.format(ventas, {
              code: "MXN",
              precision: 2
            })}
            loading={loading}
          />
          <Resumen
            title='Proveedores'
            monto={currencyFormatter.format(ventasProveedor, {
              code: "MXN",
              precision: 2
            })}
            loading={loading}
          />
          <Resumen
            title='Utilidad'
            monto={currencyFormatter.format(utilidad, {
              code: "MXN",
              precision: 2
            })}
            loading={loading}
          />
          <Resumen
            title='Ut x C'
            monto={currencyFormatter.format(UtxC, {
              code: "MXN",
              precision: 2
            })}
            loading={loading}
          />
          <Resumen title='% Utilidad' monto={porcentaje} loading={loading} />
        </section>
        <section className='flex flex-wrap justify-center gap-4 w-screen'>
          <Card
            title='CXC'
            subtitle='Cliente'
            total={cuentaPorCobrar.reduce(
              (total, resultado) => total + resultado.monto,
              0
            )}
            clientData={cuentaPorCobrar.map(resultado => ({
              cliente: resultado.cliente.nombre,
              monto: resultado.monto,
              id: resultado.cliente.id,
              vencidas: totalFacturasVencidasCxC[resultado.cliente.id] || 0,
              sinfecha: totalFacturasSinFechaCxC[resultado.cliente.id] || 0
            }))}
            loading={loading}
            onClick={rowData => {
              router.push(`/cliente/${rowData.id}`)
            }}
          />
          <Card
            title='CXP'
            subtitle='Proveedor'
            total={cuentaPorPagar.reduce(
              (total, resultado) => total + resultado.monto,
              0
            )}
            clientData={cuentaPorPagar.map(resultado => ({
              cliente: resultado.proveedor.nombre,
              monto: resultado.monto,
              id: resultado.proveedor.id,
              vencidas: totalFacturasVencidasCxP[resultado.proveedor.id] || 0,
              sinfecha: totalFacturasSinFechaCxP[resultado.proveedor.id] || 0
            }))}
            loading={loading}
            onClick={rowData => {
              router.push(`/proveedor/${rowData.id}`)
            }}
          />
          <Comision
            title='Comisión'
            subtitle='Cliente'
            total={comision.reduce(
              (total, resultado) => total + resultado.monto,
              0
            )}
            clientData={comision.map(resultado => ({
              cliente: resultado.cliente.nombre,
              monto: resultado.monto,
              id: resultado.cliente.id
            }))}
            loading={loading}
            onClick={rowData => {
              router.push(`/comision/${rowData.id}`)
            }}
          />
        </section>
      </main>
    </>
  )
}
