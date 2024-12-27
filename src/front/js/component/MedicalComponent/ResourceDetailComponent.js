import React from "react";
import PropTypes from "prop-types";

const ResourceDetailComponent = ({ resource }) => {
  if (!resource) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h3>{resource.title}</h3>
      <p>{resource.content}</p>
      {resource.link && (
        <a href={resource.link} target="_blank" rel="noopener noreferrer">
          Learn More
        </a>
      )}
    </div>
  );
};

ResourceDetailComponent.propTypes = {
  resource: PropTypes.object.isRequired,
};

export default ResourceDetailComponent;
