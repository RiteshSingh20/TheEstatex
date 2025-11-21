type Props = {
  details: Record<string, unknown>;
};

const PropertySourcingManagers = ({ details }: Props) => {
  const sourcingManagers = details.sourcingManagers as unknown;
  const smName = details.smName as string | undefined;
  const smContact = details.smContact as string | undefined;

  return (
    <div>
      <div className="text-neutral-500 font-medium mb-2">Sourcing Managers</div>
      {Array.isArray(sourcingManagers) && sourcingManagers.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                  #
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {(sourcingManagers as any[]).map((manager, index) => (
                <tr key={index} className="hover:bg-neutral-50">
                  <td className="px-3 py-2 text-sm font-medium text-neutral-900">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 text-sm text-neutral-800">
                    {manager?.name || "-"}
                  </td>
                  <td className="px-3 py-2 text-sm text-neutral-800">
                    {manager?.contact || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr className="hover:bg-neutral-50">
                <td className="px-3 py-2 text-sm text-neutral-800">
                  {String(smName ?? "-")}
                </td>
                <td className="px-3 py-2 text-sm text-neutral-800">
                  {String(smContact ?? "-")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PropertySourcingManagers;
