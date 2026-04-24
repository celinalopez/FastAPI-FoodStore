import React from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  padToPageSize?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  deleteLabel?: (item: T) => string;
  deleteClassName?: (item: T) => string;
  rowClassName?: (item: T) => string;
}

export default function DataTable<T extends { id: number }>({
  columns,
  data,
  pageSize = 20,
  padToPageSize = false,
  onEdit,
  onDelete,
  onView,
  deleteLabel,
  deleteClassName,
  rowClassName,
}: DataTableProps<T>) {
  const actionColumns = onEdit || onDelete || onView;
  const placeholderRows = padToPageSize ? Math.max(pageSize - data.length, 0) : 0;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
             {actionColumns && (
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((item) => (
            <tr
              key={item.id}
              className={`hover:bg-gray-50 transition-colors ${rowClassName?.(item) ?? ""}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-sm text-gray-700">
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
              {actionColumns && (
                <td className="px-6 py-4 text-right space-x-2">
                  {onView && (
                    <button
                      onClick={() => onView(item)}
                      className="text-primary hover:text-primary-hover text-sm font-medium"
                    >
                      Ver
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      className="text-amber-600 hover:text-amber-800 text-sm font-medium"
                    >
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item)}
                      className={`text-sm font-medium ${
                        deleteClassName?.(item) ?? "text-red-600 hover:text-red-800"
                      }`}
                    >
                      {deleteLabel?.(item) ?? "Eliminar"}
                    </button>
                  )}
                </td>
              )}
            </tr>
         ))}

          {Array.from({ length: placeholderRows }).map((_, index) => (
            <tr key={`placeholder-${index}`} className="bg-white">
              {data.length === 0 && index === 0 ? (
                <td
                  colSpan={columns.length + (actionColumns ? 1 : 0)}
                  className="px-6 py-4 text-sm text-gray-400 text-center"
                >
                  No hay registros
                </td>
              ) : (
                <>
                  {columns.map((col) => (
                    <td key={`${col.key}-placeholder-${index}`} className="px-6 py-4 text-sm text-gray-200">
                      —
                    </td>
                  ))}
                  {actionColumns && <td className="px-6 py-4" />}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
