import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import MovieDetails from "@/pages/MovieDetails";
import { getMovieDetails } from "@/api/service";
import MainLayout from "@/layouts/MainLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/movieDetails/:id",
        loader: async ({ params }) => {
          return await getMovieDetails(params.id as string);
        },
        element: <MovieDetails />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

export default router;
