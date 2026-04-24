import { useState, useEffect } from "react";
import type { Categoria, CategoriaCreate } from "../../types/categoria";

interface CategoriaFormProps {
  initial?: Categoria | null;
  categorias?: Categoria[];
  onSubmit: (data: CategoriaCreate) => void;
  loading?: boolean;
}

export default function CategoriaForm({ initial, categorias = [], onSubmit, loading }: CategoriaFormProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [parentId, setParentId] = useState<number | "">("");

  useEffect(() => {
    if (initial) {
      setNombre(initial.nombre);
      setDescripcion(initial.descripcion ?? "");
      setImagenUrl(initial.imagen_url ?? "");
      setParentId(initial.parent_id ?? "");
    } else {
      setNombre("");
      setDescripcion("");
      setImagenUrl("");
      setParentId("");
    }
  }, [initial]);

  const parentOptions = categorias.filter(
    (c) => c.activo && c.id !== initial?.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nombre,
      descripcion: descripcion || null,
      imagen_url: imagenUrl || null,
      parent_id: parentId === "" ? null : Number(parentId),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          maxLength={100}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-colors"
          placeholder="Nombre de la categoría"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-colors resize-none"
          placeholder="Descripción opcional"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría padre</label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-colors"
        >
          <option value="">— Ninguna (raíz) —</option>
          {parentOptions.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URL de imagen</label>
        <input
          type="url"
          value={imagenUrl}
          onChange={(e) => setImagenUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-colors"
          placeholder="https://..."
        />
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading || !nombre.trim()}
          className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          {loading ? "Guardando..." : initial ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}
