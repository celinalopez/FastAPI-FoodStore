import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import DataTable, { type Column } from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import PaginationControls from "../../components/common/PaginationControls";
import IngredienteForm from "../../components/ingredientes/IngredienteForm";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import {
  useIngredientes,
  useCreateIngrediente,
  useUpdateIngrediente,
  useInactivarIngrediente,
  useActivarIngrediente,
} from "../../hooks/useIngredientes";
import type { Ingrediente, IngredienteCreate } from "../../types/ingrediente";

export default function IngredientesPage() {
  const PAGE_SIZE = 20;
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Ingrediente | null>(null);
  const [inactivando, setInactivando] = useState<Ingrediente | null>(null);
  const [showInactivos, setShowInactivos] = useState(false);
  const [page, setPage] = useState(1);
  const listParams = {
    ...(showInactivos ? {} : { activo: true }),
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError, error, refetch } = useIngredientes(listParams);
  const createMut = useCreateIngrediente();
  const updateMut = useUpdateIngrediente();
  const inactivarMut = useInactivarIngrediente();
  const activarMut = useActivarIngrediente();
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [showInactivos]);
  
  const columns: Column<Ingrediente>[] = [
    { key: "id", header: "ID" },
    { key: "nombre", header: "Nombre" },
    { key: "descripcion", header: "Descripción", render: (i) => i.descripcion ?? "—" },
    {
      key: "es_alergeno",
      header: "Alérgeno",
      render: (i) =>
        i.es_alergeno ? (
          <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> Sí
          </span>
        ) : (
          <span className="text-gray-400 text-xs">No</span>
        ),
    },
    ...(showInactivos
      ? [{
          key: "activo",
          header: "Estado",
          render: (i: Ingrediente) => (
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              i.activo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
            }`}>
              {i.activo ? "Activo" : "Inactivo"}
            </span>
          ),
        }]
      : []),
  ];

  const handleSubmit = (formData: IngredienteCreate) => {
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
        <h1 className="text-2xl font-bold text-gray-800">Ingredientes</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showInactivos} onChange={(e) => setShowInactivos(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-primary" />
            Ver inactivos
          </label>
          <button onClick={() => { setEditing(null); setModalOpen(true); }}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors">
            + Nuevo Ingrediente
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={data?.items ?? []}
        pageSize={PAGE_SIZE}
        padToPageSize
        onEdit={(ing) => { if (ing.activo) { setEditing(ing); setModalOpen(true); } }}
        onDelete={(ing) => { if (ing.activo) setInactivando(ing); else activarMut.mutate(ing.id); }}
        deleteLabel={(ing) => ing.activo ? "Inactivar" : "Activar"}
        deleteClassName={(ing) => ing.activo ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}
        rowClassName={(ing) => (!ing.activo ? "opacity-50" : "")} />
        <PaginationControls
          page={page}
          pageSize={PAGE_SIZE}
          total={data?.total ?? 0}
          onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
          onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        />
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? "Editar Ingrediente" : "Nuevo Ingrediente"}>
        <IngredienteForm initial={editing} onSubmit={handleSubmit}
          loading={createMut.isPending || updateMut.isPending} />
      </Modal>

      <ConfirmDialog isOpen={!!inactivando} onClose={() => setInactivando(null)}
        onConfirm={() => { if (inactivando) inactivarMut.mutate(inactivando.id, { onSuccess: () => setInactivando(null) }); }}
        title="Inactivar Ingrediente" message={`¿Inactivar "${inactivando?.nombre}"? Los productos que lo usan también se inactivarán.`}
        confirmLabel="Inactivar" loading={inactivarMut.isPending} />
    </div>
  );
}
