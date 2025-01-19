import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import axios from "axios";

const localizer = momentLocalizer(moment);

const CalendarView = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        axios.get("/api/grow-tasks/schedule")
            .then(response => {
                const formattedEvents = response.data.map(task => ({
                    title: task.name,
                    start: new Date(task.startDate),
                    end: new Date(task.endDate),
                }));
                setEvents(formattedEvents);
            })
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <h1>Calendar View</h1>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
            />
        </div>
    );
};

export default CalendarView;
