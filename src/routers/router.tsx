import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { getMovieDetails } from "@/api/movie";
import MainLayout from "@/layouts/MainLayout";
import ErrorBoundaryPage from "@/components/ErrorBoundaryPage";
import { getPersonDetails } from "@/api/person";

/* eslint-disable react-refresh/only-export-components -- route config file: lazy-loaded
   page components necessarily sit alongside the non-component RouthPath/router exports */
const Home = lazy(() => import("@/pages/Home"));
const MovieDetails = lazy(() => import("@/pages/MovieDetails"));
const Search = lazy(() => import("@/pages/Search"));
const PersonDetails = lazy(() => import("@/pages/PersonDetails"));
const Favorite = lazy(() => import("@/pages/Favorite"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export const RouthPath = {
  home: "/",
  favorite: "/favorite",
  search: "/search",
  details: "/movieDetails",
  person: "/person",
};

const router = createBrowserRouter([
  {
    path: RouthPath.home,
    element: <MainLayout />,
    errorElement: <ErrorBoundaryPage />,
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
        path: RouthPath.search,
        element: <Search />,
      },
      {
        path: RouthPath.details + "/:id",
        loader: async ({ params }) => {
          return await getMovieDetails(params.id as string);
        },
        element: <MovieDetails />,
      },
      {
        path: RouthPath.person + "/:id",
        loader: async ({ params }) => {
          return await getPersonDetails(Number(params.id));
        },
        element: <PersonDetails />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
