import { http } from "./http";
import type { Producto, ProductoCreate, ProductoDetail, ProductoList, ProductoUpdate } from "../types/producto";

export const productosApi = {
  list: (params?: { nombre?: string; disponible?: boolean; activo?: boolean; offset?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.nombre) query.set("nombre", params.nombre);
    if (params?.disponible !== undefined) query.set("disponible", String(params.disponible));
    if (params?.activo !== undefined) query.set("activo", String(params.activo));
    if (params?.offset) query.set("offset", String(params.offset));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return http<ProductoList>(`/productos${qs ? `?${qs}` : ""}`);
  },

  getById: (id: number) => http<ProductoDetail>(`/productos/${id}`),

  create: (data: ProductoCreate) =>
    http<ProductoDetail>("/productos", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: ProductoUpdate) =>
    http<ProductoDetail>(`/productos/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  inactivar: (id: number) =>
    http<Producto>(`/productos/${id}`, { method: "DELETE" }),

  activar: (id: number) =>
    http<Producto>(`/productos/${id}/activar`, { method: "POST" }),
};
