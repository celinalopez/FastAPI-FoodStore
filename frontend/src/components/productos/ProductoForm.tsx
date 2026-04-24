import { useState, useEffect } from "react";
import { X, Plus, Search, AlertTriangle, Star } from "lucide-react";
import type { ProductoDetail, ProductoCreate, CategoriaInput, IngredienteInput } from "../../types/producto";
import type { Categoria } from "../../types/categoria";
import type { Ingrediente } from "../../types/ingrediente";
import Modal from "../common/Modal";

interface SelectedCategoria extends CategoriaInput {
  nombre: string;
}

interface SelectedIngrediente extends IngredienteInput {
  nombre: string;
  es_alergeno: boolean;
}

interface ProductoFormProps {
  initial?: ProductoDetail | null;
  categorias: Categoria[];
  ingredientes: Ingrediente[];
  onSubmit: (data: ProductoCreate) => void;
  loading?: boolean;
}

export default function ProductoForm({
  initial,
  categorias,
  ingredientes,
  onSubmit,
  loading,
}: ProductoFormProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precioBase, setPrecioBase] = useState("");
  const [stockCantidad, setStockCantidad] = useState("0");
  const [disponible, setDisponible] = useState(true);
  const [selectedCats, setSelectedCats] = useState<SelectedCategoria[]>([]);
  const [selectedIngs, setSelectedIngs] = useState<SelectedIngrediente[]>([]);
  const [ingModalOpen, setIngModalOpen] = useState(false);
  const [ingSearch, setIngSearch] = useState("");

  useEffect(() => {
    if (initial) {
      setNombre(initial.nombre);
      setDescripcion(initial.descripcion ?? "");
      setPrecioBase(String(initial.precio_base));
      setStockCantidad(String(initial.stock_cantidad));
      setDisponible(initial.disponible);
      setSelectedCats(
        initial.categorias.map((c) => ({
          categoria_id: c.id,
          es_principal: c.es_principal,
          nombre: c.nombre,
        }))
      );
      setSelectedIngs(
        initial.ingredientes.map((i) => ({
          ingrediente_id: i.id,
          cantidad: i.cantidad,
          es_removible: i.es_removible,
          nombre: i.nombre,
          es_alergeno: i.es_alergeno,
        }))
      );
    } else {
      setNombre(""); setDescripcion(""); setPrecioBase(""); setStockCantidad("0");
      setDisponible(true); setSelectedCats([]); setSelectedIngs([]);
    }
  }, [initial]);

  // --- Categorías ---
  const toggleCategoria = (cat: Categoria) => {
    setSelectedCats((prev) => {
      const exists = prev.find((s) => s.categoria_id === cat.id);
      if (exists) return prev.filter((s) => s.categoria_id !== cat.id);
      return [...prev, { categoria_id: cat.id, es_principal: prev.length === 0, nombre: cat.nombre }];
    });
  };

  const togglePrincipal = (catId: number) => {
    setSelectedCats((prev) =>
      prev.map((s) => ({ ...s, es_principal: s.categoria_id === catId }))
    );
  };

  // --- Ingredientes ---
  const addIngrediente = (ing: Ingrediente) => {
    if (!selectedIngs.find((s) => s.ingrediente_id === ing.id)) {
      setSelectedIngs((prev) => [
        ...prev,
        { ingrediente_id: ing.id, cantidad: 1, es_removible: false, nombre: ing.nombre, es_alergeno: ing.es_alergeno },
      ]);
    }
  };

  const removeIngrediente = (id: number) => {
    setSelectedIngs((prev) => prev.filter((s) => s.ingrediente_id !== id));
  };

  const updateIng = (id: number, field: "cantidad" | "es_removible", value: number | boolean) => {
    setSelectedIngs((prev) =>
      prev.map((s) => (s.ingrediente_id === id ? { ...s, [field]: value } : s))
    );
  };

  const filteredIngs = ingredientes.filter(
    (ing) =>
      ing.nombre.toLowerCase().includes(ingSearch.toLowerCase()) &&
      !selectedIngs.find((s) => s.ingrediente_id === ing.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nombre,
      descripcion: descripcion || null,
      precio_base: parseFloat(precioBase),
      stock_cantidad: parseInt(stockCantidad) || 0,
      disponible,
      categorias: selectedCats.map(({ categoria_id, es_principal }) => ({ categoria_id, es_principal })),
      ingredientes: selectedIngs.map(({ ingrediente_id, cantidad, es_removible }) => ({ ingrediente_id, cantidad, es_removible })),
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={150}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-colors" />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-colors resize-none" />
        </div>

        {/* Precio + Stock + Disponible */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio base <span className="text-red-500">*</span>
            </label>
            <input type="number" value={precioBase} onChange={(e) => setPrecioBase(e.target.value)} required min={0} step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input type="number" value={stockCantidad} onChange={(e) => setStockCantidad(e.target.value)} min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-colors" />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={disponible} onChange={(e) => setDisponible(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-primary" />
              <span className="text-sm font-medium text-gray-700">Disponible</span>
            </label>
          </div>
        </div>

        {/* Categorías con es_principal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categorías <span className="text-red-500">*</span></label>
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 border border-gray-200 rounded-lg">
            {categorias.length === 0 ? (
              <span className="text-gray-400 text-sm">No hay categorías creadas</span>
            ) : (
              categorias.map((cat) => {
                const sel = selectedCats.find((s) => s.categoria_id === cat.id);
                return (
                  <button key={cat.id} type="button" onClick={() => toggleCategoria(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors inline-flex items-center gap-1 ${
                      sel ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    {sel?.es_principal && <Star className="w-3 h-3 fill-current" />}
                    {cat.nombre}
                  </button>
                );
              })
            )}
          </div>
          {selectedCats.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="text-xs text-gray-400 mr-1">Principal:</span>
              {selectedCats.map((sc) => (
                <button key={sc.categoria_id} type="button" onClick={() => togglePrincipal(sc.categoria_id)}
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    sc.es_principal ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {sc.nombre}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ingredientes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Ingredientes</label>
            <button type="button" onClick={() => { setIngSearch(""); setIngModalOpen(true); }}
              className="text-xs font-medium text-primary hover:text-primary-hover transition-colors">
              + Agregar ingrediente
            </button>
          </div>

          {selectedIngs.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-lg px-4 py-6 text-center">
              <p className="text-gray-400 text-sm">No hay ingredientes seleccionados</p>
              <button type="button" onClick={() => { setIngSearch(""); setIngModalOpen(true); }}
                className="mt-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors">
                Seleccionar ingredientes
              </button>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Ingrediente</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase w-24">Cantidad</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase w-24 text-center">Removible</th>
                    <th className="px-3 py-2 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedIngs.map((si) => (
                    <tr key={si.ingrediente_id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-700">
                        <span className="inline-flex items-center gap-1.5">
                          {si.nombre}
                          {si.es_alergeno && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={si.cantidad}
                          onChange={(e) => updateIng(si.ingrediente_id, "cantidad", parseFloat(e.target.value) || 0)}
                          min={0} step="0.1"
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-primary/40 focus:border-primary outline-none" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input type="checkbox" checked={si.es_removible}
                          onChange={(e) => updateIng(si.ingrediente_id, "es_removible", e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 accent-primary" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button type="button" onClick={() => removeIngrediente(si.ingrediente_id)}
                          className="text-red-400 hover:text-red-600 transition-colors" title="Quitar">
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit"
            disabled={loading || !nombre.trim() || !precioBase || selectedCats.length === 0}
            className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors">
            {loading ? "Guardando..." : initial ? "Actualizar" : "Crear"}
          </button>
        </div>
      </form>

      {/* Modal de selección de ingredientes */}
      <Modal isOpen={ingModalOpen} onClose={() => setIngModalOpen(false)} title="Seleccionar Ingredientes">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={ingSearch} onChange={(e) => setIngSearch(e.target.value)}
              placeholder="Buscar ingrediente..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm" autoFocus />
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
            {filteredIngs.length === 0 ? (
              <p className="py-6 text-center text-gray-400 text-sm">
                {ingredientes.length === 0 ? "No hay ingredientes creados" : "No se encontraron ingredientes"}
              </p>
            ) : (
              filteredIngs.map((ing) => (
                <button key={ing.id} type="button" onClick={() => addIngrediente(ing)}
                  className="w-full flex items-center justify-between px-3 py-3 hover:bg-gray-50 transition-colors text-left">
                  <div>
                    <p className="text-sm font-medium text-gray-800 inline-flex items-center gap-1.5">
                      {ing.nombre}
                      {ing.es_alergeno && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                    </p>
                    {ing.descripcion && <p className="text-xs text-gray-400 mt-0.5">{ing.descripcion}</p>}
                  </div>
                  <Plus className="w-5 h-5 text-primary" />
                </button>
              ))
            )}
          </div>
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setIngModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
