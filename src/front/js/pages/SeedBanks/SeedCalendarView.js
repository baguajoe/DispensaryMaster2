import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import axios from "axios";

const localizer = momentLocalizer(moment);

const SeedCalendarView = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        axios.get("/api/seed_batches/schedule")
            .then(response => {
                const formattedEvents = response.data.map(batch => ({
                    title: `${batch.strain} (Expires)`,
                    start: new Date(batch.expiration_date),
                    end: new Date(batch.expiration_date),
                }));
                setEvents(formattedEvents);
            })
            .catch(error => console.error("Error fetching seed batch schedules:", error));
    }, []);

    return (
        <div>
            <h1>SeedBank Calendar</h1>
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

export default SeedCalendarView;
