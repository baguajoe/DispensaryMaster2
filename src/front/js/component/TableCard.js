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

  const handleSort = (col) => {
    const columnKey = keyMapping[col] || col.toLowerCase().replace(/\s/g, "_");
    let direction = "ascending";
    if (sortConfig?.key === columnKey && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key: columnKey, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "ascending" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-lg p-4">
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
          {sortedData.length > 0 ? (
            sortedData.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="border border-gray-300 px-4 py-2 text-gray-700"
                  >
                    {row[keyMapping[col] || col.toLowerCase().replace(/\s/g, "_")]} {/* Handle custom key mapping */}
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

