import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";

const CATEGORIES = ["All","Flower","Edibles","Concentrates","Vapes","Pre-Rolls","Topicals","CBD"];

const KioskMode = () => {
    const { store, actions } = useContext(Context);
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [category, setCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState([]);
    const [step, setStep] = useState("browse"); // browse, cart, age-verify, payment, receipt
    const [ageVerified, setAgeVerified] = useState(false);
    const [dob, setDob] = useState("");
    const [idScanned, setIdScanned] = useState(false);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/products`, { headers })
            .then(r => r.ok ? r.json() : {})
            .then(data => {
                const prods = Array.isArray(data) ? data : (data.products || []);
                setProducts(prods); setFiltered(prods); setLoading(false);
            }).catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = products;
        if (category !== "All") result = result.filter(p => p.category === category);
        if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        setFiltered(result);
    }, [category, search, products]);

    const addToCart = (product) => {
        const existing = cart.find(i => i.id === product.id);
        if (existing) setCart(cart.map(i => i.id === product.id ? {...i, qty: i.qty+1} : i));
        else setCart([...cart, {...product, qty:1}]);
    };

    const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));
    const updateQty = (id, qty) => qty <= 0 ? removeFromCart(id) : setCart(cart.map(i => i.id===id ? {...i, qty} : i));

    const getPrice = (p) => parseFloat(p.price || p.unit_price || 0);
    const subtotal = cart.reduce((s, i) => s + getPrice(i) * i.qty, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const verifyAge = () => {
        if (!dob) return alert("Please enter your date of birth");
        const age = Math.floor((new Date() - new Date(dob)) / (365.25*24*60*60*1000));
        if (age >= 21) { setAgeVerified(true); setStep("payment"); }
        else alert("You must be 21 or older to purchase cannabis products.");
    };

    const completeOrder = async () => {
        setCompleting(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/orders`, {
                method:"POST", headers,
                body:JSON.stringify({
                    customer_id: 1,
                    items: cart.map(i => ({ product_id:i.id, quantity:i.qty }))
                })
            });
            if (r.ok) {
                const data = await r.json();
                setOrderId(data.id);
                setStep("receipt");
                setCart([]);
            }
        } catch(e) { console.error(e); }
        finally { setCompleting(false); }
    };

    const resetKiosk = () => { setStep("browse"); setCart([]); setAgeVerified(false); setDob(""); setIdScanned(false); setOrderId(null); };

    if (loading) return <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0a0e1a"}}><div className="spinner-border text-light"/></div>;

    return (
        <div style={{height:"100vh",background:"linear-gradient(135deg,#0a0e1a,#1a2040)",color:"white",fontFamily:"system-ui",overflow:"hidden",display:"flex",flexDirection:"column"}}>
            {/* Header */}
            <div style={{padding:"1rem 2rem",background:"rgba(0,0,0,0.4)",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                <div style={{fontSize:"1.5rem",fontWeight:800,color:"#2dce89"}}>🌿 DispenseMaster Kiosk</div>
                <div style={{display:"flex",gap:"1rem",alignItems:"center"}}>
                    {cart.length>0 && step==="browse" && (
                        <button style={{background:"#2dce89",border:"none",borderRadius:"8px",padding:"0.5rem 1.5rem",color:"white",fontWeight:600,cursor:"pointer",fontSize:"1rem"}}
                            onClick={()=>setStep("cart")}>
                            🛒 Cart ({cart.reduce((s,i)=>s+i.qty,0)}) — ${total.toFixed(2)}
                        </button>
                    )}
                    {step!=="browse" && <button style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"8px",padding:"0.5rem 1rem",color:"white",cursor:"pointer"}} onClick={resetKiosk}>✕ Start Over</button>}
                </div>
            </div>

            {/* Browse Step */}
            {step === "browse" && (
                <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
                    <div style={{padding:"1rem 2rem",display:"flex",gap:"1rem",alignItems:"center",background:"rgba(0,0,0,0.2)"}}>
                        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." style={{flex:1,padding:"0.75rem 1rem",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.05)",color:"white",fontSize:"1rem"}} />
                        <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                            {CATEGORIES.map(c=><button key={c} onClick={()=>setCategory(c)} style={{padding:"0.5rem 1rem",borderRadius:"20px",border:"none",background:category===c?"#2dce89":"rgba(255,255,255,0.1)",color:"white",cursor:"pointer",fontWeight:category===c?700:400}}>{c}</button>)}
                        </div>
                    </div>
                    <div style={{flex:1,overflowY:"auto",padding:"1.5rem 2rem",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"1rem",alignContent:"start"}}>
                        {filtered.map(p=>(
                            <div key={p.id} onClick={()=>addToCart(p)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"12px",padding:"1.25rem",cursor:"pointer",transition:"transform 0.15s,border-color 0.15s"}}
                                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor="rgba(45,206,137,0.5)";}}
                                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";}}>
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase",marginBottom:"0.5rem"}}>{p.category}</div>
                                <div style={{fontWeight:700,fontSize:"1rem",marginBottom:"0.25rem"}}>{p.name}</div>
                                {p.strain && <div style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)",marginBottom:"0.25rem"}}>{p.strain}</div>}
                                {p.thc_content>0 && <div style={{fontSize:"0.75rem",color:"#2dce89",marginBottom:"0.75rem"}}>THC: {p.thc_content}%</div>}
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                    <span style={{fontWeight:800,fontSize:"1.2rem",color:"#2dce89"}}>${getPrice(p).toFixed(2)}</span>
                                    <span style={{background:"#2dce89",borderRadius:"50%",width:"32px",height:"32px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",color:"white"}}>+</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cart Step */}
            {step === "cart" && (
                <div style={{flex:1,display:"flex",flexDirection:"column",padding:"2rem",overflow:"auto"}}>
                    <h2 style={{marginBottom:"1.5rem"}}>🛒 Your Cart</h2>
                    {cart.map(item=>(
                        <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1rem",marginBottom:"0.75rem",background:"rgba(255,255,255,0.06)",borderRadius:"10px"}}>
                            <div><div style={{fontWeight:600}}>{item.name}</div><div style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.5)"}}>${getPrice(item).toFixed(2)} each</div></div>
                            <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
                                <button onClick={()=>updateQty(item.id,item.qty-1)} style={{width:"36px",height:"36px",borderRadius:"50%",border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"white",fontSize:"1.2rem",cursor:"pointer"}}>-</button>
                                <span style={{fontWeight:700,fontSize:"1.1rem",minWidth:"24px",textAlign:"center"}}>{item.qty}</span>
                                <button onClick={()=>updateQty(item.id,item.qty+1)} style={{width:"36px",height:"36px",borderRadius:"50%",border:"none",background:"#2dce89",color:"white",fontSize:"1.2rem",cursor:"pointer"}}>+</button>
                                <span style={{fontWeight:700,color:"#2dce89",minWidth:"60px",textAlign:"right"}}>${(getPrice(item)*item.qty).toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                    <div style={{marginTop:"auto",background:"rgba(0,0,0,0.3)",borderRadius:"12px",padding:"1.5rem"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.5rem"}}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.5rem"}}><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                        <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:"1.3rem",marginTop:"0.75rem",paddingTop:"0.75rem",borderTop:"1px solid rgba(255,255,255,0.1)"}}><span>Total</span><span style={{color:"#2dce89"}}>${total.toFixed(2)}</span></div>
                    </div>
                    <div style={{display:"flex",gap:"1rem",marginTop:"1.5rem"}}>
                        <button onClick={()=>setStep("browse")} style={{flex:1,padding:"1rem",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"white",fontSize:"1rem",cursor:"pointer"}}>← Continue Shopping</button>
                        <button onClick={()=>setStep("age-verify")} style={{flex:2,padding:"1rem",borderRadius:"10px",border:"none",background:"#2dce89",color:"white",fontSize:"1.1rem",fontWeight:700,cursor:"pointer"}}>Proceed to Checkout →</button>
                    </div>
                </div>
            )}

            {/* Age Verification Step */}
            {step === "age-verify" && (
                <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem",textAlign:"center"}}>
                    <div style={{fontSize:"4rem",marginBottom:"1rem"}}>🪪</div>
                    <h2 style={{marginBottom:"0.5rem"}}>Age Verification Required</h2>
                    <p style={{color:"rgba(255,255,255,0.6)",marginBottom:"2rem"}}>You must be 21 or older to purchase cannabis products</p>
                    <div style={{background:"rgba(255,255,255,0.06)",borderRadius:"16px",padding:"2rem",width:"100%",maxWidth:"400px"}}>
                        <div style={{marginBottom:"1.5rem"}}>
                            <label style={{display:"block",marginBottom:"0.5rem",color:"rgba(255,255,255,0.7)"}}>Date of Birth</label>
                            <input type="date" value={dob} onChange={e=>setDob(e.target.value)} style={{width:"100%",padding:"1rem",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.05)",color:"white",fontSize:"1.1rem"}} />
                        </div>
                        <button onClick={verifyAge} style={{width:"100%",padding:"1rem",borderRadius:"10px",border:"none",background:"#2dce89",color:"white",fontSize:"1.1rem",fontWeight:700,cursor:"pointer",marginBottom:"1rem"}}>Verify Age</button>
                        <div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.85rem"}}>Or show your ID to the budtender</div>
                    </div>
                </div>
            )}

            {/* Payment Step */}
            {step === "payment" && (
                <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem",textAlign:"center"}}>
                    <div style={{fontSize:"4rem",marginBottom:"1rem"}}>💳</div>
                    <h2 style={{marginBottom:"0.5rem"}}>Choose Payment Method</h2>
                    <p style={{color:"rgba(255,255,255,0.6)",marginBottom:"2rem"}}>Total: <strong style={{color:"#2dce89",fontSize:"1.3rem"}}>${total.toFixed(2)}</strong></p>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",width:"100%",maxWidth:"500px",marginBottom:"2rem"}}>
                        {[{l:"💵 Cash",v:"cash"},{l:"💳 Card",v:"card"},{l:"🏦 Debit",v:"debit"},{l:"📱 Digital",v:"digital"}].map(pm=>(
                            <button key={pm.v} onClick={completeOrder} disabled={completing} style={{padding:"2rem",borderRadius:"12px",border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.06)",color:"white",fontSize:"1.1rem",fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}
                                onMouseEnter={e=>{e.currentTarget.style.background="rgba(45,206,137,0.2)";e.currentTarget.style.borderColor="#2dce89";}}
                                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.borderColor="rgba(255,255,255,0.2)";}}>
                                {completing?<span className="spinner-border spinner-border-sm"/>:pm.l}
                            </button>
                        ))}
                    </div>
                    <p style={{color:"rgba(255,255,255,0.4)",fontSize:"0.85rem"}}>Please see budtender to complete payment</p>
                </div>
            )}

            {/* Receipt Step */}
            {step === "receipt" && (
                <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem",textAlign:"center"}}>
                    <div style={{fontSize:"5rem",marginBottom:"1rem"}}>✅</div>
                    <h1 style={{color:"#2dce89",marginBottom:"0.5rem"}}>Order Placed!</h1>
                    {orderId && <p style={{color:"rgba(255,255,255,0.6)",fontSize:"1.1rem",marginBottom:"2rem"}}>Order #{orderId} — Please see budtender for payment and pickup</p>}
                    <div style={{background:"rgba(45,206,137,0.1)",border:"1px solid rgba(45,206,137,0.3)",borderRadius:"12px",padding:"2rem",maxWidth:"400px",marginBottom:"2rem"}}>
                        <div style={{fontSize:"0.9rem",color:"rgba(255,255,255,0.7)"}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.5rem"}}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.5rem"}}><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                            <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:"1.1rem",borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:"0.5rem"}}><span>Total</span><span style={{color:"#2dce89"}}>${total.toFixed(2)}</span></div>
                        </div>
                    </div>
                    <button onClick={resetKiosk} style={{padding:"1rem 3rem",borderRadius:"10px",border:"none",background:"#2dce89",color:"white",fontSize:"1.1rem",fontWeight:700,cursor:"pointer"}}>Start New Order</button>
                </div>
            )}
        </div>
    );
};
export default KioskMode;
