import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import { getMovieDetails } from "@/api/movie";
import MainLayout from "@/layouts/MainLayout";
import MovieDetails from "@/pages/MovieDetails";
import Search from "@/pages/Search";
import PersonDetails from "@/pages/PersonDetails";
import Favorite from "@/pages/Favorite";

export const RouthPath = {
  home: "/",
  favorite: "/favorite",
  login: "/login",
  search: "/search",
  details: "/movieDetails",
  person: "/person",
};

const router = createBrowserRouter([
  {
    path: RouthPath.home,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: RouthPath.favorite,
        element: <Favorite />,
      },
      {
        path: RouthPath.person + "/:id",
        element: <PersonDetails />,
      },
      {
        path: RouthPath.search,
        element: <Search />,
      },
    ],
  },
  {
    path: RouthPath.details + "/:id",
    loader: async ({ params }) => {
      return await getMovieDetails(params.id as string);
    },
    element: <MovieDetails />,
  },
  {
    path: RouthPath.login,
    element: <Login />,
  },
]);

export default router;
