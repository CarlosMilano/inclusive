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
    <section className="mb-4">
      <input
        type={props.type}
        name={props.name}
        value={props.value}
        onChange={props.onChange}
        className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        id={props.name}
        placeholder={props.label}
      /> 
      </section>        
  );
};




