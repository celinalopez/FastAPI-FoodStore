import { http } from "./http";
import type { Ingrediente, IngredienteCreate, IngredienteList, IngredienteUpdate } from "../types/ingrediente";

export const ingredientesApi = {
  list: (params?: { nombre?: string; activo?: boolean; offset?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.nombre) query.set("nombre", params.nombre);
    if (params?.activo !== undefined) query.set("activo", String(params.activo));
    if (params?.offset) query.set("offset", String(params.offset));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return http<IngredienteList>(`/ingredientes${qs ? `?${qs}` : ""}`);
  },

  getById: (id: number) => http<Ingrediente>(`/ingredientes/${id}`),

  create: (data: IngredienteCreate) =>
    http<Ingrediente>("/ingredientes", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: IngredienteUpdate) =>
    http<Ingrediente>(`/ingredientes/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  inactivar: (id: number) =>
    http<Ingrediente>(`/ingredientes/${id}`, { method: "DELETE" }),

  activar: (id: number) =>
    http<Ingrediente>(`/ingredientes/${id}/activar`, { method: "POST" }),
};
