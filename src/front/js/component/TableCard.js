import React from "react";
import PropTypes from "prop-types";

// const TableCard = ({ data, columns }) => (
//   <div className="overflow-x-auto bg-white shadow-lg rounded-lg p-4">
//     <table className="table-auto w-full border-collapse border border-gray-200">
//       <thead>
//         <tr className="bg-gray-100">
//           {columns.map((col, index) => (
//             <th
//               key={index}
//               className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700"
//             >
//               {col}
//             </th>
//           ))}
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((row, rowIndex) => (
//           <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
//             {columns.map((col, colIndex) => (
//               <td
//                 key={colIndex}
//                 className="border border-gray-300 px-4 py-2 text-gray-700"
//               >
//                 {row[col.toLowerCase().replace(/\s/g, "_")]} {/* Handle key mapping */}
//               </td>
//             ))}
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// );

// TableCard.propTypes = {
//   data: PropTypes.arrayOf(PropTypes.object).isRequired,
//   columns: PropTypes.arrayOf(PropTypes.string).isRequired,
// };

// export default TableCard;



const TableCard = ({ data, columns, keyMapping }) => {
  const [sortConfig, setSortConfig] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // Number of rows per page

  // Handle sorting
  const handleSort = (col) => {
    const columnKey = keyMapping[col] || col.toLowerCase().replace(/\s/g, "_");
    let direction = "ascending";
    if (sortConfig?.key === columnKey && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key: columnKey, direction });
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filteredData = data;

    // Apply search filter
    if (searchQuery) {
      filteredData = data.filter((row) =>
        columns.some((col) => {
          const value = row[keyMapping[col] || col.toLowerCase().replace(/\s/g, "_")] || "";
          return value.toString().toLowerCase().includes(searchQuery.toLowerCase());
        })
      );
    }

    // Apply sorting
    if (sortConfig) {
      filteredData = filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "ascending" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return filteredData;
  }, [data, columns, keyMapping, sortConfig, searchQuery]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);

  // Export to CSV
  const exportToCSV = () => {
    const csvRows = [
      columns.join(","), // Header row
      ...filteredAndSortedData.map((row) =>
        columns
          .map((col) => `"${row[keyMapping[col] || col.toLowerCase().replace(/\s/g, "_")] || ""}"`)
          .join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "table_data.csv";
    link.click();
  };

  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-lg p-4">
      {/* Search and Export Section */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        />
        <button
          onClick={exportToCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Export to CSV
        </button>
      </div>

      {/* Table */}
      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((col, index) => (
              <th
                key={index}
                className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort(col)}
              >
                {col} {sortConfig?.key === (keyMapping[col] || col.toLowerCase().replace(/\s/g, "_")) && (sortConfig.direction === "ascending" ? "↑" : "↓")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="border border-gray-300 px-4 py-2 text-gray-700"
                  >
                    <span
                      dangerouslySetInnerHTML={{
                        __html: row[keyMapping[col] || col.toLowerCase().replace(/\s/g, "_")]
                          ?.toString()
                          .replace(
                            new RegExp(`(${searchQuery})`, "gi"),
                            `<mark class="bg-yellow-200">$1</mark>`
                          ) || "",
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="border border-gray-300 px-4 py-2 text-gray-700 text-center"
              >
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${currentPage === 1 && "opacity-50 cursor-not-allowed"}`}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <p className="text-gray-700">
          Page {currentPage} of {totalPages}
        </p>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${currentPage === totalPages && "opacity-50 cursor-not-allowed"}`}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

TableCard.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  keyMapping: PropTypes.object, // Custom mapping for column keys
};

TableCard.defaultProps = {
  keyMapping: {},
};

export default TableCard;

