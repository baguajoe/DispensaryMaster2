import React from "react";
const AboutUs = () => (
    <div className="main-content p-4" style={{maxWidth:800,margin:"0 auto"}}>
        <h2 style={{color:"#ffab00",marginBottom:"0.5rem"}}>About BudphoriaPro</h2>
        <p style={{color:"rgba(255,248,225,0.6)",marginBottom:"2rem"}}>The Cannabis Industry Operating System</p>
        <div className="glass-panel" style={{marginBottom:"1.25rem"}}>
            <h4 style={{color:"#ffab00"}}>Our Mission</h4>
            <p>BudphoriaPro replaces 5 separate tools with one unified platform built specifically for cannabis dispensaries, grow operations, and medical facilities.</p>
        </div>
        <div className="glass-panel" style={{marginBottom:"1.25rem"}}>
            <h4 style={{color:"#ffab00"}}>What We Replace</h4>
            <div className="row g-3">
                {[{name:"Dutchie",cost:"$500-1000/mo",what:"POS only"},{name:"Wurk",cost:"$300-400/mo",what:"HR only"},{name:"BambooHR",cost:"$250-500/mo",what:"HR only"},{name:"Trainual",cost:"$149+/mo",what:"Training only"}].map((c,i)=>(
                    <div key={i} className="col-6"><div style={{background:"rgba(255,82,82,0.08)",border:"1px solid rgba(255,82,82,0.2)",borderRadius:10,padding:"0.75rem"}}><div style={{fontWeight:700}}>{c.name}</div><div style={{fontSize:"0.8rem",color:"rgba(255,82,82,0.8)"}}>{c.cost} — {c.what}</div></div></div>
                ))}
            </div>
        </div>
        <div className="glass-panel">
            <h4 style={{color:"#ffab00"}}>Contact</h4>
            <p>Email: <a href="mailto:hello@budphoriapro.com">hello@budphoriapro.com</a></p>
            <p>Website: <a href="https://budphoriapro.com">budphoriapro.com</a></p>
        </div>
    </div>
);
export default AboutUs;