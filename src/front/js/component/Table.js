import React from "react";


const Table = ({ data, columns }) => {
    return (
      <table className="w-full bg-white shadow rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="p-3 text-left">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-t">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  export default Table;
  