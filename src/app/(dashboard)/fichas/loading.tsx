export default function FichasLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-7 bg-rosa-100 rounded w-40 mb-2" />
          <div className="h-4 bg-rosa-50 rounded w-28" />
        </div>
        <div className="h-9 bg-rosa-100 rounded w-28" />
      </div>
      <div className="h-9 bg-white border border-rosa-200 rounded-lg" />
      <div className="bg-white rounded-xl border border-rosa-200 shadow-sm overflow-hidden">
        <div className="bg-rosa-50 px-4 py-3 flex gap-8 border-b border-rosa-200">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-3 bg-rosa-100 rounded w-16" />
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="px-4 py-3 border-b border-rosa-50 flex gap-8">
            <div className="h-4 bg-rosa-100 rounded w-32" />
            <div className="h-4 bg-rosa-50 rounded w-24" />
            <div className="h-4 bg-rosa-50 rounded w-20" />
            <div className="h-4 bg-rosa-50 rounded w-12" />
            <div className="h-5 bg-rosa-100 rounded-full w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
