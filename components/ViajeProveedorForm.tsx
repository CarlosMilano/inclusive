import React, { useState, FormEvent, useEffect } from "react"
import { InputField } from "./InputField"
import { ProveedorForm } from "./ProveedorForm"
import Button from "./Button"
import supabase from "@/pages/api/supabase"
import { Skeleton } from "@mui/material"
import router from "next/router"
import currencyFormatter from "currency-formatter"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import EditIcon from "@mui/icons-material/Edit"
import PaidIcon from "@mui/icons-material/Paid"
import { v4 as uuidv4 } from "uuid"
import { Select, SelectItem } from "@nextui-org/select"
import { Viaje } from "@/types/Viaje"

interface ViajeProveedor {
  id: string
  tarifa: number
  abonado: number
  origen: string
  destino: string
  viaje_id: string
  proveedor_id: string
  fechafactura: string | null
  factura: string
  dolares: boolean
}

interface ViajeFormProps {
  onSubmit: (viajeData: Viaje, viajeProveedorData: ViajeProveedor[]) => void
  clientes: { id: string; nombre: string }[]
  proveedores: { id: string; nombre: string }[]
  existeViaje: boolean
  viajeIdFromRoute: string
  vendedores: { id: string; nombre: string }[]
}

export const ViajePruebaForm = (props: ViajeFormProps) => {
  const [viajeData, setViajeData] = useState<Viaje>({
    id: "",
    origen: "",
    destino: "",
    tarifa: 0,
    tipodecambio: 0,
    factura: "",
    comision: 0,
    tipodeunidad: "",
    referencia: "",
    fechafactura: null,
    abonado: 0,
    cliente_id: "null",
    dolares: false,
    abonocomision: 0,
    folio: 0,
    vendedor_id: ""
  })

  //Para manejar los campos del proveedorform en la vista de solo mostrar los datos
  const [proveedorformValues, ProveedorsetFormValues] = useState({
    tarifa: 0,
    abonado: 0,
    origen: "",
    destino: "",
    proveedor_id: "",
    fechafactura: null,
    factura: "",
    dolares: false
  })

  const [viajeProveedorData, setViajeProveedorData] = useState<
    ViajeProveedor[]
  >([])

  const [editModeViaje, setEditModeViaje] = useState(false)
  const [editModeProveedor, setEditModeProveedor] = useState(false)
  const [proveedorEditandoIndex, setProveedorEditandoIndex] = useState(-1)

  const [hasMultipleProviders, setHasMultipleProviders] = useState(false)

  //Para mostrar el formulario de proveedor en la vista de solo mostrar los datos
  const [
    mostrarFormularioProveedorVistaMode,
    setMostrarFormularioProveedorVistaMode
  ] = useState(false)
  //Para ocultar boton de proveedor en la vista de solo mostrar los datos cuando se este agregando un nuevo proveedor
  const [isButtonProveedorVisible, setButtonProveedorVisible] = useState(false)

  const [openCobradoComisionViaje, setOpenCobradoComisionViaje] =
    useState(false)
  const [openAbonadoComisionViaje, setOpenAbonadoComisionViaje] =
    useState(false)
  const [openCobradoTarifaViaje, setOpenCobradoTarifaViaje] = useState(false)
  const [openAbonadoTarifaViaje, setOpenAbonadoTarifaViaje] = useState(false)
  const [nuevoAbonoComisionViaje, setNuevoAbonoComisionViaje] = useState(0)
  const [nuevoAbonoTarifaViaje, setNuevoAbonoTarifaViaje] = useState(0)

  const [openCobradoTarifaProveedor, setOpenCobradoTarifaProveedor] =
    useState(false)
  const [openAbonadoTarifaProveedor, setOpenAbonadoTarifaProveedor] =
    useState(false)
  const [nuevoAbonoTarifaProveedor, setNuevoAbonoTarifaProveedor] = useState(0)
  const [proveedorSeleccionadoIndex, setProveedorSeleccionadoIndex] =
    useState(-1)

  const [loading, setLoading] = useState(true)

  //Para volver a jalar la info del componente cuando se pasa a modo de solo mostrar los datos
  useEffect(() => {
    const fetchViajeData = async () => {
      try {
        const viajeIdFromRoute = props.viajeIdFromRoute
        await new Promise(resolve => setTimeout(resolve, 1000))

        const { data: viajeData, error: viajeError } = await supabase
          .from("viaje")
          .select("*")
          .eq("id", viajeIdFromRoute)
          .single()

        if (viajeError) {
          console.error("Error al obtener los datos del viaje", viajeError)
        } else if (viajeData) {
          setViajeData(viajeData)
          setTimeout(() => {
            setLoading(false)
          }, 1000)
        }
      } catch (error) {
        console.error("Error al obtener los datos del viaje", error)
      } finally {
      }
    }

    const fetchViajeProveedorData = async () => {
      try {
        const viajeIdFromRoute = props.viajeIdFromRoute

        const { data: viajeProveedorData, error: viajeProveedorError } =
          await supabase
            .from("viajeproveedor")
            .select("*")
            .eq("viaje_id", viajeIdFromRoute)

        if (viajeProveedorError) {
          console.error(
            "Error al obtener los datos de los proveedores del viaje",
            viajeProveedorError
          )
        } else if (viajeProveedorData) {
          setViajeProveedorData(viajeProveedorData)
          setTimeout(() => {
            setLoading(false)
          }, 1000)
        }
      } catch (error) {
        console.error(
          "Error al obtener los datos de los proveedores del viaje",
          error
        )
      }
    }

    fetchViajeData()
    fetchViajeProveedorData()
  }, [props.viajeIdFromRoute])

  //Para obtener el folio maximo y sumarle uno en base al maximo
  useEffect(() => {
    const fetchMaxFolio = async () => {
      try {
        const { data: maxFolioData, error: maxFolioError } = await supabase
          .from("viaje")
          .select("folio")
          .order("folio", { ascending: false })
          .limit(1)

        if (maxFolioError) {
          console.error("Error al obtener el folio máximo", maxFolioError)
        } else if (maxFolioData && maxFolioData.length > 0) {
          setViajeData(prevData => ({
            ...prevData,
            folio: maxFolioData[0].folio + 1
          }))
        }
      } catch (error) {
        console.error("Error al obtener el folio máximo", error)
      }
    }

    fetchMaxFolio()
  }, [])

  //Funcion para eiminar viaje completo y sus proveedores
  const eliminarViaje = async (ViajeData: Viaje) => {
    try {
      const { data: proveedorData, error: proveedorError } = await supabase
        .from("viajeproveedor")
        .delete()
        .eq("viaje_id", ViajeData.id)

      if (proveedorError) {
        console.error(
          "Error al eliminar los proveedores del viaje",
          proveedorError
        )
        return
      }

      const { data: viajeDataEliminado, error: viajeError } = await supabase
        .from("viaje")
        .delete()
        .eq("id", ViajeData.id)
        .single()

      if (viajeError) {
        console.error("Error al eliminar el viaje", viajeError)
        return
      }
    } catch (error) {
      console.error("Error al eliminar el viaje", error)
    }
    router.push("/inicio")
  }

  //Funcion para eliminar proveedor por proveedor
  const eliminarProveedor = async (proveedorId: string) => {
    try {
      const { data, error } = await supabase
        .from("viajeproveedor")
        .delete()
        .eq("id", proveedorId)
        .single()

      if (error) {
        console.error("Error al eliminar el proveedor", error)
        return
      }

      setViajeProveedorData(prevData =>
        prevData.filter(proveedor => proveedor.id !== proveedorId)
      )
    } catch (error) {
      console.error("Error al eliminar el proveedor", error)
    }
  }

  //Funcion para actualizar viaje
  const guardarCambiosViaje = async (viajeActualizado: Viaje) => {
    try {
      const { data, error } = await supabase
        .from("viaje")
        .update(viajeActualizado)
        .eq("id", viajeActualizado.id)

      if (error) {
        console.error("Error al actualizar el viaje", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error en la solicitud PUT para el viaje", error)
      return false
    }
  }

  // Función para actualizar proveedor por proveedor y para añadir nuevos proveedores en la vista donde se muestran los datos
  const guardarCambiosProveedor = async (
    proveedorActualizado: ViajeProveedor
  ) => {
    try {
      if (proveedorActualizado.id) {
        // Si el proveedor tiene un ID, entonces existe y se debe actualizar
        const { data, error } = await supabase
          .from("viajeproveedor")
          .update(proveedorActualizado)
          .eq("id", proveedorActualizado.id)

        if (error) {
          console.error("Error al actualizar el proveedor del viaje", error)
          return false
        }
      } else {
        // Si el proveedor no tiene un ID, entonces no existe y se debe crear

        proveedorActualizado.id = uuidv4()
        proveedorActualizado.viaje_id = viajeData.id

        const { data, error } = await supabase.from("viajeproveedor").insert([
          {
            ...proveedorActualizado,
            proveedor_id: proveedorActualizado.proveedor_id
          }
        ])

        if (error) {
          console.error("Error al crear el proveedor del viaje", error)
          return false
        }

        if (data) {
          setViajeProveedorData([...viajeProveedorData, ...data])
        }
      }

      return true
    } catch (error) {
      console.error("Error en la solicitud para el proveedor del viaje", error)
      return false
    }
  }

  //handle para viaje
  const handleChangeViaje = (e: any) => {
    const { name, value, type } = e.target || e
    const selectedValue =
      type === "select-one"
        ? value
        : type === "number"
        ? parseFloat(value)
        : value

    setViajeData(prevData => ({
      ...prevData,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : selectedValue
    }))
  }

  //Como hay campos que se llaman igual con un solo handle hay problemas para actualizar el estado  y ademas proveedor son listas

  //handle para viajeProveedor cuando es formulario nuevo
  const handleChangeViajeProveedor = (
    index: number,
    formData: ViajeProveedor
  ) => {
    if (index === 0 && !hasMultipleProviders) {
      formData.origen = viajeData.origen
      formData.destino = viajeData.destino
    }
    setViajeProveedorData(prevData => {
      const newData = [...prevData]
      newData[index] = { ...newData[index], ...formData }
      return newData
    })
  }

  //Handle para editar proveedor
  const handleChangeViajeProveedorEdit = (e: any) => {
    const { name, value, type, checked } = e.target
    const selectedValue =
      type === "select-one"
        ? value
        : type === "number"
        ? parseFloat(value)
        : type === "checkbox"
        ? checked
        : value

    setViajeProveedorData(prevData => {
      const newData = [...prevData]
      newData[proveedorEditandoIndex] = {
        ...newData[proveedorEditandoIndex],
        [name]: selectedValue
      }
      return newData
    })
  }

  //Para manejar los campos del proveedorform en la vista de solo mostrar los datos
  const handleAgregarNuevoProveedorVistaMode = (e: any) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value
    ProveedorsetFormValues({
      ...proveedorformValues,
      [e.target.name]: value
    })
  }

  //Para hacer el post de un nuevo proveedor en la vista de solo mostrar los datos
  const handleAgregarProveedorVistaMode = async (e: any) => {
    e.preventDefault()

    const proveedorDataToInsert = {
      id: uuidv4(),
      tarifa: proveedorformValues.tarifa,
      abonado: proveedorformValues.abonado,
      origen: proveedorformValues.origen,
      destino: proveedorformValues.destino,
      proveedor_id: proveedorformValues.proveedor_id,
      viaje_id: viajeData.id,
      fechafactura: proveedorformValues.fechafactura,
      factura: proveedorformValues.factura,
      dolares: proveedorformValues.dolares
    }

    const { data, error } = await supabase
      .from("viajeproveedor")
      .insert([proveedorDataToInsert])

    if (error) {
      console.error("Hubo un error al agregar el proveedor:", error)
    }
    router.reload()
  }

  //Para no usar el mismo handle que los demas campos ya que actualiza el valor en tiempo real y no se suman los abonos
  const handleAbonoComisionViajeChange = (e: any) => {
    setNuevoAbonoComisionViaje(Number(e.target.value))
  }

  //Mismo caso que arriba
  const handleAbonoTarifaViajeChange = (e: any) => {
    setNuevoAbonoTarifaViaje(Number(e.target.value))
  }

  //Mismo caso que arriba
  const handleAbonoTarifaProveedorChange = (e: any) => {
    setNuevoAbonoTarifaProveedor(Number(e.target.value))
  }

  //Para agregar un nuevo viaje vacio cuando se llena un nuevo viaje(se pasa como props en index)
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    props.onSubmit(viajeData, viajeProveedorData)
  }

  //Para agregar un nuevo proveedor vacio cuando se llena un nuevo viaje
  const handleAgregarProveedor = () => {
    if (viajeProveedorData.length > 0) {
      setHasMultipleProviders(true)
    }
    setViajeProveedorData(prevForms => [
      ...prevForms,
      {
        id: "",
        tarifa: 0,
        abonado: 0,
        origen: "",
        destino: "",
        viaje_id: "",
        proveedor_id: "",
        fechafactura: null,
        factura: "",
        dolares: false
      }
    ])
  }

  //Para obtener el nombre del cliente por id y asi mostrarlo en el titulo
  const obtenerNombreClientePorId = (cliente_id: any) => {
    const clienteEncontrado = props.clientes.find(
      cliente => cliente.id === cliente_id
    )
    return clienteEncontrado ? clienteEncontrado.nombre : "N/A"
  }

  const obtenerNombreVendedorPorId = (vendedor_id: any) => {
    const vendedorEncontrado = props.vendedores.find(
      vendedor => vendedor.id === vendedor_id
    )
    return vendedorEncontrado ? vendedorEncontrado.nombre : "N/A"
  }

  //Para obtener el nombre del proveedor por id y asi mostrarlo en el titulo
  const obtenerNombreProveedorPorId = (proveedor_id: any) => {
    const proveedorEncontrado = props.proveedores.find(
      proveedor => proveedor.id === proveedor_id
    )
    return proveedorEncontrado ? proveedorEncontrado.nombre : "N/A"
  }

  //Para pagar de contado la comision de viaje
  const contadoComisionViaje = async () => {
    setViajeData(prevData => {
      const newData = { ...prevData, abonocomision: prevData.comision }

      guardarCambiosViaje(newData).then(exito => {
        if (exito) {
          router.reload()
        }
      })

      return newData
    })
  }

  //Para pagar de contado la tarifa de viaje
  const contadoTarifaViaje = async () => {
    setViajeData(prevData => {
      const newData = { ...prevData, abonado: prevData.tarifa }

      guardarCambiosViaje(newData).then(exito => {
        if (exito) {
          router.reload()
        }
      })

      return newData
    })
  }

  //Para pagar por abonos la comision del viaje y que se sume al abono anterior
  const abonoComisionViaje = async () => {
    const abonoSumado = viajeData.abonocomision + nuevoAbonoComisionViaje

    setViajeData(prevData => ({
      ...prevData,
      abonocomision: abonoSumado
    }))

    const exito = await guardarCambiosViaje({
      ...viajeData,
      abonocomision: abonoSumado
    })

    if (exito) {
      router.reload()
    }
  }

  //Para pagar por abonos la tarifa del viaje y que se sume al abono anterior
  const abonoTarifaViaje = async () => {
    const abonoSumado = viajeData.abonado + nuevoAbonoTarifaViaje

    setViajeData(prevData => ({
      ...prevData,
      abonado: abonoSumado
    }))

    const exito = await guardarCambiosViaje({
      ...viajeData,
      abonado: abonoSumado
    })

    if (exito) {
      router.reload()
    }
  }

  //Para pagar de contado la tarifa de proveedor
  const contadoTarifaProveedor = async (proveedorIndex: number) => {
    setViajeProveedorData(prevData => {
      prevData[proveedorIndex].abonado = prevData[proveedorIndex].tarifa

      guardarCambiosProveedor(prevData[proveedorIndex]).then(exito => {
        if (exito) {
          router.reload()
        }
      })

      return [...prevData]
    })
  }

  //Para pagar por abonos la tarifa del proveedor y que se sume al abono anterior
  const abonoTarifaProveedor = async () => {
    if (proveedorSeleccionadoIndex === -1) {
      console.error("No se ha seleccionado un proveedor para el abono.")
      return
    }

    const proveedorActual = viajeProveedorData[proveedorSeleccionadoIndex]
    const abonoSumado = proveedorActual.abonado + nuevoAbonoTarifaProveedor

    setViajeProveedorData(prevData => {
      const newData = [...prevData]
      newData[proveedorSeleccionadoIndex] = {
        ...proveedorActual,
        abonado: abonoSumado
      }

      guardarCambiosProveedor(newData[proveedorSeleccionadoIndex])

      return newData
    })
    router.reload()
  }

  //Para abrir y cerrar el menu de cobrado para comision
  const clickCobradoComisionViaje = () => {
    setOpenCobradoComisionViaje(!openCobradoComisionViaje)
  }

  //Para abrir y cerrar el menu de abonado que esta dentro de cobrado para comision
  const clickAbonadoComisionViaje = () => {
    setOpenAbonadoComisionViaje(!openAbonadoComisionViaje)
  }

  //Para abrir y cerrar el menu de cobrado para tarifa
  const clickCobradoTarifaViaje = () => {
    setOpenCobradoTarifaViaje(!openCobradoTarifaViaje)
  }

  //Para abrir y cerrar el menu de abonado que esta dentro de cobrado para tarifa
  const clickAbonadoTarifaViaje = () => {
    setOpenAbonadoTarifaViaje(!openAbonadoTarifaViaje)
  }

  //Para abrir y cerrar el menu de cobrado para tarifa de proveedor
  const clickCobradoTarifaProveedor = (index: number) => {
    setProveedorSeleccionadoIndex(index)
    setOpenCobradoTarifaProveedor(!openCobradoTarifaProveedor)
  }

  //Para abrir y cerrar el menu de abonado que esta dentro de cobrado para tarifa de proveedor y ademas actualizar el index del proveedor al presional el boton
  const clickAbonadoTarifaProveedor = (index: number) => {
    setProveedorSeleccionadoIndex(index)
    setOpenAbonadoTarifaProveedor(!openAbonadoTarifaProveedor)
  }

  const clientesOdenados = props.clientes
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre))

  const proveedorOrdenado = props.proveedores
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre))

  return (
    <>
      {props.existeViaje ? (
        <section className='flex flex-col p-3 gap-5 items-center'>
          {editModeViaje ? (
            <section className='bg-white p-4 rounded-md shadow-sm w-[95%] max-w-[1000px]'>
              <h2 className='text-xl font-semibold p-2 text-gray-600'>
                Detalle Viaje
              </h2>
              <section className='flex flex-wrap'>
                <article className='p-2 w-full md:w-[25%]'>
                  <Select
                    name='cliente_id'
                    value={viajeData.cliente_id ?? ""}
                    onChange={handleChangeViaje}
                    label='Cliente'
                    radius='none'
                    placeholder={
                      viajeData.cliente_id
                        ? clientesOdenados.find(
                            cliente => cliente.id === viajeData.cliente_id
                          )?.nombre
                        : "Selecciona un cliente"
                    }
                  >
                    {clientesOdenados.map(cliente => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </SelectItem>
                    ))}
                  </Select>
                </article>
                <article className='p-2 w-full md:w-[25%]'>
                  <Select
                    name='vendedor_id'
                    value={viajeData.vendedor_id ?? ""}
                    onChange={handleChangeViaje}
                    label='Vendedor'
                    radius='none'
                    placeholder={
                      viajeData.vendedor_id
                        ? props.vendedores.find(
                            vendedor => vendedor.id === viajeData.vendedor_id
                          )?.nombre
                        : "Selecciona un vendedor"
                    }
                  >
                    {props.vendedores.map(vendedor => (
                      <SelectItem key={vendedor.id} value={vendedor.id}>
                        {vendedor.nombre}
                      </SelectItem>
                    ))}
                  </Select>
                </article>
                <article className='p-2 w-full md:w-[25%]'>
                  <InputField
                    label='Origen'
                    name='origen'
                    value={viajeData.origen}
                    onChange={handleChangeViaje}
                  />
                </article>
                <article className='p-2 w-full md:w-[25%]'>
                  <InputField
                    label='Destino'
                    name='destino'
                    value={viajeData.destino}
                    onChange={handleChangeViaje}
                  />
                </article>
                <article className='p-2 w-full md:w-[25%]'>
                  <InputField
                    label='Tipo de unidad'
                    name='tipodeunidad'
                    value={viajeData.tipodeunidad}
                    onChange={handleChangeViaje}
                  />
                </article>
                <article className='p-2 w-full md:w-[25%]'>
                  <InputField
                    label='Tarifa'
                    name='tarifa'
                    value={viajeData.tarifa}
                    onChange={handleChangeViaje}
                    type='number'
                  />
                </article>
                <article className='p-2 w-full md:w-[25%]'>
                  <InputField
                    label='Abono tarifa'
                    name='abonado'
                    value={viajeData.abonado}
                    onChange={handleChangeViaje}
                    type='number'
                  />
                </article>
                <article className='p-2 w-full md:w-[25%]'>
                  <InputField
                    label='Comisión'
                    name='comision'
                    value={viajeData.comision}
                    onChange={handleChangeViaje}
                    type='number'
                  />
                </article>
                <article className='p-2 w-full md:w-[25%]'>
                  <InputField
                    label='Abono comisión'
                    name='abonocomision'
                    value={viajeData.abonocomision}
                    onChange={handleChangeViaje}
                    type='number'
                  />
                </article>
                <article className='p-2 w-full md:w-[25%]'>
                  <InputField
                    label='Referencia'
                    name='referencia'
                    value={viajeData.referencia}
                    onChange={handleChangeViaje}
                  />
                </article>
                <article className='p-2 w-full md:w-[25%]'>
                  <InputField
                    label='Factura'
                    name='factura'
                    value={viajeData.factura}
                    onChange={handleChangeViaje}
                  />
                </article>
                <article className='p-2 w-full md:w-[25%] flex-col flex space-y-2'>
                  <label className='text-sm font-semibold text-gray-600'>
                    Fecha de Factura
                  </label>
                  <input
                    name='fechafactura'
                    value={viajeData.fechafactura || ""}
                    onChange={handleChangeViaje}
                    type='date'
                  />
                </article>
                <article className='p-2 w-full md:w-[25%] space-y-2'>
                  <label className='block text-gray-700 text-sm font-bold'>
                    Dolares
                  </label>
                  <input
                    type='checkbox'
                    name='dolares'
                    checked={viajeData.dolares}
                    onChange={handleChangeViaje}
                  />
                </article>
                <article className='p-2 w-full md:w-[25%]'>
                  {viajeData.dolares && (
                    <InputField
                      label='Tipo de cambio'
                      name='tipodecambio'
                      value={viajeData.tipodecambio}
                      onChange={handleChangeViaje}
                      type='number'
                    />
                  )}
                </article>
              </section>
              <button
                type='button'
                onClick={async () => {
                  const exito = await guardarCambiosViaje(viajeData)
                  if (exito) {
                    setEditModeViaje(false)
                    router.reload()
                  }
                }}
                className='py-2 bg-blue-600 w-[120px] text-white shadow-sm rounded-lg'
              >
                Guardar
              </button>
            </section>
          ) : (
            <section className='bg-white p-4 rounded-md shadow-sm relative w-[95%] max-w-[1000px]'>
              <article className='font-semibold text-lg text-gray-400 flex justify-end'>
                {loading ? (
                  <Skeleton variant='rectangular' width={35} height={25} />
                ) : (
                  <p>{viajeData.folio || "N/A"}</p>
                )}
              </article>
              <section className='flex items-center space-x-3'>
                {loading ? (
                  <Skeleton variant='rectangular' width={160} height={55} />
                ) : (
                  <h1 className='text-4xl font-semibold p-2'>
                    {obtenerNombreClientePorId(viajeData.cliente_id)}
                  </h1>
                )}
                <DeleteForeverIcon
                  onClick={() => {
                    const confirmacion = window.confirm(
                      "¿Estás seguro que quieres eliminar el viaje y los proveedores?"
                    )

                    if (confirmacion) {
                      eliminarViaje(viajeData)
                    }
                  }}
                  sx={{ color: "#e03131", cursor: "pointer" }}
                />

                <EditIcon
                  onClick={() => setEditModeViaje(true)}
                  sx={{ color: "#1971c2", cursor: "pointer" }}
                />
                <section className='flex flex-col items-center justify-center absolute top-[111px] left-14'>
                  {viajeData.abonado !== viajeData.tarifa && (
                    <PaidIcon
                      onClick={clickCobradoTarifaViaje}
                      sx={{ color: "#2f9e44", cursor: "pointer" }}
                    />
                  )}
                  <section
                    className={`flex flex-col z-20 rounded-2xl shadow-sm w-[210px] p-3 bg-white transition-all duration-300${
                      openCobradoTarifaViaje
                        ? " scale-100 opacity-100 ease-out"
                        : " scale-50 opacity-0 ease-in"
                    }`}
                    style={{
                      visibility: openCobradoTarifaViaje ? "visible" : "hidden"
                    }}
                  >
                    <article className='flex space-x-3'>
                      <button
                        className='py-2 bg-blue-600 text-lg  text-white shadow-sm rounded-lg w-[90px]'
                        onClick={contadoTarifaViaje}
                      >
                        Contado
                      </button>
                      <button
                        className='py-2 bg-blue-600 text-lg text-white shadow-sm rounded-lg w-[90px]'
                        onClick={clickAbonadoTarifaViaje}
                      >
                        Abono
                      </button>
                    </article>

                    <section
                      className={`transition-all flex flex-col items-center duration-300 overflow-hidden${
                        openAbonadoTarifaViaje
                          ? " max-h-[500px] opacity-100 p-2"
                          : " max-h-0 opacity-50"
                      }`}
                      style={{
                        visibility: openAbonadoTarifaViaje
                          ? "visible"
                          : "hidden"
                      }}
                    >
                      <InputField
                        name='abonado'
                        value={nuevoAbonoTarifaViaje}
                        onChange={handleAbonoTarifaViajeChange}
                        type='number'
                      />

                      <button
                        className='py-2 bg-blue-600 m-2 text-white shadow-sm rounded-lg w-[90px]'
                        onClick={abonoTarifaViaje}
                      >
                        Guardar
                      </button>
                    </section>
                  </section>
                </section>
              </section>
              <section className='p-2'>
                <h2 className='text-xl text-gray-600 font-semibold'>
                  Detalle Viaje
                </h2>
                <section className='flex flex-wrap'>
                  <article className='p-2 w-full md:w-[25%]'>
                    <h3 className='font-bold text-gray-400'>Vendedor</h3>
                    {loading ? (
                      <Skeleton variant='rectangular' width={85} height={25} />
                    ) : (
                      <p>{obtenerNombreVendedorPorId(viajeData.vendedor_id)}</p>
                    )}
                  </article>
                  <article className='p-2 w-full md:w-[25%]'>
                    <h3 className='font-bold text-gray-400'>Origen</h3>
                    {loading ? (
                      <Skeleton variant='rectangular' width={85} height={25} />
                    ) : (
                      <p>{viajeData.origen || "N/A"}</p>
                    )}
                  </article>
                  <article className='p-2 w-full md:w-[25%]'>
                    <h3 className='font-bold text-gray-400'>Destino</h3>
                    {loading ? (
                      <Skeleton variant='rectangular' width={85} height={25} />
                    ) : (
                      <p>{viajeData.destino || "N/A"}</p>
                    )}
                  </article>
                  <article className='p-2 w-full md:w-[25%]'>
                    <h3 className='font-bold text-gray-400'>
                      Fecha de Factura
                    </h3>
                    {loading ? (
                      <Skeleton variant='rectangular' width={95} height={25} />
                    ) : (
                      <p>{viajeData.fechafactura || "N/A"}</p>
                    )}
                  </article>
                  <article className='p-2 w-full md:w-[25%]'>
                    <h3 className='font-bold text-gray-400'>Factura</h3>
                    {loading ? (
                      <Skeleton variant='rectangular' width={85} height={25} />
                    ) : (
                      <p>{viajeData.factura || "N/A"}</p>
                    )}
                  </article>
                  <article className='p-2 w-full md:w-[25%]'>
                    <h3 className='font-bold text-gray-400'>Referencia</h3>
                    {loading ? (
                      <Skeleton variant='rectangular' width={85} height={25} />
                    ) : (
                      <p>{viajeData.referencia || "N/A"}</p>
                    )}
                  </article>
                  <article className='p-2 w-full md:w-[25%]'>
                    <h3 className='font-bold text-gray-400'>Tipo de unidad</h3>
                    {loading ? (
                      <Skeleton variant='rectangular' width={85} height={25} />
                    ) : (
                      <p>{viajeData.tipodeunidad || "N/A"}</p>
                    )}
                  </article>
                  <article className='p-2 w-full md:w-[25%]'>
                    <h3 className='font-bold text-gray-400'>Tarifa</h3>
                    {loading ? (
                      <Skeleton variant='rectangular' width={85} height={25} />
                    ) : (
                      <>
                        {viajeData.dolares ? (
                          <p>
                            {currencyFormatter.format(
                              viajeData.tarifa * viajeData.tipodecambio,
                              {
                                code: "MXN",
                                precision: 0
                              }
                            )}
                          </p>
                        ) : (
                          <p>
                            {currencyFormatter.format(viajeData.tarifa, {
                              code: "MXN",
                              precision: 0
                            })}
                          </p>
                        )}
                      </>
                    )}
                  </article>
                  <article className='p-2 w-full md:w-[25%]'>
                    <h3 className='font-bold text-gray-400'>Abono</h3>
                    {loading ? (
                      <Skeleton variant='rectangular' width={85} height={25} />
                    ) : (
                      <>
                        {viajeData.dolares ? (
                          <p>
                            {currencyFormatter.format(
                              viajeData.abonado * viajeData.tipodecambio,
                              {
                                code: "MXN",
                                precision: 0
                              }
                            )}
                          </p>
                        ) : (
                          <p>
                            {currencyFormatter.format(viajeData.abonado, {
                              code: "MXN",
                              precision: 0
                            })}
                          </p>
                        )}
                      </>
                    )}
                  </article>
                  {viajeData.dolares && (
                    <section className='flex w-full flex-wrap'>
                      <article className='p-2 w-full md:w-[25%]'>
                        <h3 className='font-bold text-gray-400'>Dólares</h3>
                        <p>Si</p>
                      </article>
                      <article className='p-2 w-full md:w-[25%]'>
                        <h3 className='font-bold text-gray-400'>
                          Tipo de Cambio
                        </h3>
                        {loading ? (
                          <Skeleton
                            variant='rectangular'
                            width={85}
                            height={25}
                          />
                        ) : (
                          <p>
                            {currencyFormatter.format(viajeData.tipodecambio, {
                              code: "USD"
                            })}
                          </p>
                        )}
                      </article>
                    </section>
                  )}
                </section>
                <section className='flex flex-col w-[330px] relative'>
                  <section className='flex items-center'>
                    <h2 className='text-xl text-gray-600 font-semibold'>
                      Comisión
                    </h2>
                    <section className='flex flex-col items-center justify-center absolute top-[2px]'>
                      {viajeData.abonocomision !== viajeData.comision && (
                        <PaidIcon
                          onClick={clickCobradoComisionViaje}
                          sx={{ color: "#2f9e44", cursor: "pointer" }}
                        />
                      )}

                      <section
                        className={`flex flex-col z-20 rounded-2xl shadow-sm w-[210px] p-3 bg-white transition-all duration-300${
                          openCobradoComisionViaje
                            ? " scale-100 opacity-100 ease-out"
                            : " scale-50 opacity-0 ease-in"
                        }`}
                        style={{
                          visibility: openCobradoComisionViaje
                            ? "visible"
                            : "hidden"
                        }}
                      >
                        <article className='flex space-x-3'>
                          <button
                            className='py-2 bg-blue-600 text-lg text-white shadow-sm rounded-lg w-[90px]'
                            onClick={contadoComisionViaje}
                          >
                            Contado
                          </button>
                          <button
                            className='py-2 bg-blue-600 text-lg text-white shadow-sm rounded-lg w-[90px]'
                            onClick={clickAbonadoComisionViaje}
                          >
                            Abono
                          </button>
                        </article>

                        <section
                          className={`transition-all flex flex-col items-center duration-300 overflow-hidden${
                            openAbonadoComisionViaje
                              ? " max-h-[500px] opacity-100 p-2"
                              : " max-h-0 opacity-50"
                          }`}
                          style={{
                            visibility: openAbonadoComisionViaje
                              ? "visible"
                              : "hidden"
                          }}
                        >
                          <InputField
                            name='abonocomision'
                            value={nuevoAbonoComisionViaje}
                            onChange={handleAbonoComisionViajeChange}
                            type='number'
                          />

                          <button
                            className='py-2 bg-blue-600 m-2 text-white shadow-sm rounded-lg w-[90px]'
                            onClick={abonoComisionViaje}
                          >
                            Guardar
                          </button>
                        </section>
                      </section>
                    </section>
                  </section>
                  <section className='flex flex-wrap'>
                    <article className='p-2 w-full md:w-[35%]'>
                      <h3 className='font-bold text-gray-400'>Comisión</h3>
                      {loading ? (
                        <Skeleton
                          variant='rectangular'
                          width={85}
                          height={25}
                        />
                      ) : (
                        <p>
                          {currencyFormatter.format(viajeData.comision, {
                            code: "MXN",
                            precision: 0
                          })}
                        </p>
                      )}
                    </article>
                    <article className='p-2 w-full md:w-[65%]'>
                      <h3 className='font-bold text-gray-400'>Abono</h3>
                      {loading ? (
                        <Skeleton
                          variant='rectangular'
                          width={85}
                          height={25}
                        />
                      ) : (
                        <p>
                          {currencyFormatter.format(viajeData.abonocomision, {
                            code: "MXN",
                            precision: 0
                          })}
                        </p>
                      )}
                    </article>
                  </section>
                </section>
              </section>
            </section>
          )}
          <section className='flex flex-wrap gap-5 items-start justify-center'>
            {viajeProveedorData.map((proveedor, index) => (
              <section key={index}>
                {editModeProveedor && index === proveedorEditandoIndex ? (
                  <section className='bg-white p-4 rounded-md shadow-sm min-w-[340px]'>
                    <section className='flex flex-col gap-3 items-center'>
                      <Select
                        name='proveedor_id'
                        value={viajeProveedorData[index].proveedor_id ?? ""}
                        onChange={handleChangeViajeProveedorEdit}
                        label='Proveedor'
                        radius='none'
                        placeholder={
                          viajeProveedorData[index].proveedor_id
                            ? proveedorOrdenado.find(
                                cliente =>
                                  cliente.id ===
                                  viajeProveedorData[index].proveedor_id
                              )?.nombre
                            : "Selecciona un proveedor"
                        }
                      >
                        {proveedorOrdenado.map((proveedor: any) => (
                          <SelectItem key={proveedor.id} value={proveedor.id}>
                            {proveedor.nombre}
                          </SelectItem>
                        ))}
                      </Select>
                      <InputField
                        label='Origen'
                        name='origen'
                        value={viajeProveedorData[index].origen}
                        onChange={handleChangeViajeProveedorEdit}
                      />

                      <InputField
                        label='Destino'
                        name='destino'
                        value={viajeProveedorData[index].destino}
                        onChange={handleChangeViajeProveedorEdit}
                      />
                      <InputField
                        label='Tarifa'
                        name='tarifa'
                        value={viajeProveedorData[index].tarifa}
                        onChange={handleChangeViajeProveedorEdit}
                        type='number'
                      />

                      <InputField
                        label='Abonado'
                        name='abonado'
                        value={viajeProveedorData[index].abonado}
                        onChange={handleChangeViajeProveedorEdit}
                        type='number'
                      />
                      <InputField
                        label='Factura'
                        name='factura'
                        value={viajeProveedorData[index].factura}
                        onChange={handleChangeViajeProveedorEdit}
                        type='number'
                      />
                      <article className='p-2 w-full flex-col flex space-y-2'>
                        <label className='text-sm font-semibold text-gray-600'>
                          Fecha de Factura
                        </label>
                        <input
                          name='fechafactura'
                          value={viajeProveedorData[index].fechafactura || ""}
                          onChange={handleChangeViajeProveedorEdit}
                          type='date'
                        />
                      </article>
                      <article className='p-2 w-full space-y-2'>
                        <label className='block text-gray-700 text-sm font-bold'>
                          Dolares
                        </label>
                        <input
                          type='checkbox'
                          name='dolares'
                          checked={viajeProveedorData[index].dolares}
                          onChange={handleChangeViajeProveedorEdit}
                        />
                      </article>

                      <button
                        type='button'
                        onClick={async () => {
                          const exito = await guardarCambiosProveedor(proveedor)
                          if (exito) {
                            setEditModeProveedor(false)
                            setProveedorEditandoIndex(-1)
                            router.reload()
                          }
                        }}
                        className='py-2 bg-blue-600 w-[120px] text-white shadow-xl rounded-lg'
                      >
                        Guardar
                      </button>
                    </section>
                  </section>
                ) : (
                  <section className='bg-white p-4 rounded-md shadow-sm min-w-[340px]'>
                    <section className='flex items-center space-x-3 relative'>
                      {loading ? (
                        <Skeleton
                          variant='rectangular'
                          width={160}
                          height={55}
                        />
                      ) : (
                        <h1 className='text-4xl font-semibold p-2'>{`${obtenerNombreProveedorPorId(
                          proveedor.proveedor_id
                        )}`}</h1>
                      )}

                      <DeleteForeverIcon
                        onClick={() => {
                          const confirmacion = window.confirm(
                            "¿Estás seguro que quieres eliminar este proveedor?"
                          )
                          if (confirmacion) {
                            eliminarProveedor(proveedor.id)
                          }
                        }}
                        sx={{ color: "#e03131", cursor: "pointer" }}
                      />
                      <EditIcon
                        onClick={() => {
                          setEditModeProveedor(true)
                          setProveedorEditandoIndex(index)
                        }}
                        sx={{ color: "#1971c2", cursor: "pointer" }}
                      />
                      <section className='flex flex-col items-center justify-center absolute top-[67px] left-[85px]'>
                        {proveedor.abonado !== proveedor.tarifa && (
                          <PaidIcon
                            onClick={() => clickCobradoTarifaProveedor(index)}
                            sx={{ color: "#2f9e44", cursor: "pointer" }}
                          />
                        )}

                        <section
                          className={`flex flex-col z-20 rounded-2xl shadow-sm w-[210px] p-3 bg-white transition-all duration-300${
                            openCobradoTarifaProveedor &&
                            proveedorSeleccionadoIndex === index
                              ? " scale-100 opacity-100 ease-out"
                              : " scale-50 opacity-0 ease-in"
                          }`}
                          style={{
                            visibility: openCobradoTarifaProveedor
                              ? "visible"
                              : "hidden"
                          }}
                        >
                          <article className='flex space-x-3'>
                            <button
                              className='py-2 bg-blue-600 text-lg  text-white shadow-sm rounded-lg w-[90px]'
                              onClick={() => contadoTarifaProveedor(index)}
                            >
                              Contado
                            </button>
                            <button
                              className='py-2 bg-blue-600 text-lg  text-white shadow-sm rounded-lg w-[90px]'
                              onClick={() => {
                                clickAbonadoTarifaProveedor(index)
                              }}
                            >
                              Abono
                            </button>
                          </article>
                          <section
                            className={`transition-all flex flex-col items-center duration-300 overflow-hidden${
                              openAbonadoTarifaProveedor &&
                              proveedorSeleccionadoIndex === index
                                ? " max-h-[500px] opacity-100 p-2"
                                : " max-h-0 opacity-50"
                            }`}
                            style={{
                              visibility: openAbonadoTarifaProveedor
                                ? "visible"
                                : "hidden"
                            }}
                          >
                            <InputField
                              name='abonado'
                              value={nuevoAbonoTarifaProveedor}
                              onChange={handleAbonoTarifaProveedorChange}
                              type='number'
                            />

                            <button
                              className='py-2 bg-blue-600 m-2 text-white shadow-sm rounded-lg w-[90px]'
                              onClick={abonoTarifaProveedor}
                            >
                              Guardar
                            </button>
                          </section>
                        </section>
                      </section>
                    </section>

                    <section className='space-y-3 p-2'>
                      <h2 className='text-xl text-gray-600 font-semibold'>
                        Detalle Proveedor
                      </h2>
                      <section className='flex flex-col'>
                        <article className='p-2'>
                          <h3 className='font-bold text-gray-400'>Origen</h3>
                          {loading ? (
                            <Skeleton
                              variant='rectangular'
                              width={85}
                              height={25}
                            />
                          ) : (
                            <p>{proveedor.origen || "N/A"}</p>
                          )}
                        </article>
                        <article className='p-2'>
                          <h3 className='font-bold text-gray-400'>Destino</h3>
                          {loading ? (
                            <Skeleton
                              variant='rectangular'
                              width={85}
                              height={25}
                            />
                          ) : (
                            <p>{proveedor.destino || "N/A"}</p>
                          )}
                        </article>
                        <article className='p-2'>
                          <h3 className='font-bold text-gray-400'>Tarifa</h3>
                          {loading ? (
                            <Skeleton
                              variant='rectangular'
                              width={85}
                              height={25}
                            />
                          ) : (
                            <>
                              {proveedor.dolares ? (
                                <p>
                                  {currencyFormatter.format(
                                    proveedor.tarifa * viajeData.tipodecambio,
                                    {
                                      code: "MXN",
                                      precision: 0
                                    }
                                  )}
                                </p>
                              ) : (
                                <p>
                                  {currencyFormatter.format(proveedor.tarifa, {
                                    code: "MXN",
                                    precision: 0
                                  })}
                                </p>
                              )}
                            </>
                          )}
                        </article>
                        <article className='p-2'>
                          <h3 className='font-bold text-gray-400'>Abono</h3>
                          {loading ? (
                            <Skeleton
                              variant='rectangular'
                              width={85}
                              height={25}
                            />
                          ) : (
                            <>
                              {proveedor.dolares ? (
                                <p>
                                  {currencyFormatter.format(
                                    proveedor.abonado * viajeData.tipodecambio,
                                    {
                                      code: "MXN",
                                      precision: 0
                                    }
                                  )}
                                </p>
                              ) : (
                                <p>
                                  {currencyFormatter.format(proveedor.abonado, {
                                    code: "MXN",
                                    precision: 0
                                  })}
                                </p>
                              )}
                            </>
                          )}
                        </article>
                        <article className='p-2'>
                          <h3 className='font-bold text-gray-400'>Factura</h3>
                          {loading ? (
                            <Skeleton
                              variant='rectangular'
                              width={85}
                              height={25}
                            />
                          ) : (
                            <p>{proveedor.factura || "N/A"}</p>
                          )}
                        </article>
                        <article className='p-2'>
                          <h3 className='font-bold text-gray-400'>
                            Fecha de Factura
                          </h3>
                          {loading ? (
                            <Skeleton
                              variant='rectangular'
                              width={95}
                              height={25}
                            />
                          ) : (
                            <p>{proveedor.fechafactura || "N/A"}</p>
                          )}
                        </article>
                        {proveedor.dolares && (
                          <article className='p-2 w-full md:w-[25%]'>
                            <h3 className='font-bold text-gray-400'>Dólares</h3>
                            <p>Si</p>
                          </article>
                        )}
                      </section>
                    </section>
                  </section>
                )}
              </section>
            ))}

            {!isButtonProveedorVisible && (
              <Button
                title='Agregar Proveedor'
                type='button'
                onClick={e => {
                  e.preventDefault()
                  setMostrarFormularioProveedorVistaMode(true)
                  setButtonProveedorVisible(true)
                }}
              ></Button>
            )}

            {mostrarFormularioProveedorVistaMode &&
              isButtonProveedorVisible && (
                <section className=' bg-white p-4 rounded-md shadow-sm min-w-[340px]'>
                  <form
                    onSubmit={handleAgregarProveedorVistaMode}
                    className='flex flex-col gap-3 items-center'
                  >
                    <Select
                      name='proveedor_id'
                      value={proveedorformValues.proveedor_id}
                      onChange={handleAgregarNuevoProveedorVistaMode}
                      label='Proveedor'
                      radius='none'
                      placeholder='Selecciona un proveedor'
                    >
                      {proveedorOrdenado.map((proveedor: any) => (
                        <SelectItem key={proveedor.id} value={proveedor.id}>
                          {proveedor.nombre}
                        </SelectItem>
                      ))}
                    </Select>
                    <InputField
                      label='Origen'
                      name='origen'
                      value={proveedorformValues.origen}
                      onChange={handleAgregarNuevoProveedorVistaMode}
                    />

                    <InputField
                      label='Destino'
                      name='destino'
                      value={proveedorformValues.destino}
                      onChange={handleAgregarNuevoProveedorVistaMode}
                    />
                    <InputField
                      label='Tarifa'
                      name='tarifa'
                      value={proveedorformValues.tarifa}
                      onChange={handleAgregarNuevoProveedorVistaMode}
                      type='number'
                    />

                    <InputField
                      label='Abonado'
                      name='abonado'
                      value={proveedorformValues.abonado}
                      onChange={handleAgregarNuevoProveedorVistaMode}
                      type='number'
                    />
                    <InputField
                      label='Factura'
                      name='factura'
                      value={proveedorformValues.factura}
                      onChange={handleAgregarNuevoProveedorVistaMode}
                      type='number'
                    />
                    <article className='p-2 w-full flex-col flex space-y-2'>
                      <label className='text-sm font-semibold text-gray-600'>
                        Fecha de Factura
                      </label>
                      <input
                        name='fechafactura'
                        value={proveedorformValues.fechafactura || ""}
                        onChange={handleAgregarNuevoProveedorVistaMode}
                        type='date'
                      />
                    </article>
                    <article className='p-2 w-full space-y-2'>
                      <label className='block text-gray-700 text-sm font-bold'>
                        Dolares
                      </label>
                      <input
                        type='checkbox'
                        name='dolares'
                        checked={proveedorformValues.dolares}
                        onChange={handleAgregarNuevoProveedorVistaMode}
                      />
                    </article>

                    <button
                      type='submit'
                      className='py-2 bg-blue-600 w-[120px] text-white shadow-xl rounded-lg'
                    >
                      Agregar
                    </button>
                  </form>
                </section>
              )}
          </section>
        </section>
      ) : (
        <form
          onSubmit={handleSubmit}
          className='flex flex-col p-3 gap-5 items-center'
        >
          <section className='bg-white p-4 rounded-md shadow-sm w-[95%] max-w-[1000px]'>
            <h1 className='text-4xl font-semibold p-2'>Añadir Nuevo Viaje</h1>
            <h2 className='text-xl font-semibold p-2 text-gray-600'>
              Detalle Viaje
            </h2>
            <section className='flex flex-wrap'>
              <article className='p-2 w-full md:w-[25%]'>
                <Select
                  name='cliente_id'
                  value={viajeData.cliente_id || ""}
                  onChange={handleChangeViaje}
                  label='Cliente'
                  radius='none'
                  placeholder='Selecciona un cliente'
                  fullWidth
                >
                  {clientesOdenados.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </Select>
              </article>
              <article className='p-2 w-full md:w-[25%]'>
                <Select
                  name='vendedor_id'
                  value={viajeData.vendedor_id || ""}
                  onChange={handleChangeViaje}
                  label='Vendedor'
                  radius='none'
                  placeholder='Selecciona un vendedor'
                  fullWidth
                >
                  {props.vendedores.map(vendedor => (
                    <SelectItem key={vendedor.id} value={vendedor.id}>
                      {vendedor.nombre}
                    </SelectItem>
                  ))}
                </Select>
              </article>
              <article className='p-2 w-full md:w-[25%]'>
                <InputField
                  label='Origen'
                  name='origen'
                  value={viajeData.origen}
                  onChange={handleChangeViaje}
                />
              </article>
              <article className='p-2 w-full md:w-[25%]'>
                <InputField
                  label='Destino'
                  name='destino'
                  value={viajeData.destino}
                  onChange={handleChangeViaje}
                />
              </article>
              <article className='p-2 w-full md:w-[25%]'>
                <InputField
                  label='Tipo de unidad'
                  name='tipodeunidad'
                  value={viajeData.tipodeunidad}
                  onChange={handleChangeViaje}
                />
              </article>
              <article className='p-2 w-full md:w-[25%]'>
                <InputField
                  label='Tarifa'
                  name='tarifa'
                  value={viajeData.tarifa}
                  onChange={handleChangeViaje}
                  type='number'
                />
              </article>
              <article className='p-2 w-full md:w-[25%]'>
                <InputField
                  label='Abono tarifa'
                  name='abonado'
                  value={viajeData.abonado}
                  onChange={handleChangeViaje}
                  type='number'
                />
              </article>
              <article className='p-2 w-full md:w-[25%]'>
                <InputField
                  label='Comision'
                  name='comision'
                  value={viajeData.comision}
                  onChange={handleChangeViaje}
                  type='number'
                />
              </article>
              <article className='p-2 w-full md:w-[25%]'>
                <InputField
                  label='Abono comision'
                  name='abonocomision'
                  value={viajeData.abonocomision}
                  onChange={handleChangeViaje}
                  type='number'
                />
              </article>
              <article className='p-2 w-full md:w-[25%]'>
                <InputField
                  label='Referencia'
                  name='referencia'
                  value={viajeData.referencia}
                  onChange={handleChangeViaje}
                />
              </article>
              <article className='p-2 w-full md:w-[25%]'>
                <InputField
                  label='Factura'
                  name='factura'
                  value={viajeData.factura}
                  onChange={handleChangeViaje}
                />
              </article>
              <article className='p-2 w-full md:w-[25%] flex-col flex space-y-2'>
                <label className='text-sm font-semibold text-gray-600'>
                  Fecha de Factura
                </label>
                <input
                  name='fechafactura'
                  value={viajeData.fechafactura || ""}
                  onChange={handleChangeViaje}
                  type='date'
                />
              </article>
              <article className='p-2 w-full md:w-[25%] space-y-2'>
                <label className='block text-gray-700 text-sm font-bold'>
                  Dolares
                </label>
                <input
                  type='checkbox'
                  name='dolares'
                  checked={viajeData.dolares}
                  onChange={handleChangeViaje}
                />
              </article>
              <article className='p-2 w-full md:w-[25%]'>
                {viajeData.dolares && (
                  <InputField
                    label='Tipo de cambio'
                    name='tipodecambio'
                    value={viajeData.tipodecambio}
                    onChange={handleChangeViaje}
                    type='number'
                  />
                )}
              </article>
            </section>
          </section>
          <section className='flex flex-wrap gap-5 items-start justify-center'>
            {viajeProveedorData.map((proveedor, index) => (
              <section key={index}>
                <section className='bg-white p-4 rounded-md shadow-sm min-w-[340px]'>
                  <h1 className='text-2xl font-bold p-2'>{`Añadir Proveedor ${
                    index + 1
                  }`}</h1>
                  <ProveedorForm
                    onChange={(formData: any) =>
                      handleChangeViajeProveedor(index, {
                        ...formData,
                        id: "",
                        viaje_id: ""
                      })
                    }
                    data={proveedor}
                    proveedores={props.proveedores}
                    disableOrigenDestino={index === 0 && !hasMultipleProviders}
                  />
                </section>
              </section>
            ))}
            <article className='flex flex-col space-y-5'>
              <Button
                title='Agregar Proveedor'
                type='button'
                onClick={e => {
                  e.preventDefault()
                  handleAgregarProveedor()
                }}
              />
              <Button title='Guardar' type='submit' />
            </article>
          </section>
        </form>
      )}
    </>
  )
}
