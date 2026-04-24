import { useState, useEffect } from "react";
import type { Ingrediente, IngredienteCreate } from "../../types/ingrediente";

interface IngredienteFormProps {
  initial?: Ingrediente | null;
  onSubmit: (data: IngredienteCreate) => void;
  loading?: boolean;
}

export default function IngredienteForm({ initial, onSubmit, loading }: IngredienteFormProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [esAlergeno, setEsAlergeno] = useState(false);

  useEffect(() => {
    if (initial) {
      setNombre(initial.nombre);
      setDescripcion(initial.descripcion ?? "");
      setEsAlergeno(initial.es_alergeno);
    } else {
      setNombre("");
      setDescripcion("");
      setEsAlergeno(false);
    }
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nombre, descripcion: descripcion || null, es_alergeno: esAlergeno });
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
          placeholder="Nombre del ingrediente"
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
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={esAlergeno}
            onChange={(e) => setEsAlergeno(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 accent-primary"
          />
          <span className="text-sm font-medium text-gray-700">Es alérgeno</span>
        </label>
        <p className="text-xs text-gray-400 mt-1 ml-6">
          Marcar si este ingrediente puede causar alergias
        </p>
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
