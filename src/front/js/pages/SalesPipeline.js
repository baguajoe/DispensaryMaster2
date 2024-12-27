const SalesPipeline = () => {
    const [deals, setDeals] = useState({});

    useEffect(() => {
        fetch('/api/deals')
            .then(res => res.json())
            .then(setDeals);
    }, []);

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination } = result;
        const dealId = result.draggableId;

        fetch(`/api/deals/${dealId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stage: destination.droppableId }),
        }).then(() => {
            // Update local state
            const sourceDeals = [...deals[source.droppableId]];
            const [movedDeal] = sourceDeals.splice(source.index, 1);
            deals[destination.droppableId].splice(destination.index, 0, movedDeal);
            setDeals({ ...deals });
        });
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {Object.keys(deals).map(stage => (
                <Droppable droppableId={stage} key={stage}>
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                            <h3>{stage}</h3>
                            {deals[stage].map((deal, index) => (
                                <Draggable key={deal.id} draggableId={deal.id.toString()} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                            {deal.name}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            ))}
        </DragDropContext>
    );
};

export default SalesPipeline