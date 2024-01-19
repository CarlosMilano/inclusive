import React from 'react';
import { InputField } from './InputField';

interface ProveedorFormData {
  proveedor_tarifa: number;
  proveedor_abonado: number;
  proveedor_origen: string;
  proveedor_destino: string;
}

interface ProveedorFormProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  data: ProveedorFormData;
}

const ProveedorForm: React.FC<ProveedorFormProps> = ({ onChange, data }) => {
  return (
    <section>
      <label className="block text-gray-700 text-sm font-bold mb-2">Proveedor Tarifa:</label>
      <InputField
        label="Proveedor Tarifa"
        name="proveedor_tarifa"
        value={data.proveedor_tarifa}
        onChange={onChange}
        type="number"
      />

      <label className="block text-gray-700 text-sm font-bold mb-2">Proveedor Abonado:</label>
      <InputField
        label="Proveedor Abonado"
        name="proveedor_abonado"
        value={data.proveedor_abonado}
        onChange={onChange}
        type="number"
      />

      <InputField
        label="Proveedor Origen"
        name="proveedor_origen"
        value={data.proveedor_origen}
        onChange={onChange}
      />

      <InputField
        label="Proveedor Destino"
        name="proveedor_destino"
        value={data.proveedor_destino}
        onChange={onChange}
      />
    </section>
  );
};

export default ProveedorForm;
