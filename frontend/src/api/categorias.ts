import { http } from "./http";
import type { Categoria, CategoriaCreate, CategoriaList, CategoriaUpdate } from "../types/categoria";

export const categoriasApi = {
  list: (params?: { nombre?: string; activo?: boolean; offset?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.nombre) query.set("nombre", params.nombre);
    if (params?.activo !== undefined) query.set("activo", String(params.activo));
    if (params?.offset) query.set("offset", String(params.offset));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return http<CategoriaList>(`/categorias${qs ? `?${qs}` : ""}`);
  },

  getById: (id: number) => http<Categoria>(`/categorias/${id}`),

  create: (data: CategoriaCreate) =>
    http<Categoria>("/categorias", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: CategoriaUpdate) =>
    http<Categoria>(`/categorias/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  inactivar: (id: number) =>
    http<Categoria>(`/categorias/${id}`, { method: "DELETE" }),

  activar: (id: number) =>
    http<Categoria>(`/categorias/${id}/activar`, { method: "POST" }),
};
