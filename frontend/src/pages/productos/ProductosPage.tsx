import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import DataTable, { type Column } from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import PaginationControls from "../../components/common/PaginationControls";
import ProductoForm from "../../components/productos/ProductoForm";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import {
  useProductos,
  useProducto,
  useCreateProducto,
  useUpdateProducto,
  useInactivarProducto,
  useActivarProducto,
} from "../../hooks/useProductos";
import { useCategorias } from "../../hooks/useCategorias";
import { useIngredientes } from "../../hooks/useIngredientes";
import type { Producto, ProductoCreate } from "../../types/producto";

export default function ProductosPage() {
  const PAGE_SIZE = 20;
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [inactivando, setInactivando] = useState<Producto | null>(null);
  const [showInactivos, setShowInactivos] = useState(false);
  const [page, setPage] = useState(1);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const listParams = {
    ...(showInactivos ? {} : { activo: true }),
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  };
  const { data, isLoading, isError, error, refetch } = useProductos(listParams);
  const { data: editDetail } = useProducto(editingId ?? 0);
  const { data: categoriasData } = useCategorias({ activo: true });
  const { data: ingredientesData } = useIngredientes({ activo: true });
  const createMut = useCreateProducto();
  const updateMut = useUpdateProducto();
  const inactivarMut = useInactivarProducto();
  const activarMut = useActivarProducto();
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [showInactivos]);

  const columns: Column<Producto>[] = [
    { key: "id", header: "ID" },
    { key: "nombre", header: "Nombre" },
    {
      key: "precio_base",
      header: "Precio",
      render: (p) => `$${Number(p.precio_base).toFixed(2)}`,
    },
    {
      key: "stock_cantidad",
      header: "Stock",
      render: (p) => (
        <span className={p.stock_cantidad === 0 ? "text-red-500 font-medium" : ""}>
          {p.stock_cantidad}
        </span>
      ),
    },
    {
      key: "disponible",
      header: "Disponible",
      render: (p) => (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
          p.disponible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {p.disponible ? "Sí" : "No"}
        </span>
      ),
    },
    ...(showInactivos
      ? [{
          key: "activo",
          header: "Estado",
          render: (p: Producto) => (
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              p.activo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
            }`}>
              {p.activo ? "Activo" : "Inactivo"}
            </span>
          ),
        }]
      : []),
  ];

  const handleSubmit = (formData: ProductoCreate) => {
    if (editingId) {
      updateMut.mutate(
        { id: editingId, data: formData },
        { onSuccess: () => { setModalOpen(false); setEditingId(null); } }
      );
    } else {
      createMut.mutate(formData, { onSuccess: () => { setModalOpen(false); } });
    }
  };

  const handleActivar = (prod: Producto) => {
    activarMut.mutate(prod.id, {
      onError: (err) => {
        setAlertMsg((err as Error).message);
      },
    });
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;

  return (
    <div>
      {/* Alert for activation errors */}
      {alertMsg && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{alertMsg}</span>
          <button onClick={() => setAlertMsg(null)} className="text-red-400 hover:text-red-600 ml-3"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactivos}
              onChange={(e) => setShowInactivos(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-primary"
            />
            Ver inactivos
          </label>
          <button
            onClick={() => { setEditingId(null); setModalOpen(true); }}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
          >
            + Nuevo Producto
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        pageSize={PAGE_SIZE}
        padToPageSize
        onView={(prod) => navigate(`/productos/${prod.id}`)}
        onEdit={(prod) => { if (prod.activo) { setEditingId(prod.id); setModalOpen(true); } }}
        onDelete={(prod) => {
          if (prod.activo) setInactivando(prod);
          else handleActivar(prod);
        }}
        deleteLabel={(prod) => prod.activo ? "Inactivar" : "Activar"}
        deleteClassName={(prod) =>
          prod.activo
            ? "text-red-600 hover:text-red-800"
            : "text-green-600 hover:text-green-800"
        }
        rowClassName={(prod) => (!prod.activo ? "opacity-50" : "")}
      />
      <PaginationControls
        page={page}
        pageSize={PAGE_SIZE}
        total={data?.total ?? 0}
        onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
        onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
      />
      
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingId(null); }}
        title={editingId ? "Editar Producto" : "Nuevo Producto"}
      >
        <ProductoForm
          initial={editingId && editDetail ? editDetail : null}
          categorias={categoriasData?.items ?? []}
          ingredientes={ingredientesData?.items ?? []}
          onSubmit={handleSubmit}
          loading={createMut.isPending || updateMut.isPending}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!inactivando}
        onClose={() => setInactivando(null)}
        onConfirm={() => {
          if (inactivando) inactivarMut.mutate(inactivando.id, { onSuccess: () => setInactivando(null) });
        }}
        title="Inactivar Producto"
        message={`¿Estás seguro de inactivar "${inactivando?.nombre}"?`}
        confirmLabel="Inactivar"
        loading={inactivarMut.isPending}
      />
    </div>
  );
}
