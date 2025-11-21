type Props = {
  submitter: { fullName?: string; email?: string } | null;
};

const SubmitterInfo = ({ submitter }: Props) => {
  if (!submitter) return null;

  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
      <h4 className="text-md font-semibold text-blue-800 mb-2">Submitted by</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="text-sm">
          <div className="text-blue-600 font-medium">Full Name</div>
          <div className="text-blue-800">{submitter.fullName}</div>
        </div>
        <div className="text-sm">
          <div className="text-blue-600 font-medium">Email</div>
          <div className="text-blue-800">{submitter.email}</div>
        </div>
      </div>
    </div>
  );
};

export default SubmitterInfo;
