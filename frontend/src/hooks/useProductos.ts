import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productosApi } from "../api/productos";
import type { ProductoCreate, ProductoUpdate } from "../types/producto";

const QUERY_KEY = ["productos"];

export function useProductos(params?: { nombre?: string; activo?: boolean; limit?: number }) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => productosApi.list({ ...params, limit: params?.limit ?? 100 }),
  });
}

export function useProducto(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => productosApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductoCreate) => productosApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); },
  });
}

export function useUpdateProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoUpdate }) =>
      productosApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); },
  });
}

export function useInactivarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productosApi.inactivar(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); },
  });
}

export function useActivarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productosApi.activar(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); },
  });
}
