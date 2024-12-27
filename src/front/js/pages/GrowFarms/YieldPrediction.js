import React, { useState, useEffect } from "react";
import PredictionChart from "../../component/GrowFarmComponent/PredictionChart";
import PredictionSummary from "../../component/GrowFarmComponent/PredictionSummary";
// import { fetchYieldPredictions, createYieldPrediction } from "../services/yieldPredictionService";

const YieldPrediction = () => {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // const data = await fetchYieldPredictions();
                // setPredictions(data);
            } catch (err) {
                console.error("Error fetching yield predictions:", err);
                setError("Failed to load predictions");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAddPrediction = async (newPrediction) => {
        try {
            // const addedPrediction = await createYieldPrediction(newPrediction);
            // setPredictions([...predictions, addedPrediction]);
        } catch (err) {
            console.error("Error adding prediction:", err);
            setError("Failed to add prediction");
        }
    };

    return (
        <div>
            <h1>Yield Predictions</h1>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : (
                <>
                    <PredictionSummary predictions={predictions} />
                    <PredictionChart predictions={predictions} />
                    <div>
                        <h3>Add a New Prediction</h3>
                        {/* You can integrate a form here to allow adding new predictions */}
                        <button
                            onClick={() =>
                                handleAddPrediction({
                                    plantBatchId: 1,
                                    predictedYield: Math.random() * 100, // Example value
                                    accuracy: Math.random() * 100, // Example value
                                })
                            }
                        >
                            Add Random Prediction
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default YieldPrediction;
