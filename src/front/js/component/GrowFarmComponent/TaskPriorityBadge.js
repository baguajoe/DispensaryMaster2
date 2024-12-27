import React from "react";

const TaskPriorityBadge = ({ priority }) => {
  const colors = {
    High: "red",
    Medium: "orange",
    Low: "green",
  };

  return (
    <span
      className="task-priority-badge"
      style={{ backgroundColor: colors[priority] }}
    >
      {priority}
    </span>
  );
};

export default TaskPriorityBadge;
