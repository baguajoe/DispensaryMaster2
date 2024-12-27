import React from 'react';
import PropTypes from 'prop-types';

const BatchTimeline = ({ timeline }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
      {timeline.map((event, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: event.completed ? 'green' : 'gray',
              marginRight: '10px',
            }}
          ></span>
          <span>{event.label}</span>
        </div>
      ))}
    </div>
  );
};

BatchTimeline.propTypes = {
  timeline: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
    })
  ).isRequired,
};

export default BatchTimeline;
