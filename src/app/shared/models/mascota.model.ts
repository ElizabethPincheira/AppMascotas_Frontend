export interface Mascota {
  id: number;
  nombre: string;
  tipo: string;
  raza: string;
  chip: string | null;
  ubicacion: string;
  estado: 'Robado' | 'Extraviado' | 'Encontrado'|'Recuperado'|'Busca hogar'|'Adoptado'|'Buscando pareja'|'Emparejado';
  descripcion: string;
  imagenUrl: string;
}
1
