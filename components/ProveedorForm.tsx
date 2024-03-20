import React from "react";
import { InputField } from "./InputField";
import { Select, SelectItem } from "@nextui-org/select";

interface ProveedorFormData {
  tarifa: number;
  abonado: number;
  origen: string;
  destino: string;
  proveedor_id: string;
  fechafactura: string | null;
  factura: string;
  dolares: boolean;
}

interface ProveedorFormProps {
  onChange: (formData: ProveedorFormData) => void;
  data: ProveedorFormData;
  proveedores: { id: string; nombre: string }[];
  disableOrigenDestino?: boolean;
}

export const ProveedorForm = (props: ProveedorFormProps) => {
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const selectedValue =
      type === "select-one"
        ? value
        : type === "number"
        ? parseFloat(value)
        : type === "checkbox"
        ? checked
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
        label="Proveedor"
        radius="none"
        placeholder="Selecciona un proveedor"
      >
        {proveedorOrdenado.map((proveedor: any) => (
          <SelectItem key={proveedor.id} value={proveedor.id}>
            {proveedor.nombre}
          </SelectItem>
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
      <InputField
        label="Factura"
        name="factura"
        value={props.data.factura}
        onChange={handleChange}
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
      <article className="p-2 w-full  space-y-2">
        <label className="block text-gray-700 text-sm font-bold">Dolares</label>
        <input
          type="checkbox"
          name="dolares"
          checked={props.data.dolares}
          onChange={handleChange}
        />
      </article>
    </section>
  );
};
