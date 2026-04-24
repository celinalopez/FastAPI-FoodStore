export interface CategoriaEnProducto {
  id: number;
  nombre: string;
  descripcion: string | null;
  es_principal: boolean;
}

export interface IngredienteConCantidad {
  id: number;
  nombre: string;
  descripcion: string | null;
  es_alergeno: boolean;
  cantidad: number;
  es_removible: boolean;
}

export interface CategoriaInput {
  categoria_id: number;
  es_principal: boolean;
}

export interface IngredienteInput {
  ingrediente_id: number;
  cantidad: number;
  es_removible: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagenes_url: string[];
  stock_cantidad: number;
  disponible: boolean;
  activo: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProductoDetail extends Producto {
  categorias: CategoriaEnProducto[];
  ingredientes: IngredienteConCantidad[];
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string | null;
  precio_base: number;
  imagenes_url?: string[];
  stock_cantidad?: number;
  disponible?: boolean;
  categorias: CategoriaInput[];
  ingredientes?: IngredienteInput[];
}

export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string | null;
  precio_base?: number;
  imagenes_url?: string[];
  stock_cantidad?: number;
  disponible?: boolean;
  categorias?: CategoriaInput[];
  ingredientes?: IngredienteInput[];
}

export interface ProductoList {
  items: Producto[];
  total: number;
}
