import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { RouthPath } from "@/routers/router";

export default function ErrorBoundaryPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "發生錯誤";

  return (
    <section className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 text-white text-center px-4">
      <h1 className="text-4xl font-bold">糟糕，發生錯誤了</h1>
      <p className="text-slate-400">{message}</p>
      <Link
        to={RouthPath.home}
        className="mt-4 py-3 px-7 rounded-md bg-primary text-white"
      >
        返回首頁
      </Link>
    </section>
  );
}
