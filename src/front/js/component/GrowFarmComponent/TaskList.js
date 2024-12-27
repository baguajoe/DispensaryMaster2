import React from "react";

const TaskList = ({ tasks }) => {
  return (
    <ul className="task-list">
      {tasks.map((task, index) => (
        <li key={index}>
          {task.name} - {task.priority} - {new Date(task.dueDate).toLocaleDateString()}
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
