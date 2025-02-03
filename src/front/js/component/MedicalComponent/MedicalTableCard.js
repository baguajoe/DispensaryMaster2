import React from "react";

const MedicalTableCard = ({ data, columns, keyMapping }) => {
  return (
    <div className="p-4 rounded shadow bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="border-b py-2 px-4 text-left">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="py-2 px-4 border-b">
                  {row[keyMapping[col]]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MedicalTableCard;
