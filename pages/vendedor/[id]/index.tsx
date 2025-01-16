import { Vendedor } from "@/types/Vendedor"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import supabase from "../../api/supabase"
import { Viaje } from "@/types/Viaje"
import { Box, CircularProgress, Stack } from "@mui/material"
import Pagination from "@mui/material/Pagination"
import { addDays, differenceInDays, parseISO } from "date-fns"
import { Cliente } from "@/types/Cliente"
import { ViajeProveedor } from "@/types/ViajeProveedor"
import Table from "@/components/Table"

export default function VendedorPage() {
  const [vendedor, setVendedor] = useState<Vendedor>()
  const [viajes, setViajes] = useState<Viaje[]>([])
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [cliente, setCliente] = useState<Cliente>()
  const [proveedor, setProveedor] = useState<ViajeProveedor[]>([])
  const today = new Date()

  // Pagination states
  const [page, setPage] = useState(1)
  const itemsPerPage = 12 // You can adjust this number

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value)
    // Optionally scroll to top when page changes
    window.scrollTo(0, 0)
  }

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

  // Calculate pagination
  const totalPages = Math.ceil(sortedViajes.length / itemsPerPage)
  const paginatedViajes = sortedViajes.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  useEffect(() => {
    const fetchVendedorData = async () => {
      try {
        const { data: vendedorData, error: clienteError } = await supabase
          .from("vendedor")
          .select("*")
          .eq("id", id)
          .single()

        if (clienteError) {
          console.error(clienteError)
        } else {
          setVendedor(vendedorData)
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
          .eq("vendedor_id", id)
        if (viajesError) console.error(viajesError)
        else {
          setTimeout(() => {
            setLoading(false)
          }, 1000)
          setViajes(viajesData || [])
        }
      } catch (error) {
        console.error(error)
      }
    }

    const fetchClientes = async () => {
      try {
        const { data: clientesData, error: clientesError } = await supabase
          .from("cliente")
          .select("*")
        if (clientesError) console.error(clientesError)
        else {
          setCliente(clientesData[0])
        }
      } catch (error) {
        console.error(error)
      }
    }

    const fetchDataProveedor = async () => {
      try {
        const { data: viajesDataProveedor, error: viajesError } = await supabase
          .from("viajeproveedor")
          .select("*")
        if (viajesError) console.error(viajesError)
        else {
          setProveedor(viajesDataProveedor || [])
        }
      } catch (error) {
        console.error(error)
      }
    }

    setTimeout(() => {
      setLoading(false)
    }, 1500)

    fetchVendedorData()
    fetchData()
    fetchClientes()
    fetchDataProveedor()
  }, [])

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

  return (
    <>
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
        <main className='min-h-screen flex flex-col mt-[60px]'>
          <section className='p-8 flex flex-wrap items-center gap-6'>
            <h1 className='text-3xl font-bold'>Viajes {vendedor?.nombre}</h1>
          </section>
          <section className='flex flex-wrap justify-center'>
            {paginatedViajes.map(viaje => {
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

          {/* Pagination component */}
          <Stack spacing={2} sx={{ padding: "20px", alignItems: "center" }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
            />
          </Stack>
        </main>
      )}
    </>
  )
}
