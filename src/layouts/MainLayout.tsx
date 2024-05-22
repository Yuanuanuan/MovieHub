import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Loading from "@/components/Loading";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "react-router-dom";
import { useEffect } from "react";

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

  useEffect(() => {
    let timer = 0;
    if (requestCount > 0) {
      clearTimeout(timer);
      if (!timer) {
        dispatch({ type: "ONLOAD" });
      }
    } else {
      timer = setTimeout(() => {
        dispatch({ type: "OUTLOAD" });
      }, 0);
    }
  }, [dispatch, requestCount]);

  return (
    <>
      <Header />
      <div className="w-full min-h-[calc(100vh-64px)]">
        <Outlet />
      </div>
      <Footer />
      {loading && <Loading />}
    </>
  );
}
