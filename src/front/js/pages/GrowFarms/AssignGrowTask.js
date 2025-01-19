import React, { useState, useEffect } from "react";
import axios from "axios";

const AssignGrowTask = () => {
    const [tasks, setTasks] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [selectedTask, setSelectedTask] = useState("");
    const [selectedWorker, setSelectedWorker] = useState("");

    useEffect(() => {
        axios.get("/api/grow-tasks")
            .then(response => setTasks(response.data))
            .catch(error => console.error(error));
        
        axios.get("/api/workers")
            .then(response => setWorkers(response.data))
            .catch(error => console.error(error));
    }, []);

    const handleAssign = () => {
        axios.post(`/api/grow-tasks/assign`, {
            taskId: selectedTask,
            workerId: selectedWorker
        })
        .then(response => alert("Task assigned successfully!"))
        .catch(error => console.error(error));
    };

    return (
        <div>
            <h1>Assign Grow Task</h1>
            <div>
                <label>Select Task:</label>
                <select onChange={(e) => setSelectedTask(e.target.value)}>
                    <option value="">-- Select Task --</option>
                    {tasks.map(task => (
                        <option key={task.id} value={task.id}>{task.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Select Worker:</label>
                <select onChange={(e) => setSelectedWorker(e.target.value)}>
                    <option value="">-- Select Worker --</option>
                    {workers.map(worker => (
                        <option key={worker.id} value={worker.id}>{worker.name}</option>
                    ))}
                </select>
            </div>
            <button onClick={handleAssign}>Assign Task</button>
        </div>
    );
};

export default AssignGrowTask;
