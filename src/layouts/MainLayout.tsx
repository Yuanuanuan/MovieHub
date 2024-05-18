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
  };
}

export default function MainLayout() {
  const navState = useNavigation();
  const dispatch = useDispatch();
  const loading = useSelector((state: MainSelectorType) => state.main.loading);

  useEffect(() => {
    if (navState.state === "loading") {
      dispatch({ type: "ONLOAD" });
    } else if (navState.state === "idle") {
      dispatch({ type: "OUTLOAD" });
    }
  }, [dispatch, navState]);

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      {loading && <Loading />}
    </>
  );
}
