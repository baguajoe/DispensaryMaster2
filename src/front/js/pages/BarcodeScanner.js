import React, { useState, useRef } from "react";

const BarcodeScanner = () => {
    const [barcode, setBarcode] = useState("");
    const [product, setProduct] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const inputRef = useRef(null);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const lookupBarcode = async (code) => {
        if (!code.trim()) return;
        setLoading(true);
        setError("");
        setProduct(null);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/products?search=${code}`, { headers });
            if (r.ok) {
                const data = await r.json();
                const found = Array.isArray(data) ? data.find(p => p.sku === code || p.batch_number === code || String(p.id) === code) : null;
                if (found) {
                    setProduct(found);
                    setHistory(prev => [{ code, product:found, time:new Date().toLocaleTimeString() }, ...prev.slice(0,9)]);
                } else {
                    setError(`No product found for barcode: ${code}`);
                }
            }
        } catch(e) { setError("Lookup failed — check your connection"); }
        finally { setLoading(false); }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        lookupBarcode(barcode);
        setBarcode("");
        if (inputRef.current) inputRef.current.focus();
    };

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>📷 Barcode Scanner</h2><p>Scan or enter product barcode/SKU to look up inventory</p></div>
            <div className="row g-4">
                <div className="col-md-6">
                    <div className="glass-panel mb-4">
                        <h5 className="mb-3">Scan or Enter Barcode</h5>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group mb-3">
                                <span className="input-group-text" style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff8e1"}}>📷</span>
                                <input ref={inputRef} className="form-control" placeholder="Scan barcode or enter SKU/batch number..."
                                    value={barcode} onChange={e => setBarcode(e.target.value)}
                                    autoFocus />
                                <button className="btn btn-success" type="submit" disabled={loading}>
                                    {loading ? <span className="spinner-border spinner-border-sm" /> : "Lookup"}
                                </button>
                            </div>
                            <p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.85rem"}}>
                                Connect a USB barcode scanner and it will auto-submit when scanning. Or type the SKU or batch number manually.
                            </p>
                        </form>
                    </div>

                    {error && (
                        <div className="glass-panel mb-4" style={{borderColor:"rgba(245,54,92,0.4)"}}>
                            <p className="text-danger mb-0">❌ {error}</p>
                        </div>
                    )}

                    {product && (
                        <div className="glass-panel mb-4" style={{borderColor:"rgba(45,206,137,0.4)"}}>
                            <h5 className="text-success mb-3">✅ Product Found</h5>
                            <div className="row g-2">
                                {[
                                    { label:"Name", value:product.name },
                                    { label:"SKU", value:product.sku||"—" },
                                    { label:"Batch #", value:product.batch_number||"—" },
                                    { label:"Category", value:product.category },
                                    { label:"Strain", value:product.strain||"—" },
                                    { label:"THC", value:product.thc_content ? `${product.thc_content}%` : "—" },
                                    { label:"Price", value:`$${parseFloat(product.price||0).toFixed(2)}` },
                                    { label:"Stock", value:product.stock||product.current_stock||0 },
                                ].map((f,i) => (
                                    <div key={i} className="col-6">
                                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{f.label}</div>
                                        <div style={{fontWeight:600}}>{f.value}</div>
                                    </div>
                                ))}
                            </div>
                            {(product.stock||product.current_stock||0) === 0 && (
                                <div className="alert alert-danger mt-3 mb-0 py-2">⚠️ This product is out of stock</div>
                            )}
                            {(product.stock||product.current_stock||0) > 0 && (product.stock||product.current_stock||0) <= (product.reorder_point||0) && (
                                <div className="alert alert-warning mt-3 mb-0 py-2">⚠️ Low stock — below reorder point</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Scan History</h5>
                        {history.length === 0 ? (
                            <p className="text-center py-3" style={{color:"rgba(255,255,255,0.5)"}}>No scans yet</p>
                        ) : (
                            <table className="table mb-0">
                                <thead><tr><th>Time</th><th>Barcode</th><th>Product</th><th>Stock</th></tr></thead>
                                <tbody>
                                    {history.map((h,i) => (
                                        <tr key={i}>
                                            <td style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>{h.time}</td>
                                            <td style={{fontSize:"0.85rem"}}>{h.code}</td>
                                            <td>{h.product?.name}</td>
                                            <td><span className={`badge ${(h.product?.stock||0)===0?"bg-danger":(h.product?.stock||0)<10?"bg-warning text-dark":"bg-success"}`}>{h.product?.stock||0}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default BarcodeScanner;
