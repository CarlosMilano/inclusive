import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import {InputField} from './InputField';
import {ProveedorForm} from './ProveedorForm';
import Button from './Button';
import supabase from '@/pages/api/supabase';
import { Box, CircularProgress, Skeleton } from '@mui/material';
import router from 'next/router';
import currencyFormatter from "currency-formatter";

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
  cliente_id: string | null;
  dolares: boolean;
  abonocomision: number;
  folio: number;
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
  existeViaje: boolean;
  viajeIdFromRoute: string;
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
    folio: 0,
  });

  const [viajeProveedorData, setViajeProveedorData] = useState<ViajeProveedorData[]>([]);

  const [loading, setLoading] = useState(true);

  const [editModeViaje, setEditModeViaje] = useState(false);
  const [editModeProveedor, setEditModeProveedor] = useState(false);
  const [proveedorEditandoIndex, setProveedorEditandoIndex] = useState(-1);

  const [openCobradoComisionViaje, setOpenCobradoComisionViaje] = useState(false);
  const [openAbonadoComisionViaje, setOpenAbonadoComisionViaje] = useState(false);
  const [openCobradoTarifaViaje, setOpenCobradoTarifaViaje] = useState(false);
  const [openAbonadoTarifaViaje, setOpenAbonadoTarifaViaje] = useState(false);
  const [nuevoAbonoComisionViaje, setNuevoAbonoComisionViaje] = useState(0);
  const [nuevoAbonoTarifaViaje, setNuevoAbonoTarifaViaje] = useState(0);

  const [openCobradoTarifaProveedor, setOpenCobradoTarifaProveedor] = useState(false);
  const [openAbonadoTarifaProveedor, setOpenAbonadoTarifaProveedor] = useState(false);
  const [nuevoAbonoTarifaProveedor, setNuevoAbonoTarifaProveedor] = useState(0);
  const [proveedorSeleccionadoIndex, setProveedorSeleccionadoIndex] = useState(-1);


  //Para volver a jalar la info del componente cuando se pasa a modo de solo mostrar los datos
  useEffect(() => {

    const fetchViajeData = async () => {
      try {
        const viajeIdFromRoute = props.viajeIdFromRoute;
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data: viajeData, error: viajeError } = await supabase
          .from('viaje')
          .select('*')
          .eq('id', viajeIdFromRoute)
          .single();

        if (viajeError) {
          console.error('Error al obtener los datos del viaje', viajeError);
        } else if (viajeData) {
          setViajeData(viajeData);
        }
      } catch (error) {
        console.error('Error al obtener los datos del viaje', error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchViajeProveedorData = async () => {
      try {
        const viajeIdFromRoute = props.viajeIdFromRoute;

        const { data: viajeProveedorData, error: viajeProveedorError } = await supabase
          .from('viajeproveedor')
          .select('*')
          .eq('viaje_id', viajeIdFromRoute);

        if (viajeProveedorError) {
          console.error('Error al obtener los datos de los proveedores del viaje', viajeProveedorError);
        } else if (viajeProveedorData) {
          setViajeProveedorData(viajeProveedorData);
        }
      } catch (error) {
        console.error('Error al obtener los datos de los proveedores del viaje', error);
      }
    };

    fetchViajeData();
    fetchViajeProveedorData();
  }, [props.viajeIdFromRoute]);

  //Funcion para eiminar viaje completo y sus proveedores
  const eliminarViaje = async (ViajeData: ViajeData) => {
    try {
      const { data: proveedorData, error: proveedorError } = await supabase
        .from('viajeproveedor')
        .delete()
        .eq('viaje_id', ViajeData.id);
  
      if (proveedorError) {
        console.error('Error al eliminar los proveedores del viaje', proveedorError);
        return;
      }
  
      console.log('Proveedores del viaje eliminados con éxito:', proveedorData);
  
      const { data: viajeDataEliminado, error: viajeError } = await supabase
        .from('viaje')
        .delete()
        .eq('id', ViajeData.id)
        .single();
  
      if (viajeError) {
        console.error('Error al eliminar el viaje', viajeError);
        return;
      }
  
      console.log('Viaje eliminado con éxito:', viajeDataEliminado);
  
    } catch (error) {
      console.error('Error al eliminar el viaje', error);
    }
    router.push('/inicio');
  };

  //Funcion para eliminar proveedor por proveedor
  const eliminarProveedor = async (proveedorId: string) => {
    try {
      const { data, error } = await supabase
        .from('viajeproveedor')
        .delete()
        .eq('id', proveedorId)
        .single();
  
      if (error) {
        console.error('Error al eliminar el proveedor', error);
        return;
      }
  
      console.log('Proveedor eliminado con éxito:', data);
  
      setViajeProveedorData((prevData) =>
        prevData.filter((proveedor) => proveedor.id !== proveedorId)
      );
    } catch (error) {
      console.error('Error al eliminar el proveedor', error);
    }
  };

  //Funcion para actualizar viaje
  const guardarCambiosViaje = async (viajeActualizado: ViajeData) => {
    try {
      const { data, error } = await supabase
        .from('viaje')
        .update(viajeActualizado)
        .eq('id', viajeActualizado.id);
  
      if (error) {
        console.error('Error al actualizar el viaje', error);
        return false;
      }
  
      console.log('Viaje actualizado con éxito:', data);
      return true;
    } catch (error) {
      console.error('Error en la solicitud PUT para el viaje', error);
      return false;
    }
  };

  // Función para actualizar proveedor por proveedor
  const guardarCambiosProveedor = async (proveedorActualizado: ViajeProveedorData) => {
    try {
      const { data, error } = await supabase
        .from('viajeproveedor')
        .update(proveedorActualizado)
        .eq('id', proveedorActualizado.id);

      if (error) {
        console.error('Error al actualizar el proveedor del viaje', error);
        return false;
      }

      console.log('Proveedor del viaje actualizado con éxito:', data);
      return true;
    } catch (error) {
      console.error('Error en la solicitud PUT para el proveedor del viaje', error);
      return false;
    }
  };

  //handle para viaje
  const handleChangeViaje = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const selectedValue = type === 'select-one' ? value : type === 'number' ? parseFloat(value) : value;
  
    setViajeData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : selectedValue,
    }));
  };

 //Como hay campos que se llaman igual con un solo handle hay problemas para actualizar el estado  y ademas proveedor son listas

 //handle para viajeProveedor cuando es formulario nuevo
  const handleChangeViajeProveedor = (index: number, formData: ViajeProveedorData) => {
    setViajeProveedorData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], ...formData };
      return newData;
    });
  };

  //Handle para editar proveedor
  const handleChangeViajeProveedorEdit = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const selectedValue = type === 'select-one' ? value : type === 'number' ? parseFloat(value) : value;
  
    setViajeProveedorData((prevData) => {
      const newData = [...prevData];
      newData[proveedorEditandoIndex] = { ...newData[proveedorEditandoIndex], [name]: selectedValue };
      return newData;
    });
  };

  //Para no usar el mismo handle que los demas campos ya que actualiza el valor en tiempo real y no se suman los abonos
  const handleAbonoComisionViajeChange = (e: any) => {
    setNuevoAbonoComisionViaje(Number(e.target.value));
  };

  //Mismo caso que arriba
  const handleAbonoTarifaViajeChange = (e: any) => {
    setNuevoAbonoTarifaViaje(Number(e.target.value));
  };

  //Mismo caso que arriba
  const handleAbonoTarifaProveedorChange = (e: any) => {
    setNuevoAbonoTarifaProveedor(Number(e.target.value));
  };

  //Para agregar un nuevo viaje vacio cuando se llena un nuevo viaje(se pasa como props en index)
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    props.onSubmit(viajeData, viajeProveedorData);
  };

  //Para agregar un nuevo proveedor vacio cuando se llena un nuevo viaje
  const handleAgregarProveedor = () => {
    setViajeProveedorData((prevForms) => [...prevForms, { id: '', tarifa: 0, abonado: 0, origen: '', destino: '', viaje_id: '', proveedor_id: '' }]);
  };

  //Para obtener el nombre del cliente por id y asi mostrarlo en el titulo
  const obtenerNombreClientePorId = (cliente_id: any) => {
    const clienteEncontrado = props.clientes.find((cliente) => cliente.id === cliente_id);
    return clienteEncontrado ? clienteEncontrado.nombre : 'N/A';
  };

  //Para obtener el nombre del proveedor por id y asi mostrarlo en el titulo
  const obtenerNombreProveedorPorId = (proveedor_id: any) => {
    const proveedorEncontrado = props.proveedores.find((proveedor) => proveedor.id === proveedor_id);
    return proveedorEncontrado ? proveedorEncontrado.nombre : 'N/A';
  };

  //Para pagar de contado la comision de viaje
  const contadoComisionViaje = async () => {
    setViajeData((prevData) => {
      const newData = { ...prevData, abonocomision: prevData.comision };
      
      guardarCambiosViaje(newData).then((exito) => {
        if (exito) {
          router.reload();
        }
      });
  
      return newData;
    });
  };

  //Para pagar de contado la tarifa de viaje
  const contadoTarifaViaje = async () => {
    setViajeData((prevData) => {
      const newData = { ...prevData, abonado: prevData.tarifa };
      
      guardarCambiosViaje(newData).then((exito) => {
        if (exito) {
          router.reload();
        }
      });
  
      return newData;
    });
  };

  //Para pagar por abonos la comision del viaje y que se sume al abono anterior
  const abonoComisionViaje = async () => {
    const abonoSumado = viajeData.abonocomision + nuevoAbonoComisionViaje;
  
    setViajeData((prevData) => ({
      ...prevData,
      abonocomision: abonoSumado,
    }));
    
    const exito = await guardarCambiosViaje({ ...viajeData, abonocomision: abonoSumado });
    
    if (exito) {
      router.reload();
    }
  };

  //Para pagar por abonos la tarifa del viaje y que se sume al abono anterior
  const abonoTarifaViaje = async () => {
    const abonoSumado = viajeData.abonado + nuevoAbonoTarifaViaje;
  
    setViajeData((prevData) => ({
      ...prevData,
      abonado: abonoSumado,
    }));
    
    const exito = await guardarCambiosViaje({ ...viajeData, abonado: abonoSumado });
    
    if (exito) {
      router.reload();
    }
  };

  //Para pagar de contado la tarifa de proveedor
  const contadoTarifaProveedor = async (proveedorIndex: number) => {
    setViajeProveedorData((prevData) => {

      prevData[proveedorIndex].abonado = prevData[proveedorIndex].tarifa;

      guardarCambiosProveedor(prevData[proveedorIndex]).then((exito) => {
        if (exito) {
          router.reload();
        }
      });
  
      return [...prevData];
    });
  };

  //Para pagar por abonos la tarifa del proveedor y que se sume al abono anterior
  const abonoTarifaProveedor = async () => {
    if (proveedorSeleccionadoIndex === -1) {
      console.error('No se ha seleccionado un proveedor para el abono.');
      return;
    }
  
    const proveedorActual = viajeProveedorData[proveedorSeleccionadoIndex];
    const abonoSumado = proveedorActual.abonado + nuevoAbonoTarifaProveedor;
  
    setViajeProveedorData((prevData) => {
      const newData = [...prevData];
      newData[proveedorSeleccionadoIndex] = { ...proveedorActual, abonado: abonoSumado };
  
      guardarCambiosProveedor(newData[proveedorSeleccionadoIndex]);
  
      return newData;
    });
    router.reload();
  };
  
  //Para abrir y cerrar el menu de cobrado para comision
  const clickCobradoComisionViaje = () => {
    setOpenCobradoComisionViaje(!openCobradoComisionViaje);
  };

  //Para abrir y cerrar el menu de abonado que esta dentro de cobrado para comision
  const clickAbonadoComisionViaje = () => {
    setOpenAbonadoComisionViaje(!openAbonadoComisionViaje);
  };

  //Para abrir y cerrar el menu de cobrado para tarifa
  const clickCobradoTarifaViaje = () => {
    setOpenCobradoTarifaViaje(!openCobradoTarifaViaje);
  };

  //Para abrir y cerrar el menu de abonado que esta dentro de cobrado para tarifa
  const clickAbonadoTarifaViaje = () => {
    setOpenAbonadoTarifaViaje(!openAbonadoTarifaViaje);
  };

  //Para abrir y cerrar el menu de cobrado para tarifa de proveedor
  const clickCobradoTarifaProveedor = (index: number) => {
    setProveedorSeleccionadoIndex(index);
    setOpenCobradoTarifaProveedor(!openCobradoTarifaProveedor);
  };

  //Para abrir y cerrar el menu de abonado que esta dentro de cobrado para tarifa de proveedor y ademas actualizar el index del proveedor al presional el boton
  const clickAbonadoTarifaProveedor = (index: number) => {
    setProveedorSeleccionadoIndex(index);
    setOpenAbonadoTarifaProveedor(!openAbonadoTarifaProveedor);
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <section>
      {props.existeViaje ? (
        <section className="min-h-screen flex flex-col items-center p-5">
          <section className="flex flex-wrap justify-center gap-10">
            
            {!loading ? (

            <section>
              {editModeViaje ? (
                <section className="mx-auto my-10 max-w-md bg-white p-6 rounded-md shadow-md">
                <h1 className="text-4xl font-semibold p-5">{obtenerNombreClientePorId(viajeData.cliente_id)}</h1>
                <h2 className="text-xl text-gray-600 font-semibold mb-5 ml-5">Detalle Viaje</h2>
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

                        <Button
                          title="Guardar Cambios"
                          type="button"
                          onClick={async () => {
                            const exito = await guardarCambiosViaje(viajeData);
                            if (exito) {
                              setEditModeViaje(false);
                              router.reload();
                            }
                          }}
                        />
                  </section>

              ) : (

                <section className="bg-white p-4 rounded-md shadow-xl border border-gray-300 mb-5">
                  <h1 className="text-4xl font-semibold">{obtenerNombreClientePorId(viajeData.cliente_id)}</h1>

                  <section>
                    <Button 
                      title="Borrar Viaje"
                      type="button"
                      onClick={() => {
                        const confirmacion = window.confirm('¿Estás seguro que quieres eliminar el viaje y los proveedores?');

                        if (confirmacion) {
                          eliminarViaje(viajeData);
                        }
                      }}
                    />
                    
                    <Button
                      title="Editar Viaje"
                      type="button"
                      onClick={() => setEditModeViaje(true)}
                    />
                  </section>

                  <section className="bg-white p-4 rounded-md shadow-xl border border-gray-300 mb-5">
                    <h2 className="text-xl text-gray-600 font-semibold mb-5 ml-5">Detalle Viaje</h2>
                    <section className="text-gray-500 border p-2 rounded mb-2">
                      <label className="font-bold">Origen:</label> {viajeData.origen}
                    </section>

                    <section className="text-gray-500 border p-2 rounded mb-2">
                      <label className="font-bold">Destino:</label> {viajeData.destino}
                    </section>

                    <section className="text-gray-500 border p-2 rounded mb-2">
                      <label className="font-bold">Factura:</label> {viajeData.factura || 'N/A'}
                    </section>

                    <section className="text-gray-500 border p-2 rounded mb-2">
                      <label className="font-bold">Tipo de unidad:</label> {viajeData.tipodeunidad || 'N/A'}
                    </section>

                    <section className="text-gray-500 border p-2 rounded mb-2">
                      <label className="font-bold">Referencia:</label> {viajeData.referencia || 'N/A'}
                    </section>

                    <section className="text-gray-500 border p-2 rounded mb-2">
                      <label className="font-bold">Fecha de Factura:</label> {viajeData.fechafactura || 'N/A'}
                    </section>

                    {viajeData.dolares && (
                      <section className="text-gray-500 border p-2 rounded mb-2">
                        <label className="font-bold">Dólares:</label> Sí
                        <br />
                        <label className="font-bold">Tipo de Cambio:</label> {currencyFormatter.format(viajeData.tipodecambio, {code: "MXN", precision: 0,})}
                      </section>
                    )}

                    <section>
                      <article>
                      <h2 className="text-xl text-gray-600 font-semibold p-5">Comisión</h2>
                      <section className="text-gray-500 border p-2 rounded mb-2">
                        <label className="font-bold">Comisión:</label> {currencyFormatter.format(viajeData.comision, {code: "MXN", precision: 0,})}
                      </section>

                      <section className="text-gray-500 border p-2 rounded mb-2">
                        <label className="font-bold">Abono:</label> {currencyFormatter.format(viajeData.abonocomision, {code: "MXN", precision: 0,})}
                      </section>

                      {viajeData.abonocomision !== viajeData.comision && (
                      <Button 
                      title="Pagar" 
                      onClick={clickCobradoComisionViaje} 
                      />
                      )}
                      
                      <section
                        className={`z-10 transition-all duration-300 overflow-hidden${
                          openCobradoComisionViaje
                            ? " max-h-[500px] opacity-100 translate-y-0"
                            : " max-h-0 opacity-0 translate-y-[100%]"
                        }`}
                        style={{
                          visibility: openCobradoComisionViaje ? "visible" : "hidden",
                        }}
                      >
                        <Button 
                        title="Contado" 
                        type="button" 
                        onClick={contadoComisionViaje}
                        />

                        <Button 
                        title="Abono" 
                        type="button"
                        onClick={clickAbonadoComisionViaje} 
                        />
                        <section
                          className={`z-10 transition-all duration-300 overflow-hidden${
                            openAbonadoComisionViaje
                              ? " max-h-[500px] opacity-100 translate-y-0"
                              : " max-h-0 opacity-0 translate-y-[100%]"
                          }`}
                          style={{
                            visibility: openAbonadoComisionViaje ? "visible" : "hidden",
                          }}
                        >
                          <InputField
                            label='Abono comision:'
                            name="abonocomision"
                            value={nuevoAbonoComisionViaje}
                            onChange={handleAbonoComisionViajeChange}
                            type="number"
                          />
                          <Button
                          title="Guardar Abono"
                          type="button"
                          onClick={abonoComisionViaje}
                          />
                        </section>
                      </section>
                    </article>
                  </section>

                  <section>
                    <article>
                      <h2 className="text-xl text-gray-600 font-semibold p-5">Tarifa</h2>
                      <section className="text-gray-500 border p-2 rounded mb-2">
                        <label className="font-bold">Tarifa:</label> {currencyFormatter.format(viajeData.tarifa, {code: "MXN", precision: 0,})}
                      </section>

                      <section className="text-gray-500 border p-2 rounded mb-2">
                        <label className="font-bold">Abono:</label> {currencyFormatter.format(viajeData.abonado, {code: "MXN", precision: 0,})}
                      </section>

                      {viajeData.abonado !== viajeData.tarifa && (
                      <Button 
                      title="Pagar" 
                      onClick={clickCobradoTarifaViaje} 
                      />
                      )}

                      <section
                        className={`z-10 transition-all duration-300 overflow-hidden${
                          openCobradoTarifaViaje
                            ? " max-h-[500px] opacity-100 translate-y-0"
                            : " max-h-0 opacity-0 translate-y-[100%]"
                        }`}
                        style={{
                          visibility: openCobradoTarifaViaje ? "visible" : "hidden",
                        }}
                      >
                        <Button 
                        title="Contado" 
                        type="button" 
                        onClick={contadoTarifaViaje}
                        />

                        <Button 
                        title="Abono" 
                        type="button"
                        onClick={clickAbonadoTarifaViaje} 
                        />
                        <section
                          className={`z-10 transition-all duration-300 overflow-hidden${
                            openAbonadoTarifaViaje
                              ? " max-h-[500px] opacity-100 translate-y-0"
                              : " max-h-0 opacity-0 translate-y-[100%]"
                          }`}
                          style={{
                            visibility: openAbonadoTarifaViaje ? "visible" : "hidden",
                          }}
                        >
                          <InputField
                            label='Abonado:'
                            name="abonado"
                            value={nuevoAbonoTarifaViaje}
                            onChange={handleAbonoTarifaViajeChange}
                            type="number"
                          />
                          <Button
                          title="Guardar Abono"
                          type="button"
                          onClick={abonoTarifaViaje}
                          />
                        </section>
                      </section>
                    </article>
                  </section>

                  </section>
                </section>
              )}
            </section>

          ) : (
            <section className="flex flex-col bg-white w-[320px] h-[650px] m-2 shadow-xl rounded-md p-3">
              <Skeleton height={100} animation="wave" />
            </section>
          )}

          {!loading ? (

          <section className="flex flex-wrap justify-center gap-10">
            {viajeProveedorData.map((proveedor, index) => (
            
            <section key={index}>
              {editModeProveedor && index === proveedorEditandoIndex ? (
              
              <section className="flex flex-col bg-white w-[320px] h-[700px] m-2 shadow-xl rounded-md p-3">
              <h1 className="text-4xl font-semibold p-5">{`${obtenerNombreProveedorPorId(proveedor.proveedor_id)}`}</h1>
              <section>
                <InputField
                label=" Proveedor Tarifa:"
                name="tarifa"
                value={viajeProveedorData[index].tarifa}
                onChange={handleChangeViajeProveedorEdit}
                type="number"
                />

                <InputField
                label="Proveedor Abonado:"
                name="abonado"
                value={viajeProveedorData[index].abonado}
                onChange={handleChangeViajeProveedorEdit}
                type="number"
                />

                <InputField
                label="Proveedor Origen:"
                name="origen"
                value={viajeProveedorData[index].origen}
                onChange={handleChangeViajeProveedorEdit}
                />

                <InputField
                label="Proveedor Destino:"
                name="destino"
                value={viajeProveedorData[index].destino}
                onChange={handleChangeViajeProveedorEdit}
                />

                <section className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">Proveedor:</label>
                      <select
                      name="proveedor_id"
                      value={viajeProveedorData[index].proveedor_id || ''}
                      onChange={handleChangeViajeProveedorEdit}
                      className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
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
              
              <Button
                title="Guardar Cambios"
                type="button"
                onClick={async () => {
                  const exito = await guardarCambiosProveedor(proveedor);
                  if (exito) {
                    setEditModeProveedor(false);
                    setProveedorEditandoIndex(-1);
                    router.reload();
                  }
                }}
              />
              </section>
              
              ) : (
              
              <section className="bg-white p-5 rounded-md shadow-xl border border-gray-300">
                <h1 className="text-4xl font-semibold ">{`${obtenerNombreProveedorPorId(proveedor.proveedor_id)}`}</h1>

                <section>
                  <Button 
                    title="Borrar Proveedor"
                    type="button"
                    onClick={() => {
                      const confirmacion = window.confirm('¿Estás seguro que quieres eliminar este proveedor?');
                      if (confirmacion) {
                        eliminarProveedor(proveedor.id);
                      }
                    }}
                  />
                  <Button
                      title="Editar Proveedor"
                      type="button"
                      onClick={() => {
                        setEditModeProveedor(true);
                        setProveedorEditandoIndex(index);
                      }}
                    />
                </section>

                <section className="bg-white p-4 rounded-md shadow-xl border border-gray-300 mb-5">
                  <h2 className="text-xl text-gray-600 font-semibold mb-5 ml-5">Detalle Proveedor</h2>
                  <section className="text-gray-500 border p-2 rounded mb-2">
                    <label className="font-bold">Origen:</label> {proveedor.origen}
                  </section>

                  <section className="text-gray-500 border p-2 rounded mb-2">
                    <label className="font-bold">Destino:</label> {proveedor.destino}
                  </section>

                  <section className="text-gray-500 border p-2 rounded mb-2">
                    <label className="font-bold">Tarifa:</label> {currencyFormatter.format(proveedor.tarifa, {code: "MXN", precision: 0,})}
                  </section>

                  <section className="text-gray-500 border p-2 rounded mb-2">
                    <label className="font-bold">Abonado:</label> {currencyFormatter.format(proveedor.abonado, {code: "MXN", precision: 0,})}
                  </section>

                  <section>
                    <article>
                      <h2 className="text-xl text-gray-600 font-semibold p-5">Tarifa</h2>
                      <section className="text-gray-500 border p-2 rounded mb-2">
                        <label className="font-bold">Tarifa:</label> {currencyFormatter.format(proveedor.tarifa, {code: "MXN", precision: 0,})}
                      </section>

                      <section className="text-gray-500 border p-2 rounded mb-2">
                        <label className="font-bold">Abono:</label> {currencyFormatter.format(proveedor.abonado, {code: "MXN", precision: 0,})}
                      </section>

                      {proveedor.abonado !== proveedor.tarifa && (
                      <Button 
                      title="Pagar" 
                      onClick={() => clickCobradoTarifaProveedor(index)} 
                      />
                      )}

                      <section
                        className={`z-10 transition-all duration-300 overflow-hidden${
                          openCobradoTarifaProveedor && proveedorSeleccionadoIndex === index
                            ? " max-h-[500px] opacity-100 translate-y-0"
                            : " max-h-0 opacity-0 translate-y-[100%]"
                        }`}
                        style={{
                          visibility: openCobradoTarifaProveedor ? "visible" : "hidden",
                        }}
                      >
                        <Button 
                        title="Contado" 
                        type="button" 
                        onClick={() => contadoTarifaProveedor(index)}
                        />

                        <Button 
                        title="Abono" 
                        type="button"
                        onClick={() => {clickAbonadoTarifaProveedor(index)}}
                        />
                        <section
                          className={`z-10 transition-all duration-300 overflow-hidden${
                            openAbonadoTarifaProveedor && proveedorSeleccionadoIndex === index
                              ? " max-h-[500px] opacity-100 translate-y-0"
                              : " max-h-0 opacity-0 translate-y-[100%]"
                          }`}
                          style={{
                            visibility: openAbonadoTarifaProveedor ? "visible" : "hidden",
                          }}
                        >
                          <InputField
                            label='Abonado:'
                            name="abonado"
                            value={nuevoAbonoTarifaProveedor}
                            onChange={handleAbonoTarifaProveedorChange}
                            type="number"
                          />
                          <Button
                          title="Guardar Abono"
                          type="button"
                          onClick={() => {abonoTarifaProveedor}}
                          />
                        </section>
                      </section>
                    </article>
                  </section>

                </section>
              </section>
                )}
            </section>
              ))}
          </section>

            ) : (

              <section className="flex flex-wrap justify-center gap-10">
                {Array.from({ length: viajeProveedorData.length > 0 ? viajeProveedorData.length : 3 }).map((_, index) => (
                  <section key={index} className="flex flex-col bg-white w-[320px] h-[450px] m-2 shadow-xl rounded-md p-3">
                    <Skeleton height={100} animation="wave" />
                  </section>
                ))}
              </section>
            )}

          </section>
        </section>

      ) : (

        <section className="min-h-screen flex flex-col items-center p-5 flex flex-wrap justify-center gap-10">
          <form onSubmit={handleSubmit}>
            {!loading ? (

            <section className="mx-auto my-10 max-w-md bg-white p-6 rounded-md shadow-md">
              <h1 className="text-4xl font-semibold p-5">Añadir Nuevo Viaje</h1>
              <h2 className="text-xl font-semibold p-5 text-gray-500">Detalles del Viaje</h2>
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

                  <InputField
                  label='Folio:'
                  name="folio"
                  value={viajeData.folio}
                  onChange={handleChangeViaje}
                  type="number"
                  />
            </section>

            ) : (
              <section className="mx-auto my-10 max-w-md bg-white p-6 rounded-md shadow-md">
                <Skeleton height={1000} animation="wave" />
              </section>
            )}

            <section className="mb-4">
                {viajeProveedorData.map((proveedor, index) => (
                  <section key={index} className="mx-auto my-10 max-w-md bg-white p-6 rounded-md shadow-md">
                    <h1 className="text-3xl font-bold mb-6">{`Añadir Proveedor ${index + 1} para este viaje`}</h1>
                    <h2 className="text-xl font-semibold mb-4">{`Detalles del Proveedor ${index + 1}`}</h2>
                    <ProveedorForm
                    onChange={(formData: any) => handleChangeViajeProveedor(index, { ...formData, id: '', viaje_id: '' })}
                    data={proveedor}
                    proveedores={props.proveedores}
                    />
                  </section>
                ))}
            </section>

              <section>
                <Button 
                title="Agregar Proveedor"
                type="button" 
                onClick={(e) => { e.preventDefault(); handleAgregarProveedor(); }} >
                </Button>
                
                <Button
                title="Guardar"
                type='submit'
                />
              </section>

          </form>
        </section>
      )}
    </section>
  );
};