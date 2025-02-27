import Head from "next/head"
import { useState, useEffect } from "react"
import supabase from "../../api/supabase"
import { useRouter } from "next/router"
import Table from "@/components/Table"
import { addDays, differenceInDays, parseISO } from "date-fns"
import { Box, CircularProgress } from "@mui/material"
import currencyFormatter from "currency-formatter"
import { Viaje } from "@/types/Viaje"
import { ViajeProveedor } from "@/types/ViajeProveedor"
import { Cliente } from "@/types/Cliente"

export default function Home() {
  const [viajes, setViajes] = useState<Viaje[]>([])
  const [cliente, setCliente] = useState<Cliente>()
  const [proveedor, setProveedor] = useState<ViajeProveedor[]>([])
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const today = new Date()

  const filterViajes = viajes.filter(viaje => viaje.tarifa !== viaje.abonado)

  const sortedViajes = filterViajes.sort((viajeA, viajeB) => {
    const fechaLimiteA = viajeA.fechafactura
      ? addDays(parseISO(viajeA.fechafactura), cliente?.diascredito || 0)
      : null

    const diasRestantesA = fechaLimiteA
      ? differenceInDays(fechaLimiteA, today)
      : null

    const fechaLimiteB = viajeB.fechafactura
      ? addDays(parseISO(viajeB.fechafactura), cliente?.diascredito || 0)
      : null

    const diasRestantesB = fechaLimiteB
      ? differenceInDays(fechaLimiteB, today)
      : null

    if (diasRestantesA === null || diasRestantesB === null) {
      return diasRestantesA === null ? 1 : -1
    }

    return diasRestantesA - diasRestantesB
  })

  useEffect(() => {
    const fetchClienteData = async () => {
      try {
        const { data: clienteData, error: clienteError } = await supabase
          .from("cliente")
          .select("*")
          .eq("id", id)
          .single()

        if (clienteError) {
          console.error(clienteError)
        } else {
          setCliente(clienteData)
          setTimeout(() => {
            setLoading(false)
          }, 1500)
        }
      } catch (error) {
        console.error(error)
      }
    }
    const fetchData = async () => {
      try {
        const { data: viajesData, error: viajesError } = await supabase
          .from("viaje")
          .select("*")
          .eq("cliente_id", id)
          .order("fechafactura", { ascending: false })
        if (viajesError) console.error(viajesError)
        else {
          const viajesConDiasCredito = viajesData.map((viaje: Viaje) => ({
            ...viaje,
            diasCredito: cliente?.diascredito || 0
          }))
          setViajes(viajesConDiasCredito || [])
        }
      } catch (error) {
        console.error(error)
      }
    }
    const fetchDataProveedor = async () => {
      try {
        const { data: viajesDataProveedor, error: viajesError } = await supabase
          .from("viajeproveedor")
          .select("*, viaje!inner(*)")
          .eq("viaje.cliente_id", id)

        if (viajesError) throw viajesError
        setProveedor(viajesDataProveedor || [])
      } catch (error) {
        console.error("Error en fetchDataProveedor:", error)
      }
    }
    fetchClienteData()
    fetchData()
    fetchDataProveedor()
  }, [id])

  const calcularSumaTarifasProveedor = (viajeId: string) => {
    const viajesProveedorRelacionados = proveedor.filter(
      viajeProveedor => viajeProveedor.viaje_id === viajeId
    )

    const sumaTarifasProveedor = viajesProveedorRelacionados.reduce(
      (acc, viajeProveedor) => {
        const viajeCorrespondiente = viajes.find(
          viaje => viaje.id === viajeProveedor.viaje_id
        )

        if (
          viajeCorrespondiente &&
          viajeProveedor.dolares &&
          viajeCorrespondiente.tipodecambio
        ) {
          return acc + viajeProveedor.tarifa * viajeCorrespondiente.tipodecambio
        } else {
          return acc + viajeProveedor.tarifa
        }
      },
      0
    )

    return sumaTarifasProveedor
  }

  const totalVencido = sortedViajes.reduce((acc, viaje) => {
    const fechaLimite = viaje.fechafactura
      ? addDays(parseISO(viaje.fechafactura), cliente?.diascredito || 0)
      : null

    const diasRestantes = fechaLimite ? differenceInDays(fechaLimite, today) : 0

    if (viaje.fechafactura && viaje.dolares) {
      return diasRestantes < 0 ? acc + viaje.tarifa * viaje.tipodecambio : acc
    } else if (viaje.fechafactura) {
      return diasRestantes < 0 ? acc + viaje.tarifa : acc
    }

    return acc
  }, 0)

  const totalPorVencer = sortedViajes.reduce((acc, viaje) => {
    const fechaLimite = viaje.fechafactura
      ? addDays(parseISO(viaje.fechafactura), cliente?.diascredito || 0)
      : null

    const diasRestantes = fechaLimite ? differenceInDays(fechaLimite, today) : 0

    if (viaje.fechafactura && viaje.dolares) {
      return diasRestantes >= 0 ? acc + viaje.tarifa * viaje.tipodecambio : acc
    } else if (viaje.fechafactura) {
      return diasRestantes >= 0 ? acc + viaje.tarifa : acc
    }

    return acc
  }, 0)

  return (
    <>
      <Head>
        <title>Viajes {cliente?.nombre}</title>
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
          <section className='p-8 flex flex-wrap items-center gap-6'>
            <h1 className='text-3xl font-bold md:text-4xl'>
              Viajes {cliente?.nombre}
            </h1>
            <article className='flex flex-col items-start space-y-1 text-sm md:text-base'>
              <article className='flex justify-center items-center gap-1'>
                <div className=' bg-red-500 w-3 h-3 rounded-full' />
                {currencyFormatter.format(totalVencido, {
                  code: "MXN",
                  precision: 0
                })}
              </article>
              <article className='flex justify-center items-center gap-1'>
                <div className=' bg-green-500 w-3 h-3 rounded-full' />
                {currencyFormatter.format(totalPorVencer, {
                  code: "MXN",
                  precision: 0
                })}
              </article>
            </article>
          </section>
          <section className='flex flex-wrap justify-center'>
            {sortedViajes.map(viaje => {
              const fechaLimite = viaje.fechafactura
                ? addDays(
                    parseISO(viaje.fechafactura),
                    cliente?.diascredito || 0
                  )
                : null

              const diasRestantes = fechaLimite
                ? differenceInDays(fechaLimite, today)
                : 0

              const sumaTarifasProveedor = calcularSumaTarifasProveedor(
                viaje.id
              )

              return (
                <Table
                  key={viaje.id}
                  origen={viaje.origen || ""}
                  destino={viaje.destino || ""}
                  monto={viaje.tarifa || 0}
                  factura={viaje.factura || ""}
                  referencia={viaje.referencia || ""}
                  id={viaje.id || ""}
                  fechafactura={viaje.fechafactura || ""}
                  diasRestantes={diasRestantes}
                  onClick={rowData => {
                    router.push(`/viaje/${rowData.id}`)
                  }}
                  dolares={viaje.dolares}
                  tipodecambio={viaje.tipodecambio}
                  comision={viaje.comision}
                  tarifaProveedor={sumaTarifasProveedor}
                  utilidad
                  abonado={viaje.abonado || 0}
                  isCliente
                  historial={false}
                />
              )
            })}
          </section>
        </main>
      )}
    </>
  )
}
