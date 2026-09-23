function Loading() {
  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-[9999999] overflow-hidden bg-primary/15">
      <div className="h-full w-2/5 bg-primary rounded-full animate-loading-bar" />
    </div>
  );
}

export default Loading;
