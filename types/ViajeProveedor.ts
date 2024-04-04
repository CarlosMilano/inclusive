export interface ViajeProveedor {
    id: string;
    origen: string;
    destino: string;
    tarifa: number;
    comision: number;
    factura: string;
    fechafactura: string;
    abonado: number;
    viaje_id: string;
    dolares: boolean;
    viaje: {
      id: string;
      tipodecambio: number;
      referencia: string;
      folio: number;
    };
    proveedor_id: string;
  }
  