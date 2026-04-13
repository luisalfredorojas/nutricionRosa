export default function KPIsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-7 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-64" />
        </div>
        <div className="h-9 bg-gray-200 rounded w-48" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between">
              <div>
                <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-32" />
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="h-5 bg-gray-200 rounded w-48 mb-4" />
            <div className="h-52 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
