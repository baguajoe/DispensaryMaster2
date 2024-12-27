import React, { useEffect, useState } from "react";

const ResourceDetailPage = ({ match }) => {
  const [resource, setResource] = useState(null);

  useEffect(() => {
    const fetchResource = async () => {
      const response = await fetch(`/api/resources/${match.params.id}`);
      const data = await response.json();
      setResource(data);
    };
    fetchResource();
  }, [match.params.id]);

  return (
    <div>
      {resource ? (
        <>
          <h2>{resource.title}</h2>
          <p>{resource.content}</p>
          <a href={resource.link} target="_blank" rel="noopener noreferrer">
            Learn More
          </a>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ResourceDetailPage;
