import React, { useState } from "react";

const TaskForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    taskName: "",
    priority: "Medium",
    dueDate: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        type="text"
        name="taskName"
        placeholder="Task Name"
        onChange={handleChange}
      />
      <select name="priority" onChange={handleChange}>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
      <input
        type="date"
        name="dueDate"
        onChange={handleChange}
      />
      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskForm;
