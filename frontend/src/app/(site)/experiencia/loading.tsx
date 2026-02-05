export default function ExperienceLoading() {
  return (
    <div className="space-y-12 animate-pulse">
      <header className="max-w-2xl space-y-4">
        <div className="h-10 w-64 skeleton-pulse" />
        <div className="h-4 w-full skeleton-pulse" />
        <div className="h-4 w-3/4 skeleton-pulse" />
      </header>

      <div className="bento-grid">
        {/* Simulamos 4 tarjetas con los mismos spans que el diseño real */}
        <div className="bento-item md:col-span-2 h-64 skeleton-pulse" />
        <div className="bento-item md:col-span-1 h-64 skeleton-pulse" />
        <div className="bento-item md:col-span-1 h-64 skeleton-pulse" />
        <div className="bento-item md:col-span-2 h-64 skeleton-pulse" />
      </div>
    </div>
  );
}