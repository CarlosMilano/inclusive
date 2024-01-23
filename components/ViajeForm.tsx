import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import {InputField} from './InputField';
import {ProveedorForm} from './ProveedorForm';
import Button from './Button';

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
  abonocomision: number;
}

interface ViajeProveedorData {
  id: string;
  tarifa: number;
  abonado: number;
  origen: string;
  destino: string;
  viaje_id: string;
  proveedor_id: string;
}

interface ViajeFormProps {
  onSubmit: (viajeData: ViajeData, viajeProveedorData: ViajeProveedorData[]) => void;
  clientes: { id: string; nombre: string }[];
  proveedores: { id: string; nombre: string }[];
  existeViaje?: boolean;
}

export const ViajeForm= (props: ViajeFormProps) => {
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
    abonocomision: 0,
  });

  const [viajeProveedorData, setViajeProveedorData] = useState<ViajeProveedorData[]>([]);

  //handle para viaje
  const handleChangeViaje = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const selectedValue = type === 'select-one' ? value : type === 'number' ? parseFloat(value) : value;
  
    setViajeData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : selectedValue,
    }));
  };
 //Como hay campos que se llaman igual con un solo handle hay problemas para actualizar el estado 

 //handle para viajeProveedor
  // Cambié el nombre de la función para manejar los cambios en los proveedores
  const handleChangeViajeProveedor = (index: number, formData: ViajeProveedorData) => {
    setViajeProveedorData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], ...formData };
      return newData;
    });
  };


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    props.onSubmit(viajeData, viajeProveedorData);
  };

  const handleAgregarProveedor = () => {
    // Agregué un nuevo objeto ViajeProveedorData al array
    setViajeProveedorData((prevForms) => [...prevForms, { id: '', tarifa: 0, abonado: 0, origen: '', destino: '', viaje_id: '', proveedor_id: '' }]);
  };


  return (
    <section className="mx-auto my-10 max-w-md p-6 rounded-md">
      {props.existeViaje ? (
        <div>
          <h1 className="text-3xl font-bold mb-6">Información del Viaje</h1>
          <p>Origen: {viajeData.origen}</p>
          <p>Destino: {viajeData.destino}</p>
          <p>Tarifa: {viajeData.tarifa}</p>
          <p>Factura: {viajeData.factura}</p>
          <p>Comisión: {viajeData.comision}</p>
          <p>Tipo de unidad: {viajeData.tipodeunidad}</p>
          <p>Referencia: {viajeData.referencia}</p>
          <p>Fecha de Factura: {viajeData.fechafactura || 'N/A'}</p>
          <p>Abonado: {viajeData.abonado}</p>
          <p>ID del Cliente: {viajeData.cliente_id || 'N/A'}</p>
          <p>Dólares: {viajeData.dolares ? 'Sí' : 'No'}</p>
          {viajeData.dolares && <p>Tipo de Cambio: {viajeData.tipodecambio}</p>}
          <p>Abono Comisión: {viajeData.abonocomision}</p>

          <h2 className="text-xl font-semibold mb-4">Información de Proveedores</h2>
          {viajeProveedorData.map((proveedor, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-2">{`Proveedor ${index + 1}`}</h3>
              <p>Origen: {proveedor.origen}</p>
              <p>Destino: {proveedor.destino}</p>
              <p>Tarifa: {proveedor.tarifa}</p>
              <p>Abonado: {proveedor.abonado}</p>
              <p>ID del Proveedor: {proveedor.proveedor_id}</p>
            </div>
          ))}
        </div>
      ) : (

        <form onSubmit={handleSubmit}>
          <section className="mx-auto my-10 max-w-md bg-white p-6 rounded-md shadow-md">
            <h1 className="text-3xl font-bold mb-6">Añadir Nuevo Viaje</h1>
            <h2 className="text-xl font-semibold mb-4">Detalles del Viaje</h2>

              <InputField
              label='Origen:'
              name="origen"
              value={viajeData.origen}
              onChange={handleChangeViaje}
              />

              <InputField
              label='Destino:'
              name="destino"
              value={viajeData.destino}
              onChange={handleChangeViaje}
              />

              <InputField
              label='Tarifa:'
              name="tarifa"
              value={viajeData.tarifa}
              onChange={handleChangeViaje}
              type="number"
              />

              <InputField
              label='Factura:'
              name="factura"
              value={viajeData.factura}
              onChange={handleChangeViaje}
              />

              <InputField
              label='Comision:'
              name="comision"
              value={viajeData.comision}
              onChange={handleChangeViaje}
              type="number"
              />

              <InputField
              label='Tipo de unidad:'
              name="tipodeunidad"
              value={viajeData.tipodeunidad}
              onChange={handleChangeViaje}
              />

              <InputField
              label='Referencia:'
              name="referencia"
              value={viajeData.referencia}
              onChange={handleChangeViaje}
              />

              <section className= "mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Fecha factura:</label>
                <input
                name="fechafactura"
                value={viajeData.fechafactura || ''}
                onChange={handleChangeViaje}
                type="date"
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </section>

              <InputField
              label='Abonado:'
              name="abonado"
              value={viajeData.abonado}
              onChange={handleChangeViaje}
              type="number"
              />

              <section className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Cliente:</label>
                <select
                name="cliente_id"
                value={viajeData.cliente_id || ''}
                onChange={handleChangeViaje}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecciona un cliente</option>
                  {props.clientes.map((cliente: any) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                    </option>
                    ))}
                    </select>
              </section>

              <section className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Dolares: </label>
                    <input
                    type="checkbox"
                    name="dolares"
                    checked={viajeData.dolares}
                    onChange={handleChangeViaje}
                    className="form-checkbox h-5 w-5 text-blue-500 focus:outline-none focus:ring focus:border-blue-300"
                    />
                </section>

                {viajeData.dolares && (
                    <InputField
                    label='Tipo de cambio:'
                    name="tipodecambio"
                    value={viajeData.tipodecambio}
                    onChange={handleChangeViaje}
                    type="number"
                    />
                )}

                <InputField
                label='Abono comision:'
                name="abonocomision"
                value={viajeData.abonocomision}
                onChange={handleChangeViaje}
                type="number"
                />
           </section>

           <section className="mb-4">
              {viajeProveedorData.map((proveedor, index) => (
                <section key={index} className="mx-auto my-10 max-w-md bg-white p-6 rounded-md shadow-md">
                  <h1 className="text-3xl font-bold mb-6">{`Añadir Proveedor ${index + 1} para este viaje`}</h1>
                  <h2 className="text-xl font-semibold mb-4">{`Detalles del Proveedor ${index + 1}`}</h2>
                  <ProveedorForm
                  onChange={(formData) => handleChangeViajeProveedor(index, { ...formData, id: '', viaje_id: '' })}
                  data={proveedor}
                  proveedores={props.proveedores}
                  />
                </section>
              ))}

              <Button 
              title="Agregar Proveedor"
              type="button" 
              onClick={(e) => { e.preventDefault(); handleAgregarProveedor(); }} >
              </Button>
            </section>

            <section>
            <Button
            title="Guardar"
            type='submit'
            />
          </section>

        </form>
      )}
    </section>
  );
};