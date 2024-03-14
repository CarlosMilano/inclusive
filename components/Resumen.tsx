interface ResumenProps {
  title: string;
  monto: string | number;
}

export default function Resumen(props: ResumenProps) {
  return (
    <>
      <section className="bg-white p-3 w-[160px] md:w-[215px] shadow-sm rounded-[14px] space-y-2">
        <h1 className="text-lg text-gray-500 font-bold">
          {props.title || "Titulo"}
        </h1>
        <h2 className="text-2xl ">{props.monto}</h2>
      </section>
    </>
  );
}
