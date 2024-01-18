import React, { ChangeEvent } from 'react';

interface InputFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'number';

}

export const InputField=(props: InputFieldProps) => {

  return (
    <section className="w-[150px]">
      <input
        type={props.type}
        name={props.name}
        value={props.value}
        onChange={props.onChange}
        className="p-5 border-none"
        id={props.name}
        placeholder={props.label}
      /> 
      </section>        
  );
};




