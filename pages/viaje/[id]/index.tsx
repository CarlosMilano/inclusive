import React, { useEffect, useState } from 'react';
import ViajeForm from '@/components/ViajeForm';
import { useRouter } from 'next/router';
import supabase from '@/pages/api/supabase';

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
    id: string;
    nombre: string;
};

interface ViajeProveedorData { 
    proveedor_tarifa: number;
    proveedor_abonado: number;
    proveedor_origen: string;
    proveedor_destino: string;
 }


export default function Viaje() {
  const [viaje, setViaje] = useState<ViajeData[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [viajeProveedor, setViajeProveedor] = useState<ViajeProveedorData[]>([]);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchData = async () => {
      const { data: viajeData, error: viajeError } = await supabase.from('viaje').select('*');
      const { data: clientesData, error: clientesError } = await supabase.from('cliente').select('*');
      const { data: viajeProveedorData, error: viajeProveedorError } = await supabase.from('viajeproveedor').select('*');

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
      if (viajeProveedorError) {
        console.error('Error al obtener los datos de viajeProveedor', viajeProveedorError);
      }else {
        setViajeProveedor(viajeProveedorData || []);
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

  const addViajeProveedor = async (viajeProveedorData: ViajeProveedorData) => {
    const { 
        proveedor_tarifa, 
        proveedor_abonado, 
        proveedor_origen, 
        proveedor_destino, 
     } = viajeProveedorData;

    if (
        proveedor_tarifa <= 0 || 
        proveedor_abonado <= 0 || 
        proveedor_origen.trim() === "" || 
        proveedor_destino.trim() === "" 
        ){
      return;
    }

    const { data, error } = await supabase
    .from('viajeproveedor')
    .insert([{ ...viajeProveedorData, }]);

    if (error) {
      console.error("Error al obtener los datos", error);
    } else {
      if (data) {
        setViajeProveedor([...viajeProveedor, ...data]);
      }
      router.reload();
    }
  }

  const handleViajeSubmit = (viajeData: ViajeData, viajeProveedorData: ViajeProveedorData) => {
    addViaje(viajeData);
    addViajeProveedor(viajeProveedorData);
    console.log(viajeData);
    console.log(viajeProveedorData);
  };

  return (
    <main>
        <ViajeForm 
        onSubmit={handleViajeSubmit} 
        clientes={clientes} 
        />
    </main>
  );
}