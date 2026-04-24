import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientesApi } from "../api/ingredientes";
import type { IngredienteCreate, IngredienteUpdate } from "../types/ingrediente";

const QUERY_KEY = ["ingredientes"];

export function useIngredientes(params?: { nombre?: string; activo?: boolean; limit?: number }) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => ingredientesApi.list({ ...params, limit: params?.limit ?? 100 }),
  });
}

export function useCreateIngrediente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IngredienteCreate) => ingredientesApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); },
  });
}

export function useUpdateIngrediente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IngredienteUpdate }) =>
      ingredientesApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); },
  });
}

export function useInactivarIngrediente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ingredientesApi.inactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useActivarIngrediente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ingredientesApi.activar(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); },
  });
}
