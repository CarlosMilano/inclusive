import React, { useState, ChangeEvent, FormEvent } from 'react';
import {InputField} from './InputField';

interface ViajeData {
  origen: string;
  destino: string;
  tarifa: number;
  tipodecambio: number;
  factura: string;
  comision: number;
  tipodeunidad: string;
  referencia: string;
  fechafactura: string | null;
  abonado: number;
  cliente_id: number | null;
  dolares: boolean;
}

interface ViajeFormProps {
  onSubmit: (viajeData: ViajeData) => void;
  clientes: { id: number; nombre: string }[];
}

const ViajeForm: React.FC<ViajeFormProps> = ({ onSubmit, clientes }) => {
  const [viajeData, setViajeData] = useState<ViajeData>({
    origen: '',
    destino: '',
    tarifa: 0,
    tipodecambio: 0,
    factura: '',
    comision: 0,
    tipodeunidad: '',
    referencia: '',
    fechafactura: null,
    abonado: 0,
    cliente_id: null,
    dolares: false,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const selectedValue = type === 'select-one' ? parseInt(value, 10) : value;

    setViajeData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : selectedValue,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(viajeData);
  };

  return (
    <section className="w-[300px]">
        <form onSubmit={handleSubmit}>
          <InputField
            label="Origen"
            name="origen"
            value={viajeData.origen}
            onChange={handleChange}
          />
          <InputField
            label="Destino"
            name="destino"
            value={viajeData.destino}
            onChange={handleChange}
          />
          <InputField
            label="Tarifa"
            name="tarifa"
            value={viajeData.tarifa}
            onChange={handleChange}
            type="number"
          />
          <InputField
            label="Tipo de Cambio"
            name="tipodecambio"
            value={viajeData.tipodecambio}
            onChange={handleChange}
            type="number"
          />
          <InputField
            label="Factura"
            name="factura"
            value={viajeData.factura}
            onChange={handleChange}
          />
          <InputField
            label="Comisión"
            name="comision"
            value={viajeData.comision}
            onChange={handleChange}
            type="number"
          />
          <InputField
            label="Tipo de Unidad"
            name="tipodeunidad"
            value={viajeData.tipodeunidad}
            onChange={handleChange}
          />
          <InputField
            label="Referencia"
            name="referencia"
            value={viajeData.referencia}
            onChange={handleChange}
          />
          <input
          placeholder='Fecha factura'
          name="fechafactura"
          value={viajeData.fechafactura || ''}
          onChange={handleChange}
          type="date"
          className="p-5 border-none"
          >

          
          </input>
          <div className= "mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Fecha factura:
            </label>
            <input
              name="fechafactura"
              value={viajeData.fechafactura || ''}
              onChange={handleChange}
              type="date"
              className="p-5 border-none"
            />
          </div>
          <InputField
            label="Abonado"
            name="abonado"
            value={viajeData.abonado}
            onChange={handleChange}
            type="number"
          />
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Cliente:
            </label>
            <select
              name="cliente_id"
              value={viajeData.cliente_id === null ? '' : viajeData.cliente_id}
              onChange={handleChange}
              className="border rounded px-3 py-2 mb-2"
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map((cliente: any) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dolares">
              Dolares:
            </label>
              <label className="inline-flex items-center"></label>
              <input
                type="checkbox"
                name="dolares"
                checked={viajeData.dolares}
                onChange={handleChange}
                className="mr-2"
              />
            </div>
          <div className="mb-4">
          <button 
          type="submit" 
          > 
            Guardar
          </button>
          </div>
        </form>
    </section>
  );
};

export default ViajeForm;
