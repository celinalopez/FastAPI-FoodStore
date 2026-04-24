import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import DashboardPage from "../pages/dashboard/DashboardPage";
import CategoriasPage from "../pages/categorias/CategoriasPage";
import IngredientesPage from "../pages/ingredientes/IngredientesPage";
import ProductosPage from "../pages/productos/ProductosPage";
import ProductoDetailPage from "../pages/productos/ProductoDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "categorias", element: <CategoriasPage /> },
      { path: "ingredientes", element: <IngredientesPage /> },
      { path: "productos", element: <ProductosPage /> },
      { path: "productos/:id", element: <ProductoDetailPage /> },
    ],
  },
]);
