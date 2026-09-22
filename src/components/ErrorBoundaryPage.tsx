import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { RouthPath } from "@/routers/router";

export default function ErrorBoundaryPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Something went wrong";

  return (
    <section className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 text-white text-center px-4">
      <h1 className="text-4xl font-bold">Oops, something went wrong</h1>
      <p className="text-slate-400">{message}</p>
      <Link
        to={RouthPath.home}
        className="mt-4 py-3 px-7 rounded-md bg-primary text-white"
      >
        Back to Home
      </Link>
    </section>
  );
}
