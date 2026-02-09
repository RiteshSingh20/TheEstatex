// This is a helper component for the Special Package section
// Replace the isSpecial section in renderPlanCard with this code:

{isSpecial ? (
  <div className="space-y-4">
    {specialPackages.length === 0 ? (
      <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500 text-center">
        No custom packages available right now.
      </div>
    ) : (
      <>
        <div className="grid grid-cols-1 gap-3">
          {specialPackages.map((pkg) => {
            const isActive = pkg.id === selectedSpecialPackageId;
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedSpecialPackageId(pkg.id)}
                className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
                  isActive
                    ? "border-[#193867] bg-[#19386710]"
                    : "border-gray-200 bg-white hover:border-[#193867]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-base font-bold text-gray-900">
                      {pkg.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Created {formatPackageDate(pkg.createdAt)}
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    pkg.category === "resaleRental"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {getPackageCategoryLabel(pkg.category)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {selectedSpecialPackage && (
          <div className="border-2 border-[#193867] rounded-lg overflow-hidden mt-6">
            <div className="px-6 py-3 bg-[#193867] text-white font-semibold">
              Package Details
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Package Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stations</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actual</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Offer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {selectedSpecialPackage.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getPackageCategoryLabel(selectedSpecialPackage.category)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {selectedSpecialPackage.stations.length}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                      ₹{selectedSpecialPackage.actual.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#193867] text-right">
                      ₹{selectedSpecialPackage.offer.toLocaleString()}
                    </td>
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
      </>
    )}
  </div>
) : isEnterprise ? (
