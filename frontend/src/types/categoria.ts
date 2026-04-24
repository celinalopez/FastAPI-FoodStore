export interface Categoria {
  id: number;
  parent_id: number | null;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CategoriaCreate {
  nombre: string;
  descripcion?: string | null;
  imagen_url?: string | null;
  parent_id?: number | null;
}

export interface CategoriaUpdate {
  nombre?: string;
  descripcion?: string | null;
  imagen_url?: string | null;
  parent_id?: number | null;
}

export interface CategoriaList {
  items: Categoria[];
  total: number;
}
