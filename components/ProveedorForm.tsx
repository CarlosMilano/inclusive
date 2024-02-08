import React, { ChangeEvent } from "react";
import { InputField } from "./InputField";
import { MenuItem, Select } from "@mui/material";

interface ProveedorFormData {
  tarifa: number;
  abonado: number;
  origen: string;
  destino: string;
  proveedor_id: string;
  fechafactura: string | null;
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

  const proveedorOrdenado = props.proveedores
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <section className="flex flex-col gap-4 items-center">
      <Select
        name="proveedor_id"
        value={props.data.proveedor_id || ""}
        onChange={handleChange}
        fullWidth
      >
        {proveedorOrdenado.map((proveedor: any) => (
          <MenuItem key={proveedor.id} value={proveedor.id}>
            {proveedor.nombre}
          </MenuItem>
        ))}
      </Select>
      {!props.disableOrigenDestino && (
        <>
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
        </>
      )}
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
      <article className="p-2 w-full flex-col flex space-y-2">
        <label className="text-sm font-semibold text-gray-600">
          Fecha de Factura
        </label>
        <input
          name="fechafactura"
          value={props.data.fechafactura || ""}
          onChange={handleChange}
          type="date"
        />
      </article>
    </section>
  );
};
