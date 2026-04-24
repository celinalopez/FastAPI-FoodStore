import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriasApi } from "../api/categorias";
import type { CategoriaCreate, CategoriaUpdate } from "../types/categoria";

const QUERY_KEY = ["categorias"];

export function useCategorias(params?: { nombre?: string; activo?: boolean; limit?: number }) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => categoriasApi.list({ ...params, limit: params?.limit ?? 100 }),
  });
}

export function useCategoria(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => categoriasApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoriaCreate) => categoriasApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); },
  });
}

export function useUpdateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaUpdate }) =>
      categoriasApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); },
  });
}

export function useInactivarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriasApi.inactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useActivarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriasApi.activar(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); },
  });
}
