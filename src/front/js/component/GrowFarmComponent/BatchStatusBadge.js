import React from 'react';
import PropTypes from 'prop-types';

const BatchStatusBadge = ({ status }) => {
  const getBadgeColor = (status) => {
    switch (status) {
      case 'Growing':
        return 'green';
      case 'Harvested':
        return 'orange';
      case 'Completed':
        return 'gray';
      default:
        return 'blue';
    }
  };

  return (
    <span
      style={{
        padding: '5px 10px',
        borderRadius: '5px',
        color: 'white',
        backgroundColor: getBadgeColor(status),
      }}
    >
      {status}
    </span>
  );
};

BatchStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

export default BatchStatusBadge;
