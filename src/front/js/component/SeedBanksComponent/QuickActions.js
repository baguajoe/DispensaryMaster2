import React from "react";
import PropTypes from "prop-types";

const QuickActions = ({ onRestock, onRecall }) => {
  return (
    <div>
      <h3>Quick Actions</h3>
      <button onClick={onRestock}>Restock</button>
      <button onClick={onRecall}>Recall Batch</button>
    </div>
  );
};

QuickActions.propTypes = {
  onRestock: PropTypes.func.isRequired,
  onRecall: PropTypes.func.isRequired,
};

export default QuickActions;
