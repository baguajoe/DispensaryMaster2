import React, { useState, useEffect } from "react";
import EnvironmentChart from "../components/EnvironmentChart";
import EnvironmentDetails from "../components/EnvironmentDetails";
import EnvironmentOverview from "../components/EnvironmentOverview";
import { fetchEnvironmentData } from "../services/environmentService";

const EnvironmentData = () => {
    const [environmentData, setEnvironmentData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchEnvironmentData();
                setEnvironmentData(data);
            } catch (error) {
                console.error("Error fetching environment data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h1>Environment Data</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <EnvironmentOverview data={environmentData} />
                    <EnvironmentChart data={environmentData} />
                    <EnvironmentDetails data={environmentData} />
                </>
            )}
        </div>
    );
};

export default EnvironmentData;
