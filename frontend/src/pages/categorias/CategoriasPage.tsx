import { useState } from "react";
import DataTable, { type Column } from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CategoriaForm from "../../components/categorias/CategoriaForm";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import {
  useCategorias,
  useCreateCategoria,
  useUpdateCategoria,
  useInactivarCategoria,
  useActivarCategoria,
} from "../../hooks/useCategorias";
import type { Categoria, CategoriaCreate } from "../../types/categoria";

export default function CategoriasPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [inactivando, setInactivando] = useState<Categoria | null>(null);
  const [showInactivos, setShowInactivos] = useState(false);

  const { data, isLoading, isError, error, refetch } = useCategorias(
    showInactivos ? undefined : { activo: true }
  );
  const { data: allCats } = useCategorias({ activo: true });
  const createMut = useCreateCategoria();
  const updateMut = useUpdateCategoria();
  const inactivarMut = useInactivarCategoria();
  const activarMut = useActivarCategoria();

  const parentName = (parentId: number | null) => {
    if (!parentId || !allCats) return "—";
    return allCats.items.find((c) => c.id === parentId)?.nombre ?? "—";
  };

  const columns: Column<Categoria>[] = [
    { key: "id", header: "ID" },
    { key: "nombre", header: "Nombre" },
    { key: "parent_id", header: "Cat. padre", render: (c) => parentName(c.parent_id) },
    ...(showInactivos
      ? [{
          key: "activo",
          header: "Estado",
          render: (c: Categoria) => (
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              c.activo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
            }`}>
              {c.activo ? "Activo" : "Inactivo"}
            </span>
          ),
        }]
      : []),
  ];

  const handleSubmit = (formData: CategoriaCreate) => {
    if (editing) {
      updateMut.mutate(
        { id: editing.id, data: formData },
        { onSuccess: () => { setModalOpen(false); setEditing(null); } }
      );
    } else {
      createMut.mutate(formData, { onSuccess: () => { setModalOpen(false); } });
    }
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showInactivos} onChange={(e) => setShowInactivos(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-primary" />
            Ver inactivos
          </label>
          <button onClick={() => { setEditing(null); setModalOpen(true); }}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors">
            + Nueva Categoría
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={data?.items ?? []}
        onEdit={(cat) => { if (cat.activo) { setEditing(cat); setModalOpen(true); } }}
        onDelete={(cat) => { if (cat.activo) setInactivando(cat); else activarMut.mutate(cat.id); }}
        deleteLabel={(cat) => cat.activo ? "Inactivar" : "Activar"}
        deleteClassName={(cat) => cat.activo ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}
        rowClassName={(cat) => (!cat.activo ? "opacity-50" : "")} />

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? "Editar Categoría" : "Nueva Categoría"}>
        <CategoriaForm initial={editing} categorias={allCats?.items ?? []} onSubmit={handleSubmit}
          loading={createMut.isPending || updateMut.isPending} />
      </Modal>

      <ConfirmDialog isOpen={!!inactivando} onClose={() => setInactivando(null)}
        onConfirm={() => { if (inactivando) inactivarMut.mutate(inactivando.id, { onSuccess: () => setInactivando(null) }); }}
        title="Inactivar Categoría" message={`¿Inactivar "${inactivando?.nombre}"? Los productos relacionados también se inactivarán.`}
        confirmLabel="Inactivar" loading={inactivarMut.isPending} />
    </div>
  );
}
