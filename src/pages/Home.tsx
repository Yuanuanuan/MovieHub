import { useSearchParams } from "react-router-dom";
import GenreChipRow from "@/components/GenreChipRow";
import GenreResults from "@/components/GenreResults";
import HomeRows from "@/layouts/HomeRows";
import Hero from "@/components/Hero";

const Home = () => {
  const [searchParams] = useSearchParams();
  const genreId = Number(searchParams.get("genre")) || null;

  return (
    <main>
      <Hero />
      <GenreChipRow />
      {genreId ? <GenreResults genreId={genreId} /> : <HomeRows />}
    </main>
  );
};

export default Home;
