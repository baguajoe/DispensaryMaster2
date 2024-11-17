import React from 'react';
import { Bar } from 'react-chartjs-2';

const SalesGraph = ({ salesData }) => {
  const data = {
    labels: Object.keys(salesData.sales_by_date),
    datasets: [
      {
        label: 'Daily Sales ($)',
        data: Object.values(salesData.sales_by_date),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return <Bar data={data} />;
};

export default SalesGraph;
