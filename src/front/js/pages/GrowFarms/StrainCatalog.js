import React, { useState, useEffect } from "react";

const StrainCatalog = () => {
  const [strains, setStrains] = useState([]);
  const [newStrain, setNewStrain] = useState({
    strainName: "",
    type: "Hybrid",
    thcPercent: "",
    cbdPercent: "",
    lineage: "",
    growNotes: "",
  });

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/strains`)
      .then(res => res.json())
      .then(data => setStrains(data))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/strains`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStrain),
    })
      .then(res => res.json())
      .then((data) => {
        setStrains([...strains, data]);
        setNewStrain({
          strainName: "",
          type: "Hybrid",
          thcPercent: "",
          cbdPercent: "",
          lineage: "",
          growNotes: "",
        });
      })
      .catch(err => console.error("POST error:", err));
  };

  return (
    <div>
      <h2>Strain Catalog</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Strain Name"
          value={newStrain.strainName}
          onChange={(e) => setNewStrain({ ...newStrain, strainName: e.target.value })}
        />
        <select
          value={newStrain.type}
          onChange={(e) => setNewStrain({ ...newStrain, type: e.target.value })}
        >
          <option value="Indica">Indica</option>
          <option value="Sativa">Sativa</option>
          <option value="Hybrid">Hybrid</option>
        </select>
        <input
          type="number"
          placeholder="THC %"
          value={newStrain.thcPercent}
          onChange={(e) => setNewStrain({ ...newStrain, thcPercent: e.target.value })}
        />
        <input
          type="number"
          placeholder="CBD %"
          value={newStrain.cbdPercent}
          onChange={(e) => setNewStrain({ ...newStrain, cbdPercent: e.target.value })}
        />
        <input
          type="text"
          placeholder="Lineage"
          value={newStrain.lineage}
          onChange={(e) => setNewStrain({ ...newStrain, lineage: e.target.value })}
        />
        <textarea
          placeholder="Grow Notes"
          value={newStrain.growNotes}
          onChange={(e) => setNewStrain({ ...newStrain, growNotes: e.target.value })}
        />
        <button type="submit">Add Strain</button>
      </form>

      <ul>
        {strains.map((strain, index) => (
          <li key={index}>
            {strain.strainName} ({strain.type}) – THC: {strain.thcPercent}%
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StrainCatalog;
