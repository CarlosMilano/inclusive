interface ResumenProps {
  title: string;
  monto: string | number;
}

export default function Resumen(props: ResumenProps) {
  return (
    <>
      <section className="bg-white p-4 w-[355px] m-2 shadow-sm rounded-lg space-y-2">
        <h1 className="text-xl text-gray-400 font-bold">
          {props.title || "Titulo"}
        </h1>
        <h2 className="text-3xl ">{props.monto}</h2>
      </section>
    </>
  );
}
