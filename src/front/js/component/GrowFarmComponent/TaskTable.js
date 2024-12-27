import React from "react";

const TaskTable = ({ tasks }) => {
  return (
    <table className="task-table">
      <thead>
        <tr>
          <th>Task</th>
          <th>Priority</th>
          <th>Due Date</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task, index) => (
          <tr key={index}>
            <td>{task.name}</td>
            <td>{task.priority}</td>
            <td>{new Date(task.dueDate).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TaskTable;
