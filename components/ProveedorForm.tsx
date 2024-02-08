import React, { ChangeEvent } from "react";
import { InputField } from "./InputField";
import { MenuItem, Select } from "@mui/material";

interface ProveedorFormData {
  tarifa: number;
  abonado: number;
  origen: string;
  destino: string;
  proveedor_id: string;
}

interface ProveedorFormProps {
  onChange: (formData: ProveedorFormData) => void;
  data: ProveedorFormData;
  proveedores: { id: string; nombre: string }[];
  disableOrigenDestino?: boolean;
}

export const ProveedorForm = (props: ProveedorFormProps) => {
  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    const selectedValue =
      type === "select-one"
        ? value
        : type === "number"
        ? parseFloat(value)
        : value;
    props.onChange({
      ...props.data,
      [name]: selectedValue,
    });
  };

  return (
    <section className="flex flex-col gap-4 items-center">
      <Select
        name="proveedor_id"
        value={props.data.proveedor_id || ""}
        onChange={handleChange}
        fullWidth
      >
        {props.proveedores.map((proveedor: any) => (
          <MenuItem key={proveedor.id} value={proveedor.id}>
            {proveedor.nombre}
          </MenuItem>
        ))}
      </Select>
      <InputField
        label="Origen"
        name="origen"
        value={props.data.origen}
        onChange={handleChange}
      />

      <InputField
        label="Destino"
        name="destino"
        value={props.data.destino}
        onChange={handleChange}
      />
      {!props.disableOrigenDestino && (
        <>
          <InputField
            label="Tarifa"
            name="tarifa"
            value={props.data.tarifa}
            onChange={handleChange}
            type="number"
          />

          <InputField
            label="Abonado"
            name="abonado"
            value={props.data.abonado}
            onChange={handleChange}
            type="number"
          />
        </>
      )}
      <section className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Proveedor:
        </label>
        <select
          name="proveedor_id"
          value={props.data.proveedor_id || ""}
          onChange={handleChange}
          className="p-3 border rounded-md focus:outline-none focus:border-blue-500"
        >
          <option value="">Selecciona un proveedor</option>
          {props.proveedores.map((proveedor: any) => (
            <option key={proveedor.id} value={proveedor.id}>
              {proveedor.nombre}
            </option>
          ))}
        </select>
      </section>
    </section>
  );
};
