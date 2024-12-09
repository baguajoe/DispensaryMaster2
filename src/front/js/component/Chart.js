import React from "react";
import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";

const Chart = ({ type, data }) => {
  if (type === "line") {
    return <Line data={data} options={{ responsive: true }} />;
  }
  return <p>Unsupported chart type</p>;
};

Chart.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
};

export default Chart;
