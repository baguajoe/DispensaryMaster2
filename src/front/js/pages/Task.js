import React, { useState, useEffect } from "react";
import "../../styles/task.css";

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "",
    status: "pending",
  });

  // Fetch tasks on component mount
  useEffect(() => {
    fetch(process.env.BACKEND_URL + "/api/tasks", {
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") },
    })
      .then((response) => response.json())
      .then((data) => setTasks(data))
      .catch((error) => console.error("Error fetching tasks:", error));
  }, []);

  const handleAddTask = async () => {
    const response = await fetch(process.env.BACKEND_URL + "/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(newTask),
    });

    if (response.ok) {
      const addedTask = await response.json();
      setTasks([...tasks, addedTask]);
      setNewTask({ title: "", description: "", due_date: "", status: "pending" });
    } else {
      alert("Failed to add task.");
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    const response = await fetch(`${process.env.BACKEND_URL}/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)));
    } else {
      alert("Failed to update task.");
    }
  };

  return (
    <div className="p-6 main-content">
      <h1 className="text-2xl font-bold mb-4">Task Management</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className="p-2 border rounded mr-2"
        />
        <input
          type="text"
          placeholder="Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          className="p-2 border rounded mr-2"
        />
        <input
          type="date"
          placeholder="Due Date"
          value={newTask.due_date}
          onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
          className="p-2 border rounded mr-2"
        />
        <button onClick={handleAddTask} className="bg-green-500 text-white px-4 py-2 rounded">
          Add Task
        </button>
      </div>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Due Date</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-t">
              <td className="px-4 py-2">{task.title}</td>
              <td className="px-4 py-2">{task.description}</td>
              <td className="px-4 py-2">{task.due_date}</td>
              <td className="px-4 py-2">{task.status}</td>
              <td className="px-4 py-2">
                {task.status !== "completed" && (
                  <button
                    onClick={() => handleTaskStatusUpdate(task.id, "completed")}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Mark as Completed
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskManagement;
