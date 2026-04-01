import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EFFECTS = ["Relaxed","Happy","Creative","Energetic","Focused","Sleepy","Hungry","Euphoric","Uplifted","Talkative"];

const ProductReviews = () => {
    const { product_id } = useParams();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ rating:5, review_text:"", effects:[], would_recommend:true });
    const [saving, setSaving] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        if (!product_id) return;
        fetch(`${process.env.BACKEND_URL}/api/products/${product_id}/reviews`, { headers })
            .then(r => r.ok ? r.json() : { reviews:[], average_rating:0 })
            .then(data => { setReviews(data.reviews||[]); setAvgRating(data.average_rating||0); setLoading(false); })
            .catch(() => setLoading(false));
    }, [product_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const r = await fetch(`${process.env.BACKEND_URL}/api/products/${product_id}/reviews`, { method:"POST", headers, body:JSON.stringify(form) });
        if (r.ok) { const data = await r.json(); setReviews(prev=>[data,...prev.filter(rv=>rv.customer_id!==data.customer_id)]); setShowForm(false); }
        setSaving(false);
    };

    const toggleEffect = (effect) => setForm({...form, effects: form.effects.includes(effect) ? form.effects.filter(e=>e!==effect) : [...form.effects, effect]});

    const Stars = ({rating, onChange, readOnly}) => (
        <div className="d-flex gap-1">{[1,2,3,4,5].map(s=><span key={s} style={{fontSize:"1.5rem",cursor:readOnly?"default":"pointer",color:s<=rating?"#ffd600":"rgba(255,255,255,0.2)"}} onClick={()=>!readOnly&&onChange(s)}>★</span>)}</div>
    );

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>⭐ Product Reviews</h2><p>{reviews.length} reviews · {avgRating} avg rating</p></div>
                <button className="btn btn-success" onClick={()=>setShowForm(!showForm)}>+ Write Review</button>
            </div>

            {/* Average */}
            <div className="glass-panel mb-4 text-center" style={{padding:"2rem"}}>
                <div style={{fontSize:"4rem",fontWeight:800,color:"#ffd600"}}>{avgRating.toFixed(1)}</div>
                <div className="d-flex justify-content-center mb-2">{[1,2,3,4,5].map(s=><span key={s} style={{fontSize:"2rem",color:s<=Math.round(avgRating)?"#ffd600":"rgba(255,255,255,0.2)"}}>★</span>)}</div>
                <div style={{color:"rgba(255,255,255,0.5)"}}>{reviews.length} customer reviews</div>
            </div>

            {showForm && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">Write a Review</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3"><label className="form-label">Rating *</label><Stars rating={form.rating} onChange={r=>setForm({...form,rating:r})} /></div>
                        <div className="mb-3"><label className="form-label">Your Experience</label><textarea className="form-control" rows="3" value={form.review_text} onChange={e=>setForm({...form,review_text:e.target.value})} placeholder="Share your experience..." /></div>
                        <div className="mb-3"><label className="form-label">Effects Felt</label><div className="d-flex flex-wrap gap-2">{EFFECTS.map(e=><span key={e} className={`badge ${form.effects.includes(e)?"bg-success":"bg-secondary"}`} style={{cursor:"pointer",padding:"8px 12px",fontSize:"0.85rem"}} onClick={()=>toggleEffect(e)}>{e}</span>)}</div></div>
                        <div className="mb-3 form-check"><input className="form-check-input" type="checkbox" checked={form.would_recommend} onChange={e=>setForm({...form,would_recommend:e.target.checked})} /><label className="form-check-label">I would recommend this product</label></div>
                        <div className="d-flex gap-2"><button type="button" className="btn btn-outline-light" onClick={()=>setShowForm(false)}>Cancel</button><button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>{saving?<span className="spinner-border spinner-border-sm"/>:"Submit Review"}</button></div>
                    </form>
                </div>
            )}

            {loading ? <div className="spinner-border text-light"/>
            : reviews.map(r=>(
                <div key={r.id} className="glass-panel mb-3">
                    <div className="d-flex justify-content-between mb-2">
                        <div className="d-flex gap-1">{[1,2,3,4,5].map(s=><span key={s} style={{color:s<=r.rating?"#ffd600":"rgba(255,255,255,0.2)"}}>★</span>)}</div>
                        <span style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.4)"}}>{r.created_at?new Date(r.created_at).toLocaleDateString():""}</span>
                    </div>
                    {r.review_text && <p style={{margin:"0.5rem 0"}}>{r.review_text}</p>}
                    {(r.effects||[]).length>0 && <div className="d-flex flex-wrap gap-1 mb-2">{r.effects.map(e=><span key={e} className="badge bg-secondary">{e}</span>)}</div>}
                    {r.would_recommend && <div style={{fontSize:"0.8rem",color:"#2dce89"}}>✓ Recommends this product</div>}
                </div>
            ))}
        </div>
    );
};
export default ProductReviews;
