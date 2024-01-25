import React, { useEffect, useState } from 'react';
import {ViajeForm} from '@/components/ViajeProveedorForm';
import { useRouter } from 'next/router';
import supabase from '@/pages/api/supabase';
import { v4 as uuidv4 } from "uuid";

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
};

interface Cliente {
    id: string;
    nombre: string;
};

interface Proveedor {
    id: string;
    nombre: string;
};

interface ViajeProveedorData { 
    id: string;
    tarifa: number;
    abonado: number;
    origen: string;
    destino: string;
    viaje_id: string;
    proveedor_id: string;
 }


export default function Viaje() {
  const [viaje, setViaje] = useState<ViajeData[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [viajeProveedor, setViajeProveedor] = useState<ViajeProveedorData[]>([]);
  const [proveedores, setProveedor] = useState<Proveedor[]>([]);
  const router = useRouter();
  const [existeViaje, setExisteViaje] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        try{
            const { data: viajeData, error: viajeError } = await supabase.from('viaje').select('*');
            const { data: clientesData, error: clientesError } = await supabase.from('cliente').select('*');
            const { data: viajeProveedorData, error: viajeProveedorError } = await supabase.from('viajeproveedor').select('*');
            const { data: proveedorData, error: proveedorError } = await supabase.from('proveedor').select('*');

        // Manejar errores y establecer datos en el estado
            viajeError ? console.error('Error al obtener los datos de viaje', viajeError) : setViaje(viajeData || []);
            clientesError ? console.error('Error al obtener los datos de clientes', clientesError) : setClientes(clientesData || []);
            viajeProveedorError ? console.error('Error al obtener los datos de viajeProveedor', viajeProveedorError) : setViajeProveedor(viajeProveedorData || []);
            proveedorError ? console.error('Error al obtener los datos de proveedor', proveedorError) : setProveedor(proveedorData || []);

            // Verificar la existencia del ID de viaje en la URL
        const viajeIdFromRoute = router.query.id as string;
        const existeViaje = viajeData && viajeData.some((viaje) => viaje.id === viajeIdFromRoute);

        // Verificar nulabilidad antes de asignar al estado
        if (existeViaje !== null) {
             console.log('Valor de existeViaje:', existeViaje);
          setExisteViaje(existeViaje);
        }
      } catch (error) {
        console.error('Error al obtener los datos', error);
      }
    };

    fetchData();
  }, [router.query.id]);

  

  const addViaje = async (viajeData: ViajeData) => {
    // Verificar y modificar valores antes de insertar en la base de datos para mandarlos null
    const dataToInsert = {
      ...viajeData,
      origen: viajeData.origen || null, 
      destino: viajeData.destino || null,
      factura: viajeData.factura || null,
      tipodeunidad: viajeData.tipodeunidad || null, 
      referencia: viajeData.referencia || null,
    };
  
    const { data, error } = await supabase
      .from('viaje')
      .insert([dataToInsert]);
  
    if (error) {
      console.error("Error al obtener los datos", error);
    } else {
      if (data) {
        setViaje([...viaje, ...data]);
      }
    }
  };  

  const addViajeProveedor = async (viajeProveedorData: ViajeProveedorData) => {
    const { data, error } = await supabase
    .from('viajeproveedor')
    .insert([{ ...viajeProveedorData, proveedor_id: viajeProveedorData.proveedor_id }]);

    if (error) {
      console.error("Error al obtener los datos", error);
    } else {
      if (data) {
        setViajeProveedor([...viajeProveedor, ...data]);
      }
    }
  }

  const handleViajeSubmit = async (viajeData: ViajeData, viajeProveedorData: ViajeProveedorData | ViajeProveedorData[]) => {
    // Obtener el id del viaje de la ruta
    const viajeIdFromRoute = router.query.id as string;
  
    // Convertir a un array si no es un array
    const proveedoresArray = Array.isArray(viajeProveedorData) ? viajeProveedorData : [viajeProveedorData];
  
    try {
      // Asignar el id del viaje desde la ruta al viajeData
      viajeData.id = viajeIdFromRoute;
  
      // Agregar el viaje
      await addViaje(viajeData);
  
      // Agregar los proveedores con el mismo ID del viaje
      for (const proveedor of proveedoresArray) {
        proveedor.viaje_id = viajeIdFromRoute;
        proveedor.id = uuidv4(); // Generar un nuevo ID para cada proveedor 
  
        await addViajeProveedor(proveedor);
      }
  
      router.reload();
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
    }
  };
  

  return (
    <main className="mt-[60px]">
        <ViajeForm 
        onSubmit={handleViajeSubmit} 
        clientes={clientes} 
        proveedores={proveedores}
        existeViaje={existeViaje}
        viajeIdFromRoute={router.query.id as string}
        />
    </main>
  );
}