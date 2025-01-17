import currencyFormatter from "currency-formatter"
import PaidIcon from "@mui/icons-material/Paid"
import { InputField } from "./InputField"
import { useState } from "react"
import supabase from "@/pages/api/supabase"
import { useRouter } from "next/router"

interface CardComision {
  comision: number
  abonocomision: number
  id: string
  factura: string
  onClick?: (rowData: { id: string }) => void
  tarifa: number
  abonado: number
}

export default function CardComision(props: CardComision) {
  const [openCobradoTarifaViaje, setOpenCobradoTarifaViaje] = useState(false)
  const [openAbonadoTarifaViaje, setOpenAbonadoTarifaViaje] = useState(false)
  const [nuevoAbonoTarifaViaje, setNuevoAbonoTarifaViaje] = useState(0)
  const router = useRouter()
  const handleRowClick = (rowData: { id: string }) => {
    if (props.onClick) {
      props.onClick(rowData)
    }
  }

  const clickCobradoTarifaViaje = () => {
    setOpenCobradoTarifaViaje(!openCobradoTarifaViaje)
  }

  const clickAbonadoTarifaViaje = () => {
    setOpenAbonadoTarifaViaje(!openAbonadoTarifaViaje)
  }

  const handleAbonoTarifaViajeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNuevoAbonoTarifaViaje(parseInt(event.target.value))
  }

  const contadoTarifaViaje = async () => {
    try {
      await supabase
        .from("viaje")
        .update({ abonocomision: props.comision })
        .eq("id", props.id)
      router.reload()
    } catch (error) {
      console.error("Error al cobrar tarifa del viaje:", error)
    }
  }

  const abonoTarifaViaje = async () => {
    try {
      await supabase
        .from("viaje")
        .update({ abonocomision: nuevoAbonoTarifaViaje })
        .eq("id", props.id)
      router.reload()
    } catch (error) {
      console.error("Error al abonar a la tarifa del viaje:", error)
    }
  }

  return (
    <main className='flex flex-col m-2 transition-all cursor-pointer duration-300 relative'>
      <article className='flex flex-col items-center justify-center absolute top-[52px] left-56'>
        {props.comision !== props.abonocomision && (
          <PaidIcon
            onClick={clickCobradoTarifaViaje}
            sx={{
              color: props.tarifa === props.abonado ? "#dc3545" : "#2f9e44",
              cursor: "pointer"
            }}
          />
        )}
        <section
          className={`flex flex-col rounded-2xl shadow-sm z-20 w-[210px] p-3 bg-white transition-all duration-300${
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
              visibility: openAbonadoTarifaViaje ? "visible" : "hidden"
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
      </article>
      <section
        className='shadow-sm rounded-lg p-4 w-[340px] justify-between flex flex-row bg-white m-2 items-center cursor-pointer'
        onClick={() => handleRowClick(props)}
      >
        <article>
          <h2 className='text-gray-400 text-xs'>Factura</h2>
          <p>{props.factura}</p>
        </article>
        <article className='text-sm flex flex-col'>
          <h2 className='text-gray-400 text-xs'>Comisión</h2>
          <p>
            {currencyFormatter.format(props.comision, {
              code: "MXN",
              precision: 0
            })}
          </p>
        </article>
        <article className='text-sm flex flex-col'>
          <h2 className='text-gray-400 text-xs'>Abonado</h2>
          <p>
            {currencyFormatter.format(props.abonocomision, {
              code: "MXN",
              precision: 0
            })}
          </p>
        </article>
      </section>
    </main>
  )
}
