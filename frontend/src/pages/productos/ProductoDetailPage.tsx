import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, AlertTriangle } from "lucide-react";
import { useProducto } from "../../hooks/useProductos";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";

export default function ProductoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: producto, isLoading, isError, error, refetch } = useProducto(Number(id));

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;
  if (!producto) return <ErrorState message="Producto no encontrado" />;

  return (
    <div>
      <button onClick={() => navigate("/productos")}
        className="text-primary hover:text-primary-hover text-sm font-medium mb-4 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Volver a productos
      </button>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">{producto.nombre}</h1>
            <div className="flex items-center gap-2">
              {!producto.activo && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-500">Inactivo</span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                producto.disponible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {producto.disponible ? "Disponible" : "No disponible"}
              </span>
            </div>
          </div>
          {producto.descripcion && <p className="text-gray-500 mt-2">{producto.descripcion}</p>}
        </div>

        <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Precio base</h3>
            <p className="text-2xl font-bold text-gray-800">${Number(producto.precio_base).toFixed(2)}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Stock</h3>
            <p className={`text-2xl font-bold ${producto.stock_cantidad === 0 ? "text-red-500" : "text-gray-800"}`}>
              {producto.stock_cantidad}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">ID</h3>
            <p className="text-gray-700">#{producto.id}</p>
          </div>
        </div>

        {/* Categorías */}
        <div className="px-6 py-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Categorías</h3>
          {producto.categorias.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin categorías asignadas</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {producto.categorias.map((cat) => (
                <span key={cat.id}
                  className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                    cat.es_principal ? "bg-primary/10 text-primary border border-primary/30" : "bg-orange-50 text-orange-700"
                  }`}>
                  {cat.es_principal && <Star className="w-3 h-3 fill-current" />}
                  {cat.nombre}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Ingredientes */}
        <div className="px-6 py-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Ingredientes</h3>
          {producto.ingredientes.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin ingredientes asignados</p>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Ingrediente</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Cantidad</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Removible</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {producto.ingredientes.map((ing) => (
                    <tr key={ing.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-700">
                        <span className="inline-flex items-center gap-1.5">
                          {ing.nombre}
                          {ing.es_alergeno && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-600 font-medium">{ing.cantidad}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-xs font-medium ${ing.es_removible ? "text-green-600" : "text-gray-400"}`}>
                          {ing.es_removible ? "Sí" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
