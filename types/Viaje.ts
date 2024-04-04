export interface Viaje {
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
    cliente_id: string;
    dolares: boolean;
    abonocomision: number;
    folio: number;
  }