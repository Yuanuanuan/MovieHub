import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Loading from "@/components/Loading";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "react-router-dom";
import { useEffect, useRef } from "react";

interface MainSelectorType {
  main: {
    loading: boolean;
    requestCount: number;
  };
}

export default function MainLayout() {
  const navState = useNavigation();
  const dispatch = useDispatch();
  const { loading, requestCount } = useSelector(
    (state: MainSelectorType) => state.main
  );

  useEffect(() => {
    if (navState.state === "loading") {
      dispatch({ type: "ONLOAD" });
    } else if (navState.state === "idle") {
      dispatch({ type: "OUTLOAD" });
    }
  }, [dispatch, navState]);

  const outloadTimer = useRef(0);

  useEffect(() => {
    if (requestCount > 0) {
      window.clearTimeout(outloadTimer.current);
      dispatch({ type: "ONLOAD" });
    } else {
      outloadTimer.current = window.setTimeout(() => {
        dispatch({ type: "OUTLOAD" });
      }, 0);
    }
    return () => window.clearTimeout(outloadTimer.current);
  }, [dispatch, requestCount]);

  return (
    <>
      <Header />
      <div className="w-full min-h-[calc(100vh-64px)] px-16">
        <Outlet />
      </div>
      <Footer />
      {loading && <Loading />}
    </>
  );
}
