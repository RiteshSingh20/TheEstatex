// This file contains the updated Special Package section
// Replace the isSpecial section in renderPlanCard with:

{isSpecial ? (
  <button
    type="button"
    onClick={() => setViewCustomizePackages(true)}
    className="w-full px-6 py-3 rounded-lg bg-[#193867] text-white font-semibold hover:bg-[#152b5f] transition-colors"
  >
    Get Customize Offer
  </button>
) : isEnterprise ? (

// And add this before the main return statement (after the loading check):

if (viewCustomizePackages) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#19386710] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => setViewCustomizePackages(false)}
          className="flex items-center text-[#193867] hover:text-[#152b5f] mb-6"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Plans
        </button>
        <h1 className="text-3xl font-bold text-[#193867] mb-8">Customize Packages</h1>
        
        {specialPackages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No customize packages available</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specialPackages.map((pkg) => {
                const isActive = pkg.id === selectedSpecialPackageId;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedSpecialPackageId(pkg.id)}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      isActive
                        ? "border-[#193867] bg-[#19386715] shadow-md"
                        : "border-gray-200 bg-white hover:border-[#193867]"
                    }`}
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <p className="text-xs text-gray-500 mb-3">Created {formatPackageDate(pkg.createdAt)}</p>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        pkg.category === "resaleRental"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {getPackageCategoryLabel(pkg.category)}
                      </span>
                      <span className="text-sm text-gray-600">{pkg.stations.length} stations</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedSpecialPackage && (
              <div className="border-2 border-[#193867] rounded-lg overflow-hidden mt-8">
                <div className="px-6 py-3 bg-[#193867] text-white font-semibold">Package Details</div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Package Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Stations</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actual</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Offer</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{selectedSpecialPackage.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{getPackageCategoryLabel(selectedSpecialPackage.category)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-center">{selectedSpecialPackage.stations.length}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">₹{selectedSpecialPackage.actual.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm font-bold text-[#193867] text-right">₹{selectedSpecialPackage.offer.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleSpecialPackagePurchase(selectedSpecialPackage)}
                    className="w-full px-6 py-3 rounded-lg bg-[#193867] text-white font-semibold hover:bg-[#152b5f] transition-colors"
                  >
                    Get Package
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
