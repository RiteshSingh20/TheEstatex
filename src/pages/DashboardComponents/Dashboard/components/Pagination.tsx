import React from "react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const getTotalPages = () => Math.ceil(totalItems / itemsPerPage);
  const totalPages = getTotalPages();

  return (
    <div className="border-t bg-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Showing{" "}
          <span className="font-medium">
            {(currentPage - 1) * itemsPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>{" "}
          of{" "}
          <span className="font-medium">{totalItems}</span>{" "}
          results
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (page) =>
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1
          )
          .map((page, index, array) => (
            <React.Fragment key={page}>
              {index > 0 && array[index - 1] !== page - 1 && (
                <span className="px-2 text-gray-400">...</span>
              )}
              <button
                className={`px-3 py-1 text-sm border rounded hover:bg-gray-50 ${
                  currentPage === page
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : ""
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            </React.Fragment>
          ))}
        <button
          className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;