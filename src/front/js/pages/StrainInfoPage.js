import React, { useState, useEffect } from "react";

const StrainInfoPage = () => {
  const [strainData, setStrainData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStrainInfo = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/strains`);
        setStrainData(await response.json());
      } catch (error) {
        console.error("Error fetching strain data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStrainInfo();
  }, []);

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Strain Information</h1>
      {loading ? (
        <p>Loading strains...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strainData.map((strain) => (
            <div key={strain.id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold">{strain.name}</h2>
              <p>Type: {strain.type}</p>
              <p>THC: {strain.thc}%</p>
              <p>CBD: {strain.cbd}%</p>
              <p>{strain.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StrainInfoPage;
