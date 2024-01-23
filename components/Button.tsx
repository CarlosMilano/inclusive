import { MouseEventHandler } from "react";

interface ButtonProps {
  title: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type: "button" | "submit" | "reset" | undefined;
}

export default function Button(props: ButtonProps) {
  return (
    <>
      <button
        onClick={props.onClick}
        className="py-4 bg-blue-600 text-xl m-3 text-white shadow-xl rounded-lg w-[230px] md:w-[210px] "
      >
        {props.title}
      </button>
    </>
  );
}
