import searchIcon from "/search.svg";

const SearchBar = () => {
  return (
    <section className="w-[450px] h-[45px] bg-white rounded-[45px] flex items-center">
      <input
        className="flex flex-1 pl-4 bg-transparent border-none outline-none text-xl"
        type="text"
        placeholder="搜尋電影名稱..."
      />
      <img src={searchIcon} className="w-8 h-8 pr-2" alt="search icon" />
    </section>
  );
};

export default SearchBar;
