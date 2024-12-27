// pages/AddGrowTask.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddGrowTask = () => {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [plantBatchId, setPlantBatchId] = useState('');
  const [plantBatches, setPlantBatches] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all plant batches to populate the dropdown
    fetch('/api/plant_batches')
      .then((res) => res.json())
      .then((data) => setPlantBatches(data))
      .catch((err) => console.error('Error fetching plant batches:', err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare the task data
    const newTask = {
      task_name: taskName,
      task_description: taskDescription,
      assigned_to: assignedTo,
      priority,
      due_date: dueDate,
      plant_batch_id: plantBatchId,
    };

    // Submit the task to the backend
    fetch('/api/grow_tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    })
      .then((res) => {
        if (res.ok) {
          navigate('/grow-tasks'); // Redirect to the GrowTaskList page or another page
        } else {
          console.error('Error creating grow task:', res.statusText);
        }
      })
      .catch((err) => console.error('Error submitting grow task:', err));
  };

  return (
    <div className="add-grow-task">
      <h2>Add Grow Task</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="taskName">Task Name</label>
          <input
            type="text"
            id="taskName"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="taskDescription">Task Description</label>
          <textarea
            id="taskDescription"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="assignedTo">Assigned To</label>
          <input
            type="text"
            id="assignedTo"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="plantBatch">Plant Batch</label>
          <select
            id="plantBatch"
            value={plantBatchId}
            onChange={(e) => setPlantBatchId(e.target.value)}
            required
          >
            <option value="">Select a batch</option>
            {plantBatches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.strain} - Batch {batch.id}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Add Task
        </button>
      </form>
    </div>
  );
};

export default AddGrowTask;
