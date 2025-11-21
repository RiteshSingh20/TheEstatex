import Button from "../ui/Button";

type RejectionModalProps = {
  isOpen: boolean;
  reason: string;
  setReason: (value: string) => void;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

const RejectionModal = ({
  isOpen,
  reason,
  setReason,
  loading,
  onCancel,
  onConfirm,
}: RejectionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-red-600">
            Reject Property
          </h3>
          <p className="text-sm text-neutral-600 mt-1">
            Please provide a reason for rejecting this property.
          </p>
        </div>

        <div className="p-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Rejection Reason *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter the reason for rejection..."
            className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            rows={4}
            required
          />
        </div>

        <div className="p-4 border-t border-neutral-200 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            isLoading={loading}
            disabled={!reason.trim()}
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Reject Property
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RejectionModal;
