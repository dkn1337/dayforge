export default function DashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-20 max-w-lg rounded-2xl bg-white/[0.045]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => <div className="h-36 rounded-[18px] bg-white/[0.04]" key={index} />)}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {[...Array(3)].map((_, index) => <div className="h-80 rounded-[18px] bg-white/[0.04]" key={index} />)}
      </div>
    </div>
  );
}
