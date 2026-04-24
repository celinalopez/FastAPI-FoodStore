import {
  UtensilsCrossed,
  FolderOpen,
  Leaf,
  Plus,
  List,
  Package,
} from "lucide-react";
import { useCategorias } from "../../hooks/useCategorias";
import { useIngredientes } from "../../hooks/useIngredientes";
import { useProductos } from "../../hooks/useProductos";

export default function DashboardPage() {
  const { data: cats } = useCategorias();
  const { data: ings } = useIngredientes();
  const { data: prods } = useProductos();

  const stats = [
    {
      label: "Productos",
      value: prods?.total ?? 0,
      icon: UtensilsCrossed,
      color: "bg-orange-50 text-orange-700 border-orange-200",
      iconColor: "text-orange-500",
    },
    {
      label: "Categorías",
      value: cats?.total ?? 0,
      icon: FolderOpen,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      iconColor: "text-blue-500",
    },
    {
      label: "Ingredientes",
      value: ings?.total ?? 0,
      icon: Leaf,
      color: "bg-green-50 text-green-700 border-green-200",
      iconColor: "text-green-500",
    },
  ];

  const shortcuts = [
    { label: "Nuevo Producto", href: "/productos", icon: Plus },
    { label: "Ver Categorías", href: "/categorias", icon: List },
    { label: "Ver Ingredientes", href: "/ingredientes", icon: Leaf },
    { label: "Ver Productos", href: "/productos", icon: Package },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen general del catálogo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`rounded-xl border p-5 ${s.color} transition-transform hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${s.iconColor}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Últimos productos
          </h2>
          {prods && prods.items.length > 0 ? (
            <ul className="space-y-3">
              {prods.items.slice(0, 5).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.nombre}</p>
                    <p className="text-xs text-gray-400">
                      {p.disponible ? "Disponible" : "No disponible"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    ${Number(p.precio_base).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No hay productos aún</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Accesos rápidos
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {shortcuts.map((a) => {
              const Icon = a.icon;
              return (
                <a
                  key={a.label}
                  href={a.href}
                  className="flex items-center gap-2 rounded-lg border border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-400" /> {a.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
