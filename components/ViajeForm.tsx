import React, { useState, ChangeEvent, FormEvent } from 'react';
import {InputField} from './InputField';
import ProveedorForm from './ProveedorForm';

interface ViajeData {
  id: string;
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

interface ViajeProveedorData {
  proveedor_tarifa: number;
  proveedor_abonado: number;
  proveedor_origen: string;
  proveedor_destino: string;
  viaje_id: string | null;
  proveedor_id: string | null;
}

interface ViajeFormProps {
  onSubmit: (viajeData: ViajeData, viajeProveedorData: ViajeProveedorData) => void;
  clientes: { id: string; nombre: string }[];
}

const ViajeForm: React.FC<ViajeFormProps> = ({ onSubmit, clientes }) => {
  const [viajeData, setViajeData] = useState<ViajeData>({
    id: '',
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

  const [viajeProveedorData, setViajeProveedorData] = useState<ViajeProveedorData>({
    proveedor_tarifa: 0,
    proveedor_abonado: 0,
    proveedor_origen: '',
    proveedor_destino: '',
    viaje_id: null,
    proveedor_id: null,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const selectedValue = type === 'select-one' ? value : type === 'number' ? parseFloat(value) : value;

    if (name.startsWith('proveedor_')) {
      setViajeProveedorData((prevData) => ({
        ...prevData,
        [name]: selectedValue,
      }));
    } else {
      setViajeData((prevData) => ({
        ...prevData,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : selectedValue,
      }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(viajeData, viajeProveedorData);
  };

  return (
    <section className="mx-auto my-10 max-w-md bg-gray-100 p-6 rounded-md shadow-md">
        <form onSubmit={handleSubmit}>
          <section className="mx-auto my-10 max-w-md bg-white p-6 rounded-md shadow-md">
            <h1 className="text-3xl font-bold mb-6">Añadir Nuevo Viaje</h1>
            <h2 className="text-xl font-semibold mb-4">Detalles del Viaje</h2>
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
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tarifa:
              </label>
              <InputField
                label="Tarifa"
                name="tarifa"
                value={viajeData.tarifa}
                onChange={handleChange}
                type="number"
              />
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tipo de cambio:
              </label>
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
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Comisión:
              </label>
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
              <div className= "mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Fecha factura:
                </label>
                <input
                  name="fechafactura"
                  value={viajeData.fechafactura || ''}
                  onChange={handleChange}
                  type="date"
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Abonado:
              </label>
              <InputField
                label="Abonado"
                name="abonado"
                value={viajeData.abonado}
                onChange={handleChange}
                type="number"
              />
                <div className="mb-4">
                <select
                  name="cliente_id"
                  value={viajeData.cliente_id || ''}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
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
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="dolares"
                      checked={viajeData.dolares}
                      onChange={handleChange}
                      className="form-checkbox h-5 w-5 text-blue-500 focus:outline-none focus:ring focus:border-blue-300"
                    />
                    <span className="ml-2 font-bold">Dolares</span>
                  </label>
                </div>
           </section>
            <div className="mb-4">
              <section className="mx-auto my-10 max-w-md bg-white p-6 rounded-md shadow-md">
              <h1 className="text-3xl font-bold mb-6">Añadir Nuevo Proveedor</h1>
              <h2 className="text-xl font-semibold mb-4">Detalles del Proveedor</h2>
              <ProveedorForm onChange={handleChange} data={viajeProveedorData}/>
              </section>
            </div>
            <section>
            <button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-blue"
            > 
              Guardar
            </button>
          </section>
        </form>
    </section>
  );
};

export default ViajeForm;
