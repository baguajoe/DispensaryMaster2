import React from 'react';

const RecentActivity = () => {
    const activities = [
        { date: '2025-02-01', type: 'Appointment', details: 'Consultation with Dr. Smith' },
        { date: '2025-01-30', type: 'Purchase', details: 'Purchased CBD oil, THC flower' },
        { date: '2025-01-28', type: 'Recommendation Update', details: 'Updated dosage for pain relief' }
    ];

    return (
        <div className="recent-activity-section">
            <h2>Recent Activity</h2>
            <ul>
                {activities.map((activity, index) => (
                    <li key={index}>
                        <strong>{activity.date}:</strong> {activity.type} - {activity.details}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecentActivity;
