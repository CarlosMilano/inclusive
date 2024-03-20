import React, { ChangeEvent } from "react";
import TextField from "@mui/material/TextField";

interface InputFieldProps {
  label?: string;
  name: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "number";
  sx?: any;
}

export const InputField = (props: InputFieldProps) => {
  return (
    <TextField
      id={props.name}
      label={props.label}
      type={props.type}
      name={props.name}
      value={props.value}
      onChange={props.onChange}
      variant="outlined"
      fullWidth
      sx={props.sx}
    />
  );
};
