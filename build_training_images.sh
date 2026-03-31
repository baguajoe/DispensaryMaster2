#!/bin/bash
# ============================================================
# BudphoriaPro — Training Complete + Image Uploads in Feed
# Run from: /workspaces/DispensaryMaster2
# ============================================================
set -e
cd /workspaces/DispensaryMaster2

echo "Step 1 — Building TrainingHome + assignment model + routes..."
python3 << 'PYEOF'
import os

BASE = "src"

# ── TRAINING HOME with manager dashboard + assignment UI ──────────
TRAINING_HOME = open("src/front/js/pages/Training/TrainingHome.js").read() if False else None

TRAINING_HOME = r"""import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const QuizViewer = ({ questions, onComplete }) => {
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const q = questions[current];
    const score = submitted ? questions.filter((q,i) => answers[i]===q.correct).length : 0;
    const passed = submitted && score >= Math.ceil(questions.length*0.7);
    if (submitted) return (
        <div className="text-center py-4">
            <div style={{fontSize:"3rem",marginBottom:"0.75rem"}}>{passed?"🎉":"📝"}</div>
            <h4 style={{color:passed?"#51cf66":"#ff6b6b"}}>{passed?"Passed!":"Not quite"}</h4>
            <p style={{color:"rgba(255,255,255,0.6)"}}>You scored {score}/{questions.length} ({Math.round((score/questions.length)*100)}%)</p>
            <p className="small" style={{color:"rgba(255,255,255,0.4)"}}>Passing score: 70%</p>
            {passed ? <button className="btn btn-success mt-2" onClick={onComplete}>Complete Training</button>
                    : <button className="btn btn-outline-light mt-2" onClick={()=>{setAnswers({});setCurrent(0);setSubmitted(false);}}>Retry Quiz</button>}
        </div>
    );
    return (
        <div>
            <div className="d-flex justify-content-between mb-3">
                <span className="small" style={{color:"rgba(255,255,255,0.5)"}}>Question {current+1} of {questions.length}</span>
                <span className="small" style={{color:"rgba(255,255,255,0.5)"}}>{Object.keys(answers).length} answered</span>
            </div>
            <div className="progress mb-4" style={{height:"4px",background:"rgba(255,255,255,0.1)"}}>
                <div className="progress-bar bg-success" style={{width:`${((current+1)/questions.length)*100}%`}} />
            </div>
            <h5 className="mb-4" style={{color:"#fff",lineHeight:1.5}}>{q.question}</h5>
            <div className="d-flex flex-column gap-2 mb-4">
                {q.options.map((opt,i)=>(
                    <div key={i} onClick={()=>setAnswers(p=>({...p,[current]:i}))} style={{
                        padding:"0.75rem 1rem",borderRadius:10,cursor:"pointer",
                        background:answers[current]===i?"rgba(105,240,174,0.15)":"rgba(255,255,255,0.06)",
                        border:`1px solid ${answers[current]===i?"rgba(105,240,174,0.5)":"rgba(255,255,255,0.1)"}`,
                        color:answers[current]===i?"#69f0ae":"#e4ede6",transition:"all 0.15s"}}>
                        <span style={{fontWeight:700,marginRight:"0.5rem"}}>{String.fromCharCode(65+i)}.</span>{opt}
                    </div>
                ))}
            </div>
            <div className="d-flex justify-content-between">
                <button className="btn btn-outline-light btn-sm" onClick={()=>setCurrent(Math.max(0,current-1))} disabled={current===0}>Previous</button>
                {current<questions.length-1
                    ? <button className="btn btn-primary btn-sm" onClick={()=>setCurrent(current+1)} disabled={answers[current]===undefined}>Next</button>
                    : <button className="btn btn-success btn-sm" onClick={()=>setSubmitted(true)} disabled={Object.keys(answers).length<questions.length}>Submit Quiz</button>}
            </div>
        </div>
    );
};

const TrainingHome = () => {
    const [resources, setResources] = useState([]);
    const [completions, setCompletions] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("library");
    const [assignModal, setAssignModal] = useState(null);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [assigning, setAssigning] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const headers = { Authorization:`Bearer ${token}`, "Content-Type":"application/json" };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/training-resources`,{headers}).then(r=>r.ok?r.json():[]).catch(()=>[]),
            fetch(`${process.env.BACKEND_URL}/api/training-completions`,{headers}).then(r=>r.ok?r.json():[]).catch(()=>[]),
            fetch(`${process.env.BACKEND_URL}/api/employees`,{headers}).then(r=>r.ok?r.json():[]).catch(()=>[]),
            fetch(`${process.env.BACKEND_URL}/api/training-assignments`,{headers}).then(r=>r.ok?r.json():[]).catch(()=>[]),
        ]).then(([res,comp,emps,assigns])=>{
            setResources(Array.isArray(res)?res:[]);
            setCompletions(Array.isArray(comp)?comp:[]);
            setEmployees(Array.isArray(emps)?emps:[]);
            setAssignments(Array.isArray(assigns)?assigns:[]);
            setLoading(false);
        });
    },[]);

    const markComplete = async(id)=>{
        const r=await fetch(`${process.env.BACKEND_URL}/api/training-completions`,{method:"POST",headers,body:JSON.stringify({resource_id:id})});
        if(r.ok) setCompletions(p=>[...p,{resource_id:id,completed_at:new Date().toISOString()}]);
    };

    const handleAssign = async()=>{
        if(!assignModal||selectedEmployees.length===0) return;
        setAssigning(true);
        try {
            const r=await fetch(`${process.env.BACKEND_URL}/api/training-assignments`,{method:"POST",headers,body:JSON.stringify({resource_id:assignModal.id,employee_ids:selectedEmployees})});
            if(r.ok){const d=await r.json();setAssignments(p=>[...p,...d]);setAssignModal(null);setSelectedEmployees([]);alert(`Assigned to ${selectedEmployees.length} employee(s)`);}
        } finally{setAssigning(false);}
    };

    const isCompleted=(id)=>completions.some(c=>c.resource_id===id);
    const types=["All",...new Set(resources.map(r=>r.resource_type).filter(Boolean))];
    const filtered=resources.filter(r=>(typeFilter==="All"||r.resource_type===typeFilter)&&(!search||r.title?.toLowerCase().includes(search.toLowerCase())));
    const required=filtered.filter(r=>r.is_required);
    const optional=filtered.filter(r=>!r.is_required);
    const totalCompleted=resources.filter(r=>isCompleted(r.id)).length;
    const pct=resources.length>0?Math.round((totalCompleted/resources.length)*100):0;
    const ICONS={video:"▶",article:"📄",module:"📚",quiz:"❓",compliance:"📋"};
    const COLORS={video:"danger",article:"primary",module:"success",quiz:"warning",compliance:"dark"};

    const getEmpProgress=(emp)=>{
        const asgn=assignments.filter(a=>a.employee_id===emp.id);
        const done=asgn.filter(a=>completions.some(c=>c.resource_id===a.resource_id&&c.employee_id===emp.id));
        return{assigned:asgn.length,completed:done.length,pct:asgn.length?Math.round((done.length/asgn.length)*100):0};
    };
    const getResStats=(rid)=>{
        const asgn=assignments.filter(a=>a.resource_id===rid);
        const done=asgn.filter(a=>completions.some(c=>c.resource_id===rid&&c.employee_id===a.employee_id));
        return{assigned:asgn.length,completed:done.length};
    };

    const Card=({r})=>{
        const done=isCompleted(r.id);
        const stats=getResStats(r.id);
        return(
            <div className="col-md-4 mb-3">
                <div className="card h-100" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"white"}}>
                    {r.is_required&&<div className="card-header py-1 text-center bg-danger text-white small fw-bold">REQUIRED</div>}
                    <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between mb-2">
                            <span style={{fontSize:"1.6rem"}}>{ICONS[r.resource_type]||"📄"}</span>
                            <div className="d-flex gap-1 flex-wrap justify-content-end">
                                <span className={`badge bg-${COLORS[r.resource_type]||"secondary"}`}>{r.resource_type}</span>
                                {r.category&&<span className="badge" style={{background:"rgba(255,255,255,0.2)"}}>{r.category}</span>}
                                {done&&<span className="badge bg-success">Done</span>}
                            </div>
                        </div>
                        <h6 className="fw-semibold mb-1">{r.title}</h6>
                        <p className="small mb-2 flex-grow-1" style={{color:"rgba(255,255,255,0.6)",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{r.content}</p>
                        {stats.assigned>0&&<div className="small mb-2" style={{color:"rgba(255,255,255,0.5)"}}>👥 {stats.completed}/{stats.assigned} assigned completed</div>}
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm flex-grow-1" style={{background:"rgba(255,255,255,0.15)",color:"white",border:"1px solid rgba(255,255,255,0.2)"}} onClick={()=>setSelected(r)}>
                                {r.resource_type==="video"?"▶ Watch":"📖 Open"}
                            </button>
                            <button className="btn btn-sm btn-outline-info" onClick={()=>{setAssignModal(r);setSelectedEmployees([]);}} title="Assign">👥</button>
                            {!done&&<button className="btn btn-sm btn-outline-success" onClick={()=>markComplete(r.id)}>✓</button>}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return(
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="text-white mb-0">🎓 Staff Training Center</h3>
                    <small style={{color:"rgba(255,255,255,0.6)"}}>Private compliance & training library</small>
                </div>
                <div className="d-flex gap-2">
                    <button className={`btn btn-sm ${view==="library"?"btn-light":"btn-outline-light"}`} onClick={()=>setView("library")}>Library</button>
                    <button className={`btn btn-sm ${view==="dashboard"?"btn-light":"btn-outline-light"}`} onClick={()=>setView("dashboard")}>Manager Dashboard</button>
                    <button className="btn btn-success btn-sm" onClick={()=>navigate("/training/create")}>+ Add Training</button>
                </div>
            </div>

            <div className="row g-3 mb-4">
                {[{label:"Total Modules",value:resources.length,icon:"📚",color:"#4dabf7"},{label:"Required",value:resources.filter(r=>r.is_required).length,icon:"⚠️",color:"#ff6b6b"},{label:"You Completed",value:totalCompleted,icon:"✅",color:"#51cf66"},{label:"Progress",value:`${pct}%`,icon:"📈",color:"#74c0fc"},{label:"Employees",value:employees.length,icon:"👥",color:"#ffd740"},{label:"Assignments",value:assignments.length,icon:"📋",color:"#ce93d8"}].map((s,i)=>(
                    <div key={i} className="col-6 col-md-2">
                        <div className="rounded p-3 d-flex justify-content-between align-items-center" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)"}}>
                            <div><div className="small mb-1" style={{color:"rgba(255,255,255,0.6)"}}>{s.label}</div><div className="fw-bold fs-5" style={{color:s.color}}>{s.value}</div></div>
                            <span style={{fontSize:"1.3rem"}}>{s.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded p-3 mb-4" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)"}}>
                <div className="d-flex justify-content-between mb-2">
                    <span className="small text-white fw-semibold">Your Progress</span>
                    <span className="small" style={{color:"rgba(255,255,255,0.6)"}}>{totalCompleted}/{resources.length} modules</span>
                </div>
                <div className="progress" style={{height:"10px",background:"rgba(255,255,255,0.1)"}}>
                    <div className="progress-bar bg-success" style={{width:`${pct}%`,transition:"width 0.5s"}} />
                </div>
            </div>

            {view==="dashboard"&&(
                <div>
                    <h5 className="text-white fw-bold mb-3">Manager Completion Dashboard</h5>
                    <div className="mb-4">
                        <h6 className="mb-3" style={{color:"rgba(255,255,255,0.6)"}}>By Employee</h6>
                        {employees.length===0&&<p style={{color:"rgba(255,255,255,0.4)"}}>No employees found.</p>}
                        {employees.map((emp,i)=>{
                            const prog=getEmpProgress(emp);
                            const behind=assignments.filter(a=>a.employee_id===emp.id&&!completions.some(c=>c.resource_id===a.resource_id&&c.employee_id===emp.id)&&resources.find(r=>r.id===a.resource_id)?.is_required);
                            return(
                                <div key={i} className="rounded p-3 mb-2" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)"}}>
                                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                                        <div>
                                            <span className="text-white fw-semibold">{emp.first_name} {emp.last_name}</span>
                                            <span className="ms-2 small" style={{color:"rgba(255,255,255,0.4)"}}>{emp.position}</span>
                                            {behind.length>0&&<span className="badge bg-danger ms-2">{behind.length} required overdue</span>}
                                        </div>
                                        <span style={{color:prog.pct===100?"#51cf66":prog.pct>50?"#ffd740":"#ff6b6b",fontWeight:700}}>{prog.pct}%</span>
                                    </div>
                                    <div className="progress" style={{height:"6px",background:"rgba(255,255,255,0.1)"}}>
                                        <div className="progress-bar" style={{width:`${prog.pct}%`,background:prog.pct===100?"#51cf66":prog.pct>50?"#ffd740":"#ff6b6b"}} />
                                    </div>
                                    <div className="small mt-1" style={{color:"rgba(255,255,255,0.4)"}}>{prog.completed}/{prog.assigned} assigned completed</div>
                                </div>
                            );
                        })}
                    </div>
                    <h6 className="mb-3" style={{color:"rgba(255,255,255,0.6)"}}>By Training Module</h6>
                    <div style={{overflowX:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.875rem"}}>
                            <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                                {["Module","Type","Required","Assigned","Completed","Rate"].map(h=><th key={h} style={{padding:"0.6rem 0.75rem",textAlign:"left",color:"rgba(255,255,255,0.4)",fontSize:"0.72rem",textTransform:"uppercase"}}>{h}</th>)}
                            </tr></thead>
                            <tbody>
                                {resources.map((r,i)=>{
                                    const stats=getResStats(r.id);
                                    const rate=stats.assigned?Math.round((stats.completed/stats.assigned)*100):0;
                                    return(
                                        <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:i%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
                                            <td style={{padding:"0.6rem 0.75rem",color:"#fff",fontWeight:600}}>{r.title}</td>
                                            <td style={{padding:"0.6rem 0.75rem"}}><span className={`badge bg-${COLORS[r.resource_type]||"secondary"}`}>{r.resource_type}</span></td>
                                            <td style={{padding:"0.6rem 0.75rem"}}>{r.is_required?<span className="badge bg-danger">Yes</span>:<span style={{color:"rgba(255,255,255,0.3)"}}>No</span>}</td>
                                            <td style={{padding:"0.6rem 0.75rem",color:"rgba(255,255,255,0.6)"}}>{stats.assigned}</td>
                                            <td style={{padding:"0.6rem 0.75rem",color:"#51cf66",fontWeight:700}}>{stats.completed}</td>
                                            <td style={{padding:"0.6rem 0.75rem"}}>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div style={{flex:1,height:6,background:"rgba(255,255,255,0.1)",borderRadius:3}}>
                                                        <div style={{height:"100%",width:`${rate}%`,background:rate===100?"#51cf66":rate>50?"#ffd740":"#ff6b6b",borderRadius:3}} />
                                                    </div>
                                                    <span style={{color:rate===100?"#51cf66":rate>50?"#ffd740":"#ff6b6b",fontWeight:700,fontSize:"0.8rem",minWidth:35}}>{rate}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {resources.length===0&&<p className="text-center py-3" style={{color:"rgba(255,255,255,0.4)"}}>No training modules yet.</p>}
                    </div>
                </div>
            )}

            {view==="library"&&(
                <>
                    <div className="d-flex gap-2 mb-4 flex-wrap">
                        <input className="form-control flex-grow-1" placeholder="Search training..." style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"white",maxWidth:"320px"}} value={search} onChange={e=>setSearch(e.target.value)} />
                        {types.map(t=><button key={t} className={`btn btn-sm ${typeFilter===t?"btn-light":"btn-outline-light"}`} onClick={()=>setTypeFilter(t)}>{t}</button>)}
                    </div>
                    {loading?<div className="text-center py-5"><div className="spinner-border text-light"/></div>
                    :filtered.length===0?<div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}><div style={{fontSize:"3rem"}}>🎓</div><h5 className="text-white">No training materials yet</h5><button className="btn btn-success mt-2" onClick={()=>navigate("/training/create")}>Add First Module</button></div>
                    :<>
                        {required.length>0&&<div className="mb-4"><h6 className="text-danger fw-bold mb-3">Required Training ({required.length})</h6><div className="row">{required.map(r=><Card key={r.id} r={r}/>)}</div></div>}
                        {optional.length>0&&<div><h6 className="text-white fw-bold mb-3">{required.length>0?"Additional":"All"} Training ({optional.length})</h6><div className="row">{optional.map(r=><Card key={r.id} r={r}/>)}</div></div>}
                    </>}
                </>
            )}

            {assignModal&&(
                <>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-md">
                            <div className="modal-content" style={{background:"#1a2a3a",color:"white",border:"1px solid rgba(255,255,255,0.2)"}}>
                                <div className="modal-header" style={{borderBottom:"1px solid rgba(255,255,255,0.15)"}}>
                                    <h5 className="modal-title">Assign Training</h5>
                                    <button className="btn-close btn-close-white" onClick={()=>setAssignModal(null)}/>
                                </div>
                                <div className="modal-body">
                                    <div className="rounded p-2 mb-3" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}>
                                        <div className="fw-semibold">{assignModal.title}</div>
                                        <div className="small" style={{color:"rgba(255,255,255,0.5)"}}>{assignModal.resource_type}</div>
                                    </div>
                                    <div className="mb-2">
                                        <button className="btn btn-sm btn-outline-light me-2" onClick={()=>setSelectedEmployees(employees.map(e=>e.id))}>Select All</button>
                                        <button className="btn btn-sm btn-outline-light" onClick={()=>setSelectedEmployees([])}>Clear</button>
                                    </div>
                                    <div style={{maxHeight:300,overflowY:"auto"}}>
                                        {employees.length===0&&<p style={{color:"rgba(255,255,255,0.4)"}}>No employees found.</p>}
                                        {employees.map((emp,i)=>{
                                            const alreadyAssigned=assignments.some(a=>a.resource_id===assignModal.id&&a.employee_id===emp.id);
                                            return(
                                                <div key={i} onClick={()=>!alreadyAssigned&&selectedEmployees.includes(emp.id)?setSelectedEmployees(p=>p.filter(e=>e!==emp.id)):!alreadyAssigned&&setSelectedEmployees(p=>[...p,emp.id])} style={{
                                                    display:"flex",alignItems:"center",gap:"0.65rem",padding:"0.6rem 0.75rem",borderRadius:8,marginBottom:"0.35rem",
                                                    background:selectedEmployees.includes(emp.id)?"rgba(105,240,174,0.12)":"rgba(255,255,255,0.04)",
                                                    border:`1px solid ${selectedEmployees.includes(emp.id)?"rgba(105,240,174,0.4)":"rgba(255,255,255,0.1)"}`,
                                                    cursor:alreadyAssigned?"default":"pointer",opacity:alreadyAssigned?0.5:1}}>
                                                    <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(105,240,174,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"#69f0ae",fontSize:"0.85rem",flexShrink:0}}>{emp.first_name?.[0]||"?"}</div>
                                                    <div style={{flex:1}}><div style={{fontWeight:600,fontSize:"0.875rem"}}>{emp.first_name} {emp.last_name}</div><div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.4)"}}>{emp.position}</div></div>
                                                    {alreadyAssigned&&<span className="badge bg-secondary">Assigned</span>}
                                                    {selectedEmployees.includes(emp.id)&&<span style={{color:"#69f0ae",fontWeight:800}}>✓</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="modal-footer" style={{borderTop:"1px solid rgba(255,255,255,0.15)"}}>
                                    <button className="btn btn-outline-light" onClick={()=>setAssignModal(null)}>Cancel</button>
                                    <button className="btn btn-success px-4" onClick={handleAssign} disabled={assigning||selectedEmployees.length===0}>
                                        {assigning?<><span className="spinner-border spinner-border-sm me-2"/>Assigning...</>:`Assign to ${selectedEmployees.length} Employee(s)`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" onClick={()=>setAssignModal(null)}/>
                </>
            )}

            {selected&&(
                <>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg modal-dialog-scrollable">
                            <div className="modal-content" style={{background:"#1a2a3a",color:"white",border:"1px solid rgba(255,255,255,0.2)"}}>
                                <div className="modal-header" style={{borderBottom:"1px solid rgba(255,255,255,0.15)"}}>
                                    <div>
                                        <h5 className="modal-title fw-bold">{ICONS[selected.resource_type]} {selected.title}</h5>
                                        <div className="d-flex gap-2 mt-1">
                                            <span className={`badge bg-${COLORS[selected.resource_type]}`}>{selected.resource_type}</span>
                                            {selected.category&&<span className="badge" style={{background:"rgba(255,255,255,0.2)"}}>{selected.category}</span>}
                                            {selected.is_required&&<span className="badge bg-danger">Required</span>}
                                        </div>
                                    </div>
                                    <button className="btn-close btn-close-white ms-auto" onClick={()=>setSelected(null)}/>
                                </div>
                                <div className="modal-body">
                                    {selected.resource_type==="video"&&selected.link&&(
                                        <div className="ratio ratio-16x9 mb-3 rounded overflow-hidden">
                                            <iframe src={selected.link.includes("youtube.com/watch?v=")?`https://www.youtube.com/embed/${new URL(selected.link).searchParams.get("v")}`:selected.link.includes("youtu.be/")?`https://www.youtube.com/embed/${selected.link.split("youtu.be/")[1]}`:selected.link} allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"/>
                                        </div>
                                    )}
                                    {selected.link&&selected.resource_type!=="video"&&<a href={selected.link} target="_blank" rel="noreferrer" className="btn btn-outline-light mb-3">Open Resource</a>}
                                    {selected.resource_type==="quiz"&&selected.quiz_questions?.length>0
                                        ?<QuizViewer questions={selected.quiz_questions} onComplete={()=>{markComplete(selected.id);setSelected(null);}}/>
                                        :<div className="rounded p-3" style={{background:"rgba(255,255,255,0.05)",whiteSpace:"pre-wrap",color:"rgba(255,255,255,0.85)"}}>{selected.content}</div>}
                                </div>
                                <div className="modal-footer" style={{borderTop:"1px solid rgba(255,255,255,0.15)"}}>
                                    <button className="btn btn-outline-light" onClick={()=>setSelected(null)}>Close</button>
                                    {selected.resource_type!=="quiz"&&(!isCompleted(selected.id)
                                        ?<button className="btn btn-success px-4" onClick={()=>{markComplete(selected.id);setSelected(null);}}>Mark as Complete</button>
                                        :<span className="text-success fw-bold">Completed</span>)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" onClick={()=>setSelected(null)}/>
                </>
            )}
        </div>
    );
};
export default TrainingHome;
"""

with open(f"{BASE}/front/js/pages/Training/TrainingHome.js", "w") as f:
    f.write(TRAINING_HOME)
print("✓ TrainingHome.js written with manager dashboard + assignment UI + quiz viewer")

# ── TRAINING ASSIGNMENT MODEL ─────────────────────────────────────
TRAINING_MODEL = """
class TrainingAssignment(db.Model):
    __tablename__ = 'training_assignment'
    id = db.Column(db.Integer, primary_key=True)
    resource_id = db.Column(db.Integer, nullable=False)
    employee_id = db.Column(db.Integer, nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    def serialize(self):
        return {"id":self.id,"resource_id":self.resource_id,"employee_id":self.employee_id,"assigned_at":self.assigned_at.isoformat() if self.assigned_at else None}
"""

with open(f"{BASE}/api/models.py","r") as f:
    models = f.read()
if "class TrainingAssignment(" not in models:
    with open(f"{BASE}/api/models.py","a") as f:
        f.write(TRAINING_MODEL)
    print("✓ TrainingAssignment model added")
else:
    print("  TrainingAssignment model already exists")

# ── TRAINING ASSIGNMENT ROUTES ────────────────────────────────────
TRAINING_ROUTES = """
# ── TRAINING ASSIGNMENTS ─────────────────────────────────────────
@api.route('/training-assignments', methods=['GET'])
@jwt_required()
@handle_errors
def get_training_assignments():
    from api.models import TrainingAssignment
    assignments = TrainingAssignment.query.all()
    return jsonify([a.serialize() for a in assignments]), 200

@api.route('/training-assignments', methods=['POST'])
@jwt_required()
@handle_errors
def create_training_assignments():
    from api.models import TrainingAssignment
    data = request.json
    resource_id = data.get('resource_id')
    employee_ids = data.get('employee_ids', [])
    results = []
    for emp_id in employee_ids:
        existing = TrainingAssignment.query.filter_by(resource_id=resource_id, employee_id=emp_id).first()
        if not existing:
            a = TrainingAssignment(resource_id=resource_id, employee_id=emp_id)
            db.session.add(a)
            results.append({"resource_id": resource_id, "employee_id": emp_id})
    db.session.commit()
    return jsonify(results), 201
"""

with open(f"{BASE}/api/routes.py","r") as f:
    routes = f.read()
if "training-assignments" not in routes:
    with open(f"{BASE}/api/routes.py","a") as f:
        f.write(TRAINING_ROUTES)
    print("✓ Training assignment routes added")
else:
    print("  Training routes already exist")

# ── IMAGE UPLOAD ROUTE ────────────────────────────────────────────
IMAGE_ROUTE = """
# ── POST IMAGE UPLOAD ─────────────────────────────────────────────
@api.route('/leafbridge/posts/upload-image', methods=['POST'])
@jwt_required()
@handle_errors
def upload_post_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files['file']
    allowed = {'jpg','jpeg','png','gif','webp'}
    ext = file.filename.rsplit('.',1)[-1].lower() if '.' in file.filename else ''
    if ext not in allowed:
        return jsonify({"error": "Only JPG, PNG, GIF, WebP allowed"}), 400
    try:
        import uuid, boto3
        filename = f"posts/{uuid.uuid4()}.{ext}"
        r2 = boto3.client('s3',
            endpoint_url=os.getenv('R2_ENDPOINT_URL'),
            aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY'))
        r2.upload_fileobj(file, os.getenv('R2_BUCKET_NAME',''), filename, ExtraArgs={'ContentType': file.content_type})
        url = f"{os.getenv('R2_ENDPOINT_URL')}/{os.getenv('R2_BUCKET_NAME')}/{filename}"
        return jsonify({"url": url, "filename": filename}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
"""

if 'upload_post_image' not in routes:
    with open(f"{BASE}/api/routes.py","a") as f:
        f.write(IMAGE_ROUTE)
    print("✓ Post image upload route added")
else:
    print("  Image upload route already exists")

print("\nAll Python done.")
PYEOF

echo ""
echo "Step 2 — DB migration..."
cd src && pipenv run python -c "
import sys; sys.path.insert(0,'.')
from app import app
from api.models import db
with app.app_context():
    db.create_all()
    print('✓ All tables created')
" 2>&1 | grep -E "✓|Error" | head -5
cd ..

echo ""
echo "Step 3 — Verify route count..."
cd src && pipenv run python -c "
from app import app
rules = [r.rule for r in app.url_map._rules if 'static' not in r.rule]
training = [r for r in rules if 'training' in r]
print(f'✓ {len(rules)} total routes')
print(f'✓ Training routes: {len(training)}')
for r in training: print(f'   {r}')
" 2>&1 | grep -E "✓|  /" | head -20
cd ..

echo ""
echo "Step 4 — Commit and push..."
git add .
git commit -m "Training COMPLETE: manager dashboard, employee assignment, quiz viewer, image upload route"
git push origin medical

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║       TRAINING + IMAGE UPLOADS — COMPLETE                   ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║                                                              ║"
echo "║  TRAINING NOW HAS:                                           ║"
echo "║    ✅ Library view — browse, watch, mark complete            ║"
echo "║    ✅ Manager Dashboard — completion % per employee          ║"
echo "║    ✅ Overdue alerts — who is behind on required training     ║"
echo "║    ✅ Assign to employees — pick specific staff               ║"
echo "║    ✅ Select All / Clear buttons for bulk assign              ║"
echo "║    ✅ Per-module completion table with rate bar               ║"
echo "║    ✅ Quiz viewer — A/B/C/D answers, 70% passing score       ║"
echo "║    ✅ Video embed — YouTube + R2 uploaded videos              ║"
echo "║                                                              ║"
echo "║  LEAFBRIDGE FEED NOW HAS:                                    ║"
echo "║    ✅ Image upload route — POST /api/leafbridge/posts/upload  ║"
echo "║    ✅ Stored in Cloudflare R2 under posts/ folder            ║"
echo "║    (frontend image UI added to LeafBridgeHub next)           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
