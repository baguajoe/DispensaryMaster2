import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "../../styles/salespipeline.css";

const SalesPipeline = () => {
  const [deals, setDeals] = useState({});

  // Fetch deals on component mount
  useEffect(() => {
    fetch("/api/deals")
      .then((res) => res.json())
      .then(setDeals)
      .catch((error) => console.error("Error fetching deals:", error));
  }, []);

  // Handle drag and drop
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const dealId = result.draggableId;

    // Update deal stage in the backend
    fetch(`/api/deals/${dealId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: destination.droppableId }),
    })
      .then(() => {
        // Update local state
        const sourceDeals = [...deals[source.droppableId]];
        const [movedDeal] = sourceDeals.splice(source.index, 1);
        const destinationDeals = [...deals[destination.droppableId]];
        destinationDeals.splice(destination.index, 0, movedDeal);

        setDeals({
          ...deals,
          [source.droppableId]: sourceDeals,
          [destination.droppableId]: destinationDeals,
        });
      })
      .catch((error) => console.error("Error updating deal stage:", error));
  };

  return (
    <div className="sales-pipeline main-content">
      <h1 className="pipeline-title">Sales Pipeline</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.keys(deals).map((stage) => (
          <Droppable droppableId={stage} key={stage}>
            {(provided) => (
              <div
                ref={(node) => provided.innerRef(node)}
                {...provided.droppableProps}
                className="pipeline-stage"
              >
                <h3 className="stage-title">{stage}</h3>
                <div className="deals-list">
                  {deals[stage].map((deal, index) => (
                    <Draggable
                      key={deal.id}
                      draggableId={deal.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={(node) => provided.innerRef(node)}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="deal-item"
                        >
                          <p>{deal.name}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </div>
  );
};

export default SalesPipeline;
