import React, { useEffect, useState } from 'react';
import ViajeForm from '@/components/ViajeForm';
import { useRouter } from 'next/router';
import supabase from '@/pages/api/supabase';
//TODO: Hacer que puedas seleccionar el cliente
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
};

interface Cliente {
    id: number;
    nombre: string;
};

export default function Viaje() {
  const [viaje, setViaje] = useState<ViajeData[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: viajeData, error: viajeError } = await supabase.from('viaje').select('*');
      const { data: clientesData, error: clientesError } = await supabase.from('cliente').select('*');

      if (viajeError) {
        console.error('Error al obtener los datos de viaje', viajeError);
      } else {
        setViaje(viajeData || []);
      }

      if (clientesError) {
        console.error('Error al obtener los datos de clientes', clientesError);
      } else {
        setClientes(clientesData || []);
      }
    };

    fetchData();
}, []);

  const addViaje = async (viajeData: ViajeData) => {
    const { 
        origen, 
        destino, 
        tarifa, 
        tipodecambio, 
        factura, 
        comision, 
        tipodeunidad, 
        referencia, 
        fechafactura, 
        abonado,
        cliente_id, 
        dolares 
    } = viajeData;

    if (
        origen.trim() === "" || 
        destino.trim() === "" || 
        tarifa <= 0 || 
        tipodecambio <= 0 || 
        factura.trim() === "" || 
        comision <= 0 || 
        tipodeunidad.trim() === "" || 
        referencia.trim() === "" || 
        fechafactura === null ||
        abonado <= 0 ||
        cliente_id === null ||
        dolares === undefined
        ){
      return;
    }

    const { data, error } = await supabase
    .from('viaje')
    .insert([{ ...viajeData, cliente_id: viajeData.cliente_id
    }]);

    if (error) {
      console.error("Error al obtener los datos", error);
    } else {
      if (data) {
        setViaje([...viaje, ...data]);
      }
      router.reload();
    }
  };  

  const handleViajeSubmit = (viajeData: ViajeData) => {
    addViaje(viajeData);
    console.log(viajeData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-md shadow-md w-[600px]">
        <h1 className="text-3xl font-bold mb-6">Añadir Nuevo Viaje</h1>
        <h2 className="text-xl font-semibold mb-4">Detalles del Viaje</h2>
        <ViajeForm onSubmit={handleViajeSubmit} clientes={clientes}/>
      </div>
    </div>
  );
}