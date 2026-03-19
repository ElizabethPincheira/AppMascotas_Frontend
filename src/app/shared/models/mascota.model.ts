export interface Mascota {
  id?: number;
  _id?: string;
  nombre: string;
  tipo?: string;
  especie?: string;
  raza: string;
  chip?: string | null;
  ubicacion?: string;
  ubicacionPerdida?: string;
  regionPerdida?: string;
  provinciaPerdida?: string;
  comunaPerdida?: string;
  estado: 'Robado' | 'Extraviado' | 'Encontrado'|'Recuperado'|'Busca hogar'|'Adoptado'|'Buscando pareja'|'Emparejado';
  descripcion?: string;
  caracteristicasAdicionales?: string;
  contacto?: string;
  latitud?: number;
  longitud?: number;
  distanciaKm?: number;
  fechaNacimiento?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  imagenes: string[];
  usuarioId?: string | {
    _id?: string;
    nombre?: string;
    email?: string;
    comuna?: string;
    ciudad?: string;
  };
}
