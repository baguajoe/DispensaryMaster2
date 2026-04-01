import React, { useState, useEffect } from "react";

const TIERS = [
    { name:"Standard", min:0, max:499, color:"#2dce89", icon:"🌿", perks:["5% points on purchases","Access to member deals","Birthday discount"] },
    { name:"Gold", min:500, max:999, color:"#ffd600", icon:"👑", perks:["8% points on purchases","Early access to new products","10% birthday discount","Free delivery on orders $50+"] },
    { name:"Premium", min:1000, max:99999, color:"#11cdef", icon:"⭐", perks:["12% points on purchases","Priority customer service","15% birthday discount","Free delivery on all orders","Exclusive member events"] },
];

const REWARDS = [
    { name:"$5 Off", points:100, icon:"💵" },
    { name:"$10 Off", points:200, icon:"💵" },
    { name:"Free Pre-Roll", points:150, icon:"🌿" },
    { name:"Free Edible", points:250, icon:"🍫" },
    { name:"$25 Off", points:500, icon:"💰" },
    { name:"Free 1/8 oz", points:800, icon:"🎁" },
];

const LoyaltyProgram = () => {
    const [profile, setProfile] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(null);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/customer/profile`, { headers })
            .then(r => r.ok ? r.json() : null)
            .then(p => { setProfile(p); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const points = profile?.loyalty_points || 0;
    const currentTier = TIERS.find(t => points >= t.min && points <= t.max) || TIERS[0];
    const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
    const progressToNext = nextTier ? ((points - currentTier.min) / (nextTier.min - currentTier.min) * 100) : 100;

    const handleRedeem = async (reward) => {
        if (points < reward.points) return alert(`You need ${reward.points - points} more points to redeem this reward`);
        setRedeeming(reward.name);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/loyalty/redeem`, {
                method:"POST", headers,
                body: JSON.stringify({ points: reward.points, reward: reward.name })
            });
            if (r.ok) {
                setProfile(p => ({ ...p, loyalty_points: (p?.loyalty_points||0) - reward.points }));
                alert(`✅ Redeemed: ${reward.name}! Your cashier will apply the discount.`);
            } else {
                alert("Redemption failed. Please try again.");
            }
        } catch(e) { console.error(e); }
        finally { setRedeeming(null); }
    };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>🏆 Loyalty Program</h2><p>Earn points with every purchase and redeem for rewards</p></div>

            {/* Points Banner */}
            <div className="glass-panel mb-4 p-4 text-center" style={{background:`linear-gradient(135deg, ${currentTier.color}22, ${currentTier.color}11)`,borderColor:`${currentTier.color}44`}}>
                <div style={{fontSize:"3.5rem",fontWeight:800,color:currentTier.color}}>{points.toLocaleString()}</div>
                <div style={{color:"rgba(255,255,255,0.6)",marginBottom:"1rem"}}>Available Points</div>
                <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                    <span style={{fontSize:"1.5rem"}}>{currentTier.icon}</span>
                    <span style={{color:currentTier.color,fontWeight:600,fontSize:"1.1rem"}}>{currentTier.name} Member</span>
                </div>
                {nextTier && (
                    <>
                        <div className="d-flex justify-content-between mb-1" style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>
                            <span>{currentTier.name}</span>
                            <span>{nextTier.min - points} points to {nextTier.name}</span>
                            <span>{nextTier.name} {nextTier.icon}</span>
                        </div>
                        <div className="progress" style={{height:"8px",background:"rgba(255,255,255,0.1)"}}>
                            <div className="progress-bar" style={{width:`${progressToNext}%`,background:currentTier.color,transition:"width 0.5s"}} />
                        </div>
                    </>
                )}
                {!nextTier && <div style={{color:currentTier.color}}>🎉 You've reached the highest tier!</div>}
            </div>

            <div className="row g-3">
                {/* Rewards */}
                <div className="col-md-7">
                    <div className="glass-panel">
                        <h5 className="mb-3">Redeem Rewards</h5>
                        <div className="row g-3">
                            {REWARDS.map((r,i) => {
                                const canAfford = points >= r.points;
                                return (
                                    <div key={i} className="col-6 col-md-4">
                                        <div className="p-3 rounded text-center h-100 d-flex flex-column"
                                            style={{background:canAfford?"rgba(45,206,137,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${canAfford?"rgba(45,206,137,0.4)":"rgba(255,255,255,0.1)"}`}}>
                                            <div style={{fontSize:"2rem"}}>{r.icon}</div>
                                            <div style={{fontWeight:600,fontSize:"0.9rem",margin:"0.5rem 0 0.25rem"}}>{r.name}</div>
                                            <div style={{color:canAfford?"#ffd600":"rgba(255,255,255,0.4)",fontSize:"0.8rem",marginBottom:"0.75rem"}}>{r.points} pts</div>
                                            <button className={`btn btn-sm mt-auto ${canAfford?"btn-success":"btn-outline-secondary"}`}
                                                onClick={() => handleRedeem(r)}
                                                disabled={!canAfford || redeeming === r.name}>
                                                {redeeming === r.name ? <span className="spinner-border spinner-border-sm" /> : canAfford ? "Redeem" : "Need more pts"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Tier Benefits */}
                <div className="col-md-5">
                    <div className="glass-panel mb-3">
                        <h5 className="mb-3">Your Tier Benefits</h5>
                        <ul className="list-unstyled mb-0">
                            {currentTier.perks.map((p,i) => (
                                <li key={i} className="mb-2 d-flex align-items-center gap-2">
                                    <span style={{color:currentTier.color}}>✓</span>
                                    <span style={{fontSize:"0.9rem"}}>{p}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="glass-panel">
                        <h5 className="mb-3">How to Earn Points</h5>
                        {[
                            { action:"Every $1 spent", points:"1 pt" },
                            { action:"First purchase", points:"+50 pts" },
                            { action:"Write a review", points:"+10 pts" },
                            { action:"Refer a friend", points:"+100 pts" },
                            { action:"Birthday bonus", points:"+25 pts" },
                        ].map((e,i) => (
                            <div key={i} className="d-flex justify-content-between mb-2">
                                <span style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.7)"}}>{e.action}</span>
                                <span style={{color:"#ffd600",fontWeight:600,fontSize:"0.85rem"}}>{e.points}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default LoyaltyProgram;
