import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const StripeCheckout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { order_id, amount } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [publishableKey, setPublishableKey] = useState("");
    const [status, setStatus] = useState("");
    const [cardDetails, setCardDetails] = useState({ number:"", expiry:"", cvc:"", name:"" });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/payments/config`, { headers })
            .then(r => r.ok ? r.json() : {})
            .then(data => setPublishableKey(data.publishable_key || ""))
            .catch(console.error);
    }, []);

    const handlePayment = async () => {
        if (!order_id || !amount) return setStatus("Missing order information");
        setLoading(true);
        setStatus("Processing payment...");
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/payments/create-intent`, {
                method:"POST", headers, body:JSON.stringify({ order_id, amount, customer_id: 1 })
            });
            if (!r.ok) {
                const err = await r.json();
                setStatus(err.error || "Payment setup failed");
                setLoading(false);
                return;
            }
            const { client_secret, payment_intent_id } = await r.json();
            const confirm = await fetch(`${process.env.BACKEND_URL}/api/payments/confirm`, {
                method:"POST", headers, body:JSON.stringify({ payment_intent_id, payment_method:"card" })
            });
            if (confirm.ok) {
                setStatus("✓ Payment successful!");
                setTimeout(() => navigate("/orders"), 2000);
            } else {
                setStatus("Payment confirmation failed");
            }
        } catch(e) { setStatus("Payment error: " + e.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>💳 Checkout</h2><p>Secure payment processing</p></div>
            <div className="row justify-content-center">
                <div className="col-md-6">
                    {!publishableKey && (
                        <div className="alert alert-warning mb-4">
                            <strong>Stripe not configured.</strong> Add STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY to your .env file to enable real payments.
                        </div>
                    )}
                    <div className="glass-panel mb-3">
                        <h5 className="mb-3">Order Summary</h5>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Order #{order_id}</span>
                            <span className="text-success fw-bold">${parseFloat(amount||0).toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="glass-panel mb-3">
                        <h5 className="mb-3">Card Details</h5>
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label">Cardholder Name</label>
                                <input className="form-control" placeholder="John Doe" value={cardDetails.name} onChange={e=>setCardDetails({...cardDetails,name:e.target.value})} />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Card Number</label>
                                <input className="form-control" placeholder="4242 4242 4242 4242" maxLength="19"
                                    value={cardDetails.number} onChange={e=>setCardDetails({...cardDetails,number:e.target.value})} />
                            </div>
                            <div className="col-6">
                                <label className="form-label">Expiry</label>
                                <input className="form-control" placeholder="MM/YY" maxLength="5" value={cardDetails.expiry} onChange={e=>setCardDetails({...cardDetails,expiry:e.target.value})} />
                            </div>
                            <div className="col-6">
                                <label className="form-label">CVC</label>
                                <input className="form-control" placeholder="123" maxLength="3" value={cardDetails.cvc} onChange={e=>setCardDetails({...cardDetails,cvc:e.target.value})} />
                            </div>
                        </div>
                    </div>
                    {status && <div className={`alert ${status.includes("✓")?"alert-success":"alert-info"} mb-3`}>{status}</div>}
                    <button className="btn btn-success w-100 py-3" onClick={handlePayment} disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm me-2"/> : "💳 "}
                        {loading ? "Processing..." : `Pay $${parseFloat(amount||0).toFixed(2)}`}
                    </button>
                    <p className="text-center mt-2" style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)"}}>🔒 Secured by Stripe</p>
                </div>
            </div>
        </div>
    );
};
export default StripeCheckout;
