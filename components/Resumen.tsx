import Skeleton from "@mui/material/Skeleton";

interface ResumenProps {
  title: string;
  monto: string | number;
  loading: boolean;
}

export default function Resumen(props: ResumenProps) {
  return (
    <>
      <section className="bg-white p-3 w-[160px] md:w-[215px] shadow-sm rounded-[14px] space-y-2">
        <h1 className="text-lg text-gray-500 font-bold">
          {props.title || "Titulo"}
        </h1>
        {props.loading ? (
          <Skeleton width="100%" height={50} animation="wave" />
        ) : (
          <h2 className="text-xl md:text-2xl ">{props.monto}</h2>
        )}
      </section>
    </>
  );
}
