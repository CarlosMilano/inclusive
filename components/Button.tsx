import { MouseEventHandler } from "react";

interface ButtonProps {
  title: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset" | undefined;
}

export default function Button(props: ButtonProps) {
  return (
    <>
      <button
        onClick={props.onClick}
        className="py-4 bg-blue-600 text-xl text-white shadow-xl rounded-lg w-[230px] md:w-[210px] transition duration-300 hover:bg-blue-800 z-10"
      >
        {props.title}
      </button>
    </>
  );
}
