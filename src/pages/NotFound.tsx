import { Link } from "react-router-dom";
import { RouthPath } from "@/routers/router";

function NotFound() {
  return (
    <section className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 text-white text-center px-4">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-slate-400">Page not found</p>
      <Link
        to={RouthPath.home}
        className="mt-4 py-3 px-7 rounded-md bg-primary text-white"
      >
        Back to Home
      </Link>
    </section>
  );
}

export default NotFound;
