import React, { useState, useEffect } from "react";
import TaskList from "../../component/GrowFarmComponent/TaskList";
import TaskForm from "../../component/GrowFarmComponent/TaskForm";
// import { fetchGrowTasks, addGrowTask, deleteGrowTask } from "../services/taskService";

const GrowTaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const data = await fetchGrowTasks();
    //             setTasks(data);
    //         } catch (error) {
    //             console.error("Error fetching grow tasks:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchData();
    // }, []);

    const handleAddTask = async (task) => {
        try {
            // const newTask = await addGrowTask(task);
            setTasks([...tasks, newTask]);
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            // await deleteGrowTask(taskId);
            setTasks(tasks.filter((task) => task.id !== taskId));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    return (
        <div>
            <h1>Grow Task List</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <TaskForm onAddTask={handleAddTask} />
                    <TaskList tasks={tasks} onDeleteTask={handleDeleteTask} />
                </>
            )}
        </div>
    );
};

export default GrowTaskList;
