function Logo() {
  return (
    <h1 className="flex items-center gap-2">
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        className="fill-primary"
      >
        <path d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm2 2v2h2V6H6zm0 4v2h2v-2H6zm0 4v2h2v-2H6zm10-8v2h2V6h-2zm0 4v2h2v-2h-2zm0 4v2h2v-2h-2z" />
      </svg>
      <span className="text-2xl text-primary tracking-wider font-bebas font-black">
        MovieHub
      </span>
    </h1>
  );
}

export default Logo;
