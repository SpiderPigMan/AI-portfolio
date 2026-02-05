export default function AnalizadorLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      <header className="max-w-3xl space-y-4">
        <div className="h-12 w-80 skeleton-pulse" />
        <div className="h-4 w-full skeleton-pulse" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card h-[450px] skeleton-pulse opacity-50" />
        <div className="glass-card h-[450px] skeleton-pulse opacity-30" />
      </div>
    </div>
  );
}