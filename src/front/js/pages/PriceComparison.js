import React, { useState, useEffect } from "react";

const PriceComparison = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [strainFilter, setStrainFilter] = useState("All");
    const [sortBy, setSortBy] = useState("price-asc");
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/products`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                setProducts(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const strains = ["All", "Sativa", "Indica", "Hybrid"];

    const filtered = products
        .filter(p => strainFilter === "All" || p.strain === strainFilter)
        .filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.strain || "").toLowerCase().includes(search.toLowerCase()) ||
            p.category.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "price-asc") return a.price - b.price;
            if (sortBy === "price-desc") return b.price - a.price;
            if (sortBy === "thc") return (b.thc_content || 0) - (a.thc_content || 0);
            if (sortBy === "name") return a.name.localeCompare(b.name);
            return 0;
        });

    const avgPrice = filtered.length
        ? (filtered.reduce((s, p) => s + parseFloat(p.price), 0) / filtered.length).toFixed(2)
        : "0.00";
    const minPrice = filtered.length
        ? Math.min(...filtered.map(p => parseFloat(p.price))).toFixed(2)
        : "0.00";
    const maxPrice = filtered.length
        ? Math.max(...filtered.map(p => parseFloat(p.price))).toFixed(2)
        : "0.00";

    if (loading) return (
        <div className="main-content d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <div className="spinner-border text-success" />
        </div>
    );

    return (
        <div className="main-content p-4">
            <h1 className="h3 mb-4">Price Comparison</h1>

            {/* Summary */}
            <div className="row g-3 mb-4">
                {[
                    { label: "Products Compared", value: filtered.length, icon: "🌿" },
                    { label: "Lowest Price", value: `$${minPrice}`, icon: "⬇️" },
                    { label: "Average Price", value: `$${avgPrice}`, icon: "📊" },
                    { label: "Highest Price", value: `$${maxPrice}`, icon: "⬆️" },
                ].map((s, i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className="card text-center">
                            <div className="card-body py-3">
                                <div style={{ fontSize: "1.5rem" }}>{s.icon}</div>
                                <h5 className="mb-0">{s.value}</h5>
                                <small className="text-muted">{s.label}</small>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="row g-2 mb-3">
                <div className="col-md-4">
                    <input className="form-control" placeholder="Search by name, strain, category..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="col-md-3">
                    <select className="form-select" value={strainFilter} onChange={e => setStrainFilter(e.target.value)}>
                        {strains.map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>
                <div className="col-md-3">
                    <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option value="price-asc">Price: Low → High</option>
                        <option value="price-desc">Price: High → Low</option>
                        <option value="thc">Highest THC</option>
                        <option value="name">Name A→Z</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Strain</th>
                                <th>THC %</th>
                                <th>CBD %</th>
                                <th>Price/Unit</th>
                                <th>Stock</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((p, i) => (
                                <tr key={p.id} className={i === 0 && sortBy === "price-asc" ? "table-success" : ""}>
                                    <td>
                                        <strong>{p.name}</strong>
                                        {i === 0 && sortBy === "price-asc" && (
                                            <span className="badge bg-success ms-2">Best Price</span>
                                        )}
                                    </td>
                                    <td>{p.category}</td>
                                    <td>
                                        {p.strain && (
                                            <span className={`badge ${
                                                p.strain === "Sativa" ? "bg-warning text-dark" :
                                                p.strain === "Indica" ? "bg-primary" : "bg-success"
                                            }`}>{p.strain}</span>
                                        )}
                                    </td>
                                    <td>{p.thc_content > 0 ? `${p.thc_content}%` : "-"}</td>
                                    <td>{p.cbd_content > 0 ? `${p.cbd_content}%` : "-"}</td>
                                    <td><strong>${parseFloat(p.price).toFixed(2)}</strong></td>
                                    <td>
                                        <span className={`badge ${p.stock === 0 ? "bg-danger" : p.stock < 10 ? "bg-warning text-dark" : "bg-success"}`}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td>${(p.stock * parseFloat(p.price)).toFixed(2)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="8" className="text-center py-4 text-muted">No products found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PriceComparison;
