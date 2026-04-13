export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 bg-rosa-100 rounded w-36 mb-2" />
          <div className="h-4 bg-rosa-50 rounded w-52" />
        </div>
        <div className="h-9 bg-rosa-100 rounded w-28" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-rosa-200 p-5 shadow-sm">
            <div className="h-3 bg-rosa-100 rounded w-24 mb-3" />
            <div className="h-8 bg-rosa-100 rounded w-16" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-rosa-200 shadow-sm">
        <div className="px-5 py-4 border-b border-rosa-100">
          <div className="h-4 bg-rosa-100 rounded w-48" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="px-5 py-4 border-b border-rosa-50 flex justify-between">
            <div>
              <div className="h-4 bg-rosa-100 rounded w-32 mb-2" />
              <div className="h-3 bg-rosa-50 rounded w-20" />
            </div>
            <div className="h-6 bg-rosa-50 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
