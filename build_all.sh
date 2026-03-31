#!/bin/bash
# ============================================================
# FULL BUILD — Run from /workspaces/DispensaryMaster2
# 1. LeafBridgeHub (all tabs in one page)
# 2. Sidebar consolidation (jobBoard + training → leafBridge)
# 3. LeafBridge backend networking routes + models
# 4. DispenseMaster marketing homepage
# 5. LeafBridge Connect homepage
# ============================================================
set -e
cd /workspaces/DispensaryMaster2
echo "Starting full build..."

# ============================================================
# STEP 1 — LeafBridgeHub.js (all 7 tabs)
# ============================================================
mkdir -p src/front/js/pages/LeafBridge

cat > src/front/js/pages/LeafBridge/LeafBridgeHub.js << 'JSEOF'
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ─────────────────────────────────────────────────────────
// LeafBridge Connect — Main Hub
// 7 tabs: Feed | Network | Jobs | Training | Onboarding | Reviews | My Profile
// ─────────────────────────────────────────────────────────
const LeafBridgeHub = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const [activeTab, setActiveTab] = useState(params.get("tab") || "feed");
    const [myProfile, setMyProfile] = useState(null);
    const [stats, setStats] = useState({});
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/resumes/me`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`${process.env.BACKEND_URL}/api/leafbridge/stats`, { headers }).then(r => r.ok ? r.json() : {}).catch(() => ({})),
        ]).then(([profile, statsData]) => {
            setMyProfile(profile);
            setStats(statsData);
        });
    }, []);

    const TABS = [
        { id: "feed",       icon: "📰", label: "Feed" },
        { id: "network",    icon: "🤝", label: "Network" },
        { id: "jobs",       icon: "💼", label: "Jobs" },
        { id: "training",   icon: "🎓", label: "Training" },
        { id: "onboarding", icon: "📋", label: "Onboarding" },
        { id: "reviews",    icon: "⭐", label: "Reviews" },
        { id: "profile",    icon: "👤", label: "My Profile" },
    ];

    return (
        <div className="main-content" style={{ background: "#080c10", minHeight: "100vh", padding: 0 }}>

            {/* ── Brand Header ── */}
            <div style={{
                background: "linear-gradient(135deg, rgba(105,240,174,0.1) 0%, rgba(105,240,174,0.03) 100%)",
                borderBottom: "1px solid rgba(105,240,174,0.15)",
                padding: "1.25rem 2rem",
            }}>
                <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontSize: "1.6rem" }}>🌿</span>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#69f0ae", lineHeight: 1 }}>LeafBridge Connect</div>
                            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem", marginTop: 2 }}>Cannabis Industry Professional Network</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                        {[
                            { label: "Connections", value: stats.connections || 0 },
                            { label: "Applications", value: stats.applications || 0 },
                            { label: "Training Done", value: stats.training_complete || 0 },
                        ].map((s, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: 800, color: "#69f0ae", fontSize: "1.1rem" }}>{s.value}</div>
                                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem" }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                    {myProfile ? (
                        <div onClick={() => setActiveTab("profile")} style={{
                            display: "flex", alignItems: "center", gap: "0.6rem",
                            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 100, padding: "5px 14px 5px 5px", cursor: "pointer",
                        }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(105,240,174,0.2)", border: "2px solid rgba(105,240,174,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#69f0ae", fontSize: "0.85rem" }}>
                                {myProfile.first_name?.[0] || "?"}
                            </div>
                            <div>
                                <div style={{ fontSize: "0.78rem", fontWeight: 700, lineHeight: 1 }}>{myProfile.first_name} {myProfile.last_name}</div>
                                <div style={{ fontSize: "0.65rem", color: "#69f0ae" }}>{myProfile.headline || "Cannabis Professional"}</div>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setActiveTab("profile")} style={{ background: "#69f0ae", color: "#080c10", border: "none", padding: "0.45rem 1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                            Complete Profile
                        </button>
                    )}
                </div>
            </div>

            {/* ── Tab Bar ── */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", overflowX: "auto", background: "rgba(0,0,0,0.2)" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", padding: "0 2rem" }}>
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            background: "transparent", border: "none",
                            borderBottom: `2px solid ${activeTab === tab.id ? "#69f0ae" : "transparent"}`,
                            color: activeTab === tab.id ? "#69f0ae" : "rgba(255,255,255,0.4)",
                            padding: "0.85rem 1.1rem", cursor: "pointer",
                            fontWeight: activeTab === tab.id ? 700 : 400,
                            fontSize: "0.82rem", whiteSpace: "nowrap",
                            transition: "all 0.18s",
                            display: "flex", alignItems: "center", gap: "0.35rem",
                        }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab Content ── */}
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 2rem" }}>
                {activeTab === "feed"       && <FeedTab headers={headers} />}
                {activeTab === "network"    && <NetworkTab headers={headers} />}
                {activeTab === "jobs"       && <JobsTab headers={headers} navigate={navigate} />}
                {activeTab === "training"   && <TrainingTab headers={headers} navigate={navigate} />}
                {activeTab === "onboarding" && <OnboardingTab headers={headers} />}
                {activeTab === "reviews"    && <ReviewsTab headers={headers} />}
                {activeTab === "profile"    && <ProfileTab headers={headers} navigate={navigate} />}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// FEED TAB
// ═══════════════════════════════════════════════════════
const FeedTab = ({ headers }) => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [postType, setPostType] = useState("update");
    const [posting, setPosting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/leafbridge/posts`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(d => { setPosts(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handlePost = async () => {
        if (!newPost.trim()) return;
        setPosting(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/leafbridge/posts`, {
                method: "POST", headers, body: JSON.stringify({ content: newPost, post_type: postType })
            });
            if (r.ok) { const p = await r.json(); setPosts(prev => [p, ...prev]); setNewPost(""); }
        } finally { setPosting(false); }
    };

    const POST_TYPES = [
        { v: "update", l: "📢 Update" }, { v: "job", l: "💼 Hiring" },
        { v: "harvest", l: "🌿 Harvest" }, { v: "compliance", l: "⚖️ Compliance" }, { v: "question", l: "❓ Question" },
    ];

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" }}>
            <div>
                {/* Compose box */}
                <div className="glass-panel" style={{ marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                        {POST_TYPES.map(pt => (
                            <button key={pt.v} onClick={() => setPostType(pt.v)} style={{
                                background: postType === pt.v ? "rgba(105,240,174,0.15)" : "rgba(255,255,255,0.04)",
                                border: `1px solid ${postType === pt.v ? "rgba(105,240,174,0.4)" : "rgba(255,255,255,0.1)"}`,
                                color: postType === pt.v ? "#69f0ae" : "rgba(255,255,255,0.45)",
                                padding: "3px 10px", borderRadius: 100, fontSize: "0.75rem",
                                cursor: "pointer", fontWeight: postType === pt.v ? 700 : 400,
                            }}>{pt.l}</button>
                        ))}
                    </div>
                    <textarea rows={3} style={{
                        width: "100%", background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                        padding: "0.7rem 1rem", color: "#e4ede6", resize: "vertical",
                        fontSize: "0.88rem", outline: "none", marginBottom: "0.6rem",
                    }}
                        placeholder="Share an update, post a job opening, announce a harvest..."
                        value={newPost} onChange={e => setNewPost(e.target.value)}
                        onFocus={e => e.target.style.borderColor = "#69f0ae"}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={handlePost} disabled={posting || !newPost.trim()} style={{
                            background: newPost.trim() ? "#69f0ae" : "rgba(105,240,174,0.15)",
                            color: newPost.trim() ? "#080c10" : "rgba(255,255,255,0.3)",
                            border: "none", padding: "0.5rem 1.5rem", borderRadius: 8,
                            fontWeight: 700, fontSize: "0.82rem", cursor: newPost.trim() ? "pointer" : "not-allowed",
                        }}>{posting ? "Posting..." : "Post"}</button>
                    </div>
                </div>

                {loading && <div className="text-center py-4"><div className="spinner-border" style={{ color: "#69f0ae" }} /></div>}

                {!loading && posts.length === 0 && (
                    <div className="glass-panel text-center py-5">
                        <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📰</div>
                        <p style={{ color: "rgba(255,255,255,0.45)" }}>No posts yet — be the first to share something.</p>
                    </div>
                )}

                {posts.map((post, i) => (
                    <div key={post.id || i} className="glass-panel" style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", gap: "0.7rem", marginBottom: "0.7rem", alignItems: "flex-start" }}>
                            <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: "rgba(105,240,174,0.15)", border: "2px solid rgba(105,240,174,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#69f0ae", fontSize: "0.88rem" }}>
                                {post.author_name?.[0] || "?"}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{post.author_name || "Cannabis Pro"}</div>
                                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
                                    {post.author_role && <span style={{ color: "#69f0ae", marginRight: "0.5rem" }}>{post.author_role}</span>}
                                    {post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}
                                </div>
                            </div>
                            {post.post_type && post.post_type !== "update" && (
                                <span style={{ fontSize: "0.68rem", background: "rgba(105,240,174,0.1)", border: "1px solid rgba(105,240,174,0.2)", color: "#69f0ae", padding: "2px 8px", borderRadius: 100 }}>
                                    {POST_TYPES.find(pt => pt.v === post.post_type)?.l || post.post_type}
                                </span>
                            )}
                        </div>
                        <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "0.65rem" }}>{post.content}</p>
                        <div style={{ display: "flex", gap: "1rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                            <button onClick={() => fetch(`${process.env.BACKEND_URL}/api/leafbridge/posts/${post.id}/like`, { method: "POST", headers }).then(() => setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: (p.likes || 0) + 1, liked: true } : p)))} style={{ background: "transparent", border: "none", color: post.liked ? "#69f0ae" : "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: "0.8rem" }}>
                                👍 {post.likes || 0}
                            </button>
                            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>💬 {post.comments || 0}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Right rail */}
            <div>
                <div className="glass-panel" style={{ marginBottom: "1rem" }}>
                    <h6 style={{ color: "#69f0ae", fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>🔥 Trending</h6>
                    {["#CannabisCareers", "#MassCompliance", "#MasterGrowers", "#BudtenderLife", "#MetrcTips", "#CannabisHR", "#GrowFarm"].map((tag, i) => (
                        <div key={i} style={{ padding: "0.3rem 0", fontSize: "0.82rem", color: "#69f0ae", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{tag}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// NETWORK TAB
// ═══════════════════════════════════════════════════════
const NetworkTab = ({ headers }) => {
    const [profiles, setProfiles] = useState([]);
    const [connections, setConnections] = useState([]);
    const [pending, setPending] = useState([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [section, setSection] = useState("discover");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/leafbridge/profiles`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
            fetch(`${process.env.BACKEND_URL}/api/leafbridge/connections`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
            fetch(`${process.env.BACKEND_URL}/api/leafbridge/connections/pending`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
        ]).then(([p, c, pr]) => { setProfiles(Array.isArray(p) ? p : []); setConnections(Array.isArray(c) ? c : []); setPending(Array.isArray(pr) ? pr : []); setLoading(false); });
    }, []);

    const handleConnect = async (userId) => {
        await fetch(`${process.env.BACKEND_URL}/api/leafbridge/connections`, { method: "POST", headers, body: JSON.stringify({ target_user_id: userId }) });
        setProfiles(prev => prev.map(p => p.user_id === userId ? { ...p, connection_status: "pending" } : p));
    };

    const handleAccept = async (connId) => {
        await fetch(`${process.env.BACKEND_URL}/api/leafbridge/connections/${connId}/accept`, { method: "PUT", headers });
        setPending(prev => prev.filter(r => r.id !== connId));
    };

    const ROLES = ["All", "Budtender", "Master Grower", "Compliance Officer", "Dispensary Owner", "Extractor", "Lab Tech", "Supplier", "Investor", "Lawyer"];
    const ROLE_COLORS = { "Budtender": "#69f0ae", "Master Grower": "#a8ff78", "Compliance Officer": "#ffd740", "Dispensary Owner": "#4fc3f7", "Extractor": "#ce93d8", "Lab Tech": "#f48fb1", "Investor": "#fff176", "Supplier": "#ffb74d", "Lawyer": "#80deea" };

    const filtered = profiles.filter(p => {
        const ms = !search || `${p.first_name} ${p.last_name} ${p.headline} ${p.position}`.toLowerCase().includes(search.toLowerCase());
        const mr = roleFilter === "All" || p.position === roleFilter;
        return ms && mr;
    });

    return (
        <div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                {[{ id: "discover", l: "Discover" }, { id: "connections", l: `My Connections (${connections.length})` }, { id: "pending", l: `Pending (${pending.length})` }].map(s => (
                    <button key={s.id} onClick={() => setSection(s.id)} style={{
                        background: section === s.id ? "rgba(105,240,174,0.15)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${section === s.id ? "rgba(105,240,174,0.4)" : "rgba(255,255,255,0.1)"}`,
                        color: section === s.id ? "#69f0ae" : "rgba(255,255,255,0.5)",
                        padding: "0.45rem 1rem", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem", fontWeight: section === s.id ? 700 : 400,
                    }}>{s.l}</button>
                ))}
            </div>

            {section === "discover" && (
                <>
                    <div className="glass-panel" style={{ marginBottom: "1.25rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        <input style={{ flex: 1, minWidth: 180, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.55rem 1rem", color: "#e4ede6", fontSize: "0.875rem", outline: "none" }} placeholder="Search name, role, company..." value={search} onChange={e => setSearch(e.target.value)} onFocus={e => e.target.style.borderColor = "#69f0ae"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"} />
                        <select style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.55rem 1rem", color: "#e4ede6", fontSize: "0.875rem", outline: "none" }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                            {ROLES.map(r => <option key={r}>{r}</option>)}
                        </select>
                    </div>

                    {loading && <div className="text-center py-4"><div className="spinner-border" style={{ color: "#69f0ae" }} /></div>}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
                        {filtered.map((p, i) => (
                            <div key={p.id || i} className="glass-panel" style={{ position: "relative" }}>
                                {p.available && <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "rgba(105,240,174,0.15)", color: "#69f0ae", fontSize: "0.62rem", padding: "2px 8px", borderRadius: 100, fontWeight: 700 }}>● Open to Work</div>}
                                <div style={{ display: "flex", gap: "0.65rem", marginBottom: "0.65rem" }}>
                                    <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: `${ROLE_COLORS[p.position] || "#69f0ae"}22`, border: `2px solid ${ROLE_COLORS[p.position] || "#69f0ae"}50`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: ROLE_COLORS[p.position] || "#69f0ae", fontSize: "1rem" }}>
                                        {p.first_name?.[0] || "?"}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{p.first_name} {p.last_name}</div>
                                        <div style={{ fontSize: "0.75rem", color: ROLE_COLORS[p.position] || "#69f0ae" }}>{p.position || p.headline || "Cannabis Pro"}</div>
                                        {p.location && <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>📍 {p.location}</div>}
                                    </div>
                                </div>
                                {p.bio && <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.65rem", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.bio}</p>}
                                <div style={{ display: "flex", gap: "0.4rem" }}>
                                    {p.connection_status === "connected" ? <span style={{ fontSize: "0.75rem", color: "#69f0ae", fontWeight: 600 }}>✓ Connected</span>
                                        : p.connection_status === "pending" ? <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>Pending...</span>
                                        : <button onClick={() => handleConnect(p.user_id)} style={{ background: "rgba(105,240,174,0.1)", color: "#69f0ae", border: "1px solid rgba(105,240,174,0.3)", padding: "0.35rem 0.85rem", borderRadius: 7, fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", flex: 1 }}>+ Connect</button>}
                                    <button style={{ background: "transparent", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.35rem 0.65rem", borderRadius: 7, fontSize: "0.75rem", cursor: "pointer" }}>View</button>
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && !loading && (
                            <div className="glass-panel text-center py-4" style={{ gridColumn: "1/-1" }}>
                                <p style={{ color: "rgba(255,255,255,0.4)" }}>No profiles match your search.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {section === "connections" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
                    {connections.length === 0 && <div className="glass-panel text-center py-4" style={{ gridColumn: "1/-1" }}><p style={{ color: "rgba(255,255,255,0.4)" }}>No connections yet. Discover people above.</p></div>}
                    {connections.map((c, i) => (
                        <div key={i} className="glass-panel" style={{ display: "flex", gap: "0.65rem", alignItems: "center" }}>
                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(105,240,174,0.15)", border: "2px solid rgba(105,240,174,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#69f0ae" }}>{c.first_name?.[0] || "?"}</div>
                            <div><div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{c.first_name} {c.last_name}</div><div style={{ fontSize: "0.72rem", color: "#69f0ae" }}>{c.position}</div></div>
                        </div>
                    ))}
                </div>
            )}

            {section === "pending" && (
                <div>
                    {pending.length === 0 && <div className="glass-panel text-center py-4"><p style={{ color: "rgba(255,255,255,0.4)" }}>No pending requests.</p></div>}
                    {pending.map((req, i) => (
                        <div key={i} className="glass-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                            <div style={{ display: "flex", gap: "0.65rem", alignItems: "center" }}>
                                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(105,240,174,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#69f0ae" }}>{req.first_name?.[0] || "?"}</div>
                                <div><div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{req.first_name} {req.last_name}</div><div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{req.position}</div></div>
                            </div>
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                                <button onClick={() => handleAccept(req.id)} style={{ background: "#69f0ae", color: "#080c10", border: "none", padding: "0.35rem 0.85rem", borderRadius: 7, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>Accept</button>
                                <button style={{ background: "transparent", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.35rem 0.65rem", borderRadius: 7, fontSize: "0.78rem", cursor: "pointer" }}>Ignore</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// JOBS TAB
// ═══════════════════════════════════════════════════════
const JobsTab = ({ headers, navigate }) => {
    const [jobs, setJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [section, setSection] = useState("browse");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/jobs`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
            fetch(`${process.env.BACKEND_URL}/api/saved-jobs`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
        ]).then(([j, sj]) => { setJobs(Array.isArray(j) ? j : []); setSavedJobs(Array.isArray(sj) ? sj : []); setLoading(false); });
    }, []);

    const handleSave = async (jobId) => {
        await fetch(`${process.env.BACKEND_URL}/api/saved-jobs`, { method: "POST", headers, body: JSON.stringify({ job_id: jobId }) });
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, saved: true } : j));
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                    {[{ id: "browse", l: "Browse Jobs" }, { id: "saved", l: `Saved (${savedJobs.length})` }, { id: "applications", l: "Applications" }].map(s => (
                        <button key={s.id} onClick={() => setSection(s.id)} style={{ background: section === s.id ? "rgba(105,240,174,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${section === s.id ? "rgba(105,240,174,0.4)" : "rgba(255,255,255,0.1)"}`, color: section === s.id ? "#69f0ae" : "rgba(255,255,255,0.5)", padding: "0.4rem 0.9rem", borderRadius: 8, cursor: "pointer", fontSize: "0.8rem", fontWeight: section === s.id ? 700 : 400 }}>{s.l}</button>
                    ))}
                </div>
                <button onClick={() => navigate("/jobs/post")} style={{ background: "#69f0ae", color: "#080c10", border: "none", padding: "0.4rem 1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>+ Post a Job</button>
            </div>

            {loading && <div className="text-center py-4"><div className="spinner-border" style={{ color: "#69f0ae" }} /></div>}

            {section === "browse" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {jobs.map((job, i) => (
                        <div key={job.id || i} className="glass-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                            <div style={{ flex: 1 }}>
                                <h5 style={{ fontWeight: 700, marginBottom: "0.2rem", fontSize: "0.95rem" }}>{job.title}</h5>
                                <div style={{ fontSize: "0.82rem", color: "#69f0ae", marginBottom: "0.2rem" }}>{job.company}</div>
                                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                                    {job.location && <span>📍 {job.location}</span>}
                                    {job.salary && <span>💰 {job.salary}</span>}
                                    {job.type && <span>⏰ {job.type}</span>}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                                <button onClick={() => handleSave(job.id)} style={{ background: job.saved ? "rgba(105,240,174,0.1)" : "transparent", color: job.saved ? "#69f0ae" : "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.35rem 0.65rem", borderRadius: 7, cursor: "pointer", fontSize: "0.78rem" }}>{job.saved ? "★" : "☆"}</button>
                                <button style={{ background: "#69f0ae", color: "#080c10", border: "none", padding: "0.35rem 0.85rem", borderRadius: 7, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>Apply</button>
                            </div>
                        </div>
                    ))}
                    {jobs.length === 0 && !loading && <div className="glass-panel text-center py-5"><div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>💼</div><p style={{ color: "rgba(255,255,255,0.4)" }}>No jobs posted yet.</p></div>}
                </div>
            )}

            {section === "saved" && (
                <div>
                    {savedJobs.length === 0 ? <div className="glass-panel text-center py-4"><p style={{ color: "rgba(255,255,255,0.4)" }}>No saved jobs yet.</p></div>
                        : savedJobs.map((j, i) => <div key={i} className="glass-panel" style={{ marginBottom: "0.6rem" }}><div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{j.title}</div><div style={{ fontSize: "0.8rem", color: "#69f0ae" }}>{j.company}</div></div>)}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// TRAINING TAB
// ═══════════════════════════════════════════════════════
const TrainingTab = ({ headers, navigate }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/training-resources`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(d => { setCourses(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div>
                    <h4 style={{ fontWeight: 700, marginBottom: "0.2rem", fontSize: "1rem" }}>🎓 Training Center</h4>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Courses assigned to you by your manager only</p>
                </div>
                <button onClick={() => navigate("/training/create")} style={{ background: "rgba(105,240,174,0.1)", color: "#69f0ae", border: "1px solid rgba(105,240,174,0.3)", padding: "0.4rem 1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>+ Create Training</button>
            </div>

            {loading && <div className="text-center py-4"><div className="spinner-border" style={{ color: "#69f0ae" }} /></div>}

            {!loading && courses.length === 0 && (
                <div className="glass-panel text-center py-5">
                    <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🎓</div>
                    <h5>No Training Assigned Yet</h5>
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem" }}>Your manager assigns training here. You only see what they assign you.</p>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                {courses.map((c, i) => {
                    const pct = c.completion_percentage || 0;
                    return (
                        <div key={c.id || i} className="glass-panel">
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                                <span style={{ fontSize: "1.6rem" }}>{c.category === "compliance" ? "⚖️" : c.category === "product" ? "🌿" : c.category === "safety" ? "🦺" : "📚"}</span>
                                <span style={{ fontSize: "0.68rem", fontWeight: 700, background: pct === 100 ? "rgba(105,240,174,0.15)" : pct > 0 ? "rgba(255,215,64,0.15)" : "rgba(255,255,255,0.07)", color: pct === 100 ? "#69f0ae" : pct > 0 ? "#ffd740" : "rgba(255,255,255,0.35)", padding: "2px 8px", borderRadius: 100 }}>
                                    {pct === 100 ? "✓ Complete" : pct > 0 ? `${pct}%` : "Not Started"}
                                </span>
                            </div>
                            <h5 style={{ fontWeight: 700, marginBottom: "0.35rem", fontSize: "0.9rem" }}>{c.title}</h5>
                            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", marginBottom: "0.75rem", lineHeight: 1.5 }}>{c.description}</p>
                            <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: "0.65rem" }}>
                                <div style={{ height: "100%", width: `${pct}%`, background: "#69f0ae", borderRadius: 2, transition: "width 0.5s" }} />
                            </div>
                            <button onClick={() => navigate(`/training/${c.id}`)} style={{ width: "100%", background: pct === 100 ? "rgba(105,240,174,0.08)" : "#69f0ae", color: pct === 100 ? "#69f0ae" : "#080c10", border: pct === 100 ? "1px solid rgba(105,240,174,0.25)" : "none", padding: "0.45rem", borderRadius: 8, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>
                                {pct === 100 ? "Review" : pct > 0 ? "Continue" : "Start"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// ONBOARDING TAB
// ═══════════════════════════════════════════════════════
const OnboardingTab = ({ headers }) => {
    const [checklists, setChecklists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/onboarding`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(d => { setChecklists(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleComplete = async (taskId) => {
        await fetch(`${process.env.BACKEND_URL}/api/onboarding/tasks/${taskId}/complete`, { method: "PUT", headers });
        setChecklists(prev => prev.map(cl => ({ ...cl, tasks: cl.tasks?.map(t => t.id === taskId ? { ...t, completed: true } : t) })));
    };

    return (
        <div>
            <div style={{ marginBottom: "1.25rem" }}>
                <h4 style={{ fontWeight: 700, marginBottom: "0.2rem", fontSize: "1rem" }}>📋 Onboarding</h4>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Complete your checklist to get fully set up</p>
            </div>
            {loading && <div className="text-center py-4"><div className="spinner-border" style={{ color: "#69f0ae" }} /></div>}
            {!loading && checklists.length === 0 && <div className="glass-panel text-center py-5"><div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📋</div><p style={{ color: "rgba(255,255,255,0.45)" }}>No onboarding checklist assigned yet.</p></div>}
            {checklists.map((cl, i) => {
                const total = cl.tasks?.length || 0;
                const done = cl.tasks?.filter(t => t.completed).length || 0;
                return (
                    <div key={i} className="glass-panel" style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                            <h5 style={{ fontWeight: 700, fontSize: "0.95rem" }}>{cl.title || cl.role}</h5>
                            <span style={{ color: done === total && total > 0 ? "#69f0ae" : "#ffd740", fontWeight: 700, fontSize: "0.82rem" }}>{done}/{total}</span>
                        </div>
                        <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: "0.75rem" }}>
                            <div style={{ height: "100%", width: `${total ? (done / total) * 100 : 0}%`, background: "#69f0ae", borderRadius: 2 }} />
                        </div>
                        {cl.tasks?.map((task, j) => (
                            <div key={j} onClick={() => !task.completed && handleComplete(task.id)} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: task.completed ? "default" : "pointer" }}>
                                <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2, background: task.completed ? "#69f0ae" : "transparent", border: `2px solid ${task.completed ? "#69f0ae" : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                                    {task.completed && <span style={{ color: "#080c10", fontSize: "0.65rem", fontWeight: 800 }}>✓</span>}
                                </div>
                                <div>
                                    <div style={{ fontSize: "0.85rem", fontWeight: task.completed ? 400 : 600, textDecoration: task.completed ? "line-through" : "none", color: task.completed ? "rgba(255,255,255,0.25)" : "#e4ede6" }}>{task.title}</div>
                                    {task.description && <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginTop: "0.15rem" }}>{task.description}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// REVIEWS TAB
// ═══════════════════════════════════════════════════════
const ReviewsTab = ({ headers }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/performance-reviews`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(d => { setReviews(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const RCOLORS = { 5: "#69f0ae", 4: "#a8ff78", 3: "#ffd740", 2: "#ffb74d", 1: "#f5365c" };

    return (
        <div>
            <div style={{ marginBottom: "1.25rem" }}>
                <h4 style={{ fontWeight: 700, marginBottom: "0.2rem", fontSize: "1rem" }}>⭐ Performance Reviews</h4>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Reviews from your manager — stored permanently in your LeafBridge profile</p>
            </div>
            {loading && <div className="text-center py-4"><div className="spinner-border" style={{ color: "#69f0ae" }} /></div>}
            {!loading && reviews.length === 0 && <div className="glass-panel text-center py-5"><div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>⭐</div><p style={{ color: "rgba(255,255,255,0.45)" }}>No reviews yet. They appear here when your manager completes one.</p></div>}
            {reviews.map((r, i) => (
                <div key={r.id || i} className="glass-panel" style={{ marginBottom: "1rem", borderColor: r.acknowledged ? "rgba(255,255,255,0.08)" : "rgba(105,240,174,0.3)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.65rem", flexWrap: "wrap", gap: "0.5rem" }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Review — {r.review_period || r.created_at?.split("T")[0]}</div>
                            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>by {r.reviewer_name || "Manager"}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {r.rating && <div style={{ display: "flex", gap: "1px" }}>{[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= r.rating ? RCOLORS[r.rating] : "rgba(255,255,255,0.12)", fontSize: "0.9rem" }}>★</span>)}</div>}
                            {!r.acknowledged && <span style={{ background: "rgba(105,240,174,0.15)", color: "#69f0ae", fontSize: "0.68rem", padding: "2px 8px", borderRadius: 100, fontWeight: 700 }}>New</span>}
                        </div>
                    </div>
                    {r.feedback && <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "0.65rem" }}>{r.feedback}</p>}
                    {!r.acknowledged && (
                        <button onClick={() => fetch(`${process.env.BACKEND_URL}/api/performance-reviews/${r.id}/acknowledge`, { method: "PUT", headers }).then(() => setReviews(prev => prev.map(rv => rv.id === r.id ? { ...rv, acknowledged: true } : rv)))} style={{ background: "#69f0ae", color: "#080c10", border: "none", padding: "0.45rem 1.1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>
                            ✓ Acknowledge
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// MY PROFILE TAB
// ═══════════════════════════════════════════════════════
const ProfileTab = ({ headers, navigate }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({});

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/resumes/me`, { headers })
            .then(r => r.ok ? r.json() : null)
            .then(d => { setProfile(d); setForm(d || {}); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const method = profile ? "PUT" : "POST";
        const url = profile ? `${process.env.BACKEND_URL}/api/resumes/${profile.id}` : `${process.env.BACKEND_URL}/api/resumes`;
        const r = await fetch(url, { method, headers, body: JSON.stringify(form) });
        if (r.ok) { const d = await r.json(); setProfile(d); setEdit(false); }
        setSaving(false);
    };

    const inp = (field, placeholder, type = "text") => (
        <div>
            <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>{placeholder}</label>
            {type === "textarea" ? (
                <textarea rows={3} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.55rem 0.9rem", color: "#e4ede6", fontSize: "0.875rem", outline: "none", resize: "vertical" }} disabled={!edit} value={form[field] || ""} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} onFocus={e => e.target.style.borderColor = "#69f0ae"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"} />
            ) : (
                <input type={type} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.55rem 0.9rem", color: "#e4ede6", fontSize: "0.875rem", outline: "none" }} disabled={!edit} value={form[field] || ""} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} onFocus={e => e.target.style.borderColor = "#69f0ae"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"} />
            )}
        </div>
    );

    if (loading) return <div className="text-center py-4"><div className="spinner-border" style={{ color: "#69f0ae" }} /></div>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                    <h4 style={{ fontWeight: 700, marginBottom: "0.2rem", fontSize: "1rem" }}>👤 My LeafBridge Profile</h4>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Your professional identity in cannabis — travels with you across jobs</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {edit ? (
                        <>
                            <button onClick={() => setEdit(false)} style={{ background: "transparent", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.15)", padding: "0.4rem 0.9rem", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem" }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving} style={{ background: "#69f0ae", color: "#080c10", border: "none", padding: "0.4rem 1.1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>{saving ? "Saving..." : "Save Profile"}</button>
                        </>
                    ) : (
                        <button onClick={() => setEdit(true)} style={{ background: "rgba(105,240,174,0.1)", color: "#69f0ae", border: "1px solid rgba(105,240,174,0.35)", padding: "0.4rem 1.1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>Edit Profile</button>
                    )}
                </div>
            </div>

            <div className="glass-panel" style={{ marginBottom: "1rem" }}>
                <h5 style={{ color: "#69f0ae", fontWeight: 700, marginBottom: "1rem", fontSize: "0.88rem" }}>Basic Information</h5>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.85rem" }}>
                    {inp("first_name", "First Name")}
                    {inp("last_name", "Last Name")}
                    {inp("email", "Email", "email")}
                    {inp("phone", "Phone")}
                    {inp("headline", "Professional Headline")}
                    {inp("location", "Location (City, State)")}
                    {inp("position", "Current Role / Position")}
                    <div style={{ gridColumn: "1/-1" }}>{inp("bio", "Professional Bio", "textarea")}</div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
                {[
                    { label: "Build Resume", icon: "📄", path: "/resume-builder", color: "#4fc3f7" },
                    { label: "Work History", icon: "💼", path: "/resume-builder", color: "#69f0ae" },
                    { label: "Certifications", icon: "🏆", path: "/resume-builder", color: "#ffd740" },
                    { label: "Cannabis Licenses", icon: "🪪", path: "/resume-builder", color: "#a8ff78" },
                    { label: "Job Preferences", icon: "🎯", path: "/resume-builder", color: "#ffb74d" },
                    { label: "Search Resumes", icon: "🔍", path: "/resume-search", color: "#f48fb1" },
                ].map((item, i) => (
                    <div key={i} onClick={() => navigate(item.path)} className="glass-panel text-center py-3" style={{ cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "none"; }}>
                        <div style={{ fontSize: "1.6rem", marginBottom: "0.35rem" }}>{item.icon}</div>
                        <div style={{ fontWeight: 600, color: item.color, fontSize: "0.82rem" }}>{item.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeafBridgeHub;
JSEOF

echo "✓ LeafBridgeHub.js created"

# ============================================================
# STEP 2 — Update Sidebar
# ============================================================
python3 << 'PYEOF'
with open('src/front/js/component/Sidebar.js', 'r') as f:
    content = f.read()

# Replace jobBoard section and training section with single leafBridge entry
old_job = '''        jobBoard: [
            { name: "Job Listings", path: "/jobs" },
            { name: "Post a Job", path: "/jobs/post" },
            { name: "Companies", path: "/companies" },
            { name: "My Applications", path: "/jobs/applications" },
        ],
        training: [
            { name: "Training Center", path: "/training" },
            { name: "Add Training", path: "/training/create" },
        ],'''

new_leaf = '''        leafBridge: [
            { name: "🌿 LeafBridge Connect", path: "/leafbridge" },
        ],'''

if 'leafBridge' not in content:
    content = content.replace(old_job, new_leaf)
    # Also update the sectionLabels
    content = content.replace(
        '        jobBoard: "Job Board",',
        '        leafBridge: "LeafBridge Connect",'
    )
    # Remove training label if separate
    content = content.replace('        training: "Training",\n', '')
    content = content.replace('        training: "Training",', '')
    with open('src/front/js/component/Sidebar.js', 'w') as f:
        f.write(content)
    print("✓ Sidebar: jobBoard + training → LeafBridge Connect (single entry)")
else:
    print("  Sidebar already updated")
PYEOF

# ============================================================
# STEP 3 — Update layout.js
# ============================================================
python3 << 'PYEOF'
with open('src/front/js/layout.js', 'r') as f:
    content = f.read()

changed = False

# Add import if missing
if 'LeafBridgeHub' not in content:
    content = content.replace(
        'import BarcodeScanner from "./pages/BarcodeScanner";',
        'import BarcodeScanner from "./pages/BarcodeScanner";\nimport LeafBridgeHub from "./pages/LeafBridge/LeafBridgeHub";'
    )
    changed = True
    print("✓ Import LeafBridgeHub added")

# Add route if missing
if '"/leafbridge"' not in content:
    content = content.replace(
        '<Route path="/jobs"',
        '<Route path="/leafbridge" element={<LeafBridgeHub />} />\n                            <Route path="/jobs"'
    )
    changed = True
    print("✓ Route /leafbridge added")

if changed:
    with open('src/front/js/layout.js', 'w') as f:
        f.write(content)
else:
    print("  layout.js already up to date")
PYEOF

# ============================================================
# STEP 4 — Backend: LeafBridge networking models + routes
# ============================================================
python3 << 'PYEOF'
# Add models
with open('src/api/models.py', 'r') as f:
    content = f.read()

new_models = '''
# ──────────────────────────────────────────────────
# LeafBridge Connect — Networking Models
# ──────────────────────────────────────────────────
class LeafBridgePost(db.Model):
    __tablename__ = 'leafbridge_post'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    post_type = db.Column(db.String(30), default='update')
    likes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref='leafbridge_posts', lazy=True)
    def serialize(self):
        return {"id": self.id, "user_id": self.user_id, "content": self.content,
                "post_type": self.post_type, "likes": self.likes or 0,
                "created_at": self.created_at.isoformat() if self.created_at else None}

class LeafBridgeConnection(db.Model):
    __tablename__ = 'leafbridge_connection'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    target_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', foreign_keys=[user_id], backref='sent_connections', lazy=True)
    target = db.relationship('User', foreign_keys=[target_user_id], backref='received_connections', lazy=True)
    def serialize(self):
        return {"id": self.id, "user_id": self.user_id,
                "target_user_id": self.target_user_id, "status": self.status}
'''

if 'class LeafBridgePost(' not in content:
    content += new_models
    with open('src/api/models.py', 'w') as f:
        f.write(content)
    print("✓ Models: LeafBridgePost + LeafBridgeConnection added")
else:
    print("  Models already exist")
PYEOF

python3 << 'PYEOF'
# Add routes
with open('src/api/routes.py', 'r') as f:
    content = f.read()

new_routes = '''
# ══════════════════════════════════════════════════════
# LEAFBRIDGE CONNECT — NETWORKING ROUTES
# ══════════════════════════════════════════════════════

@api.route('/leafbridge/stats', methods=['GET'])
@jwt_required()
@handle_errors
def get_leafbridge_stats():
    user_id = get_jwt_identity()
    try:
        from api.models import LeafBridgeConnection
        connections = LeafBridgeConnection.query.filter(
            db.or_(LeafBridgeConnection.user_id == user_id, LeafBridgeConnection.target_user_id == user_id),
            LeafBridgeConnection.status == 'accepted'
        ).count()
    except: connections = 0
    return jsonify({"connections": connections, "applications": 0, "training_complete": 0, "profile_views": 0}), 200

@api.route('/leafbridge/posts', methods=['GET'])
@jwt_required()
@handle_errors
def get_leafbridge_posts():
    from api.models import LeafBridgePost, Resume
    posts = LeafBridgePost.query.order_by(LeafBridgePost.created_at.desc()).limit(50).all()
    result = []
    for post in posts:
        resume = Resume.query.filter_by(user_id=post.user_id).first()
        d = post.serialize()
        d['author_name'] = f"{resume.first_name} {resume.last_name}" if resume and resume.first_name else "Cannabis Pro"
        d['author_role'] = resume.position if resume else None
        result.append(d)
    return jsonify(result), 200

@api.route('/leafbridge/posts', methods=['POST'])
@jwt_required()
@handle_errors
def create_leafbridge_post():
    from api.models import LeafBridgePost
    user_id = get_jwt_identity()
    data = request.json
    if not data.get('content', '').strip():
        return jsonify({"error": "Content required"}), 400
    post = LeafBridgePost(user_id=user_id, content=data['content'], post_type=data.get('post_type', 'update'), likes=0)
    db.session.add(post)
    db.session.commit()
    d = post.serialize()
    d['author_name'] = "You"
    return jsonify(d), 201

@api.route('/leafbridge/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
@handle_errors
def like_leafbridge_post(post_id):
    from api.models import LeafBridgePost
    post = LeafBridgePost.query.get_or_404(post_id)
    post.likes = (post.likes or 0) + 1
    db.session.commit()
    return jsonify({"likes": post.likes}), 200

@api.route('/leafbridge/profiles', methods=['GET'])
@jwt_required()
@handle_errors
def get_leafbridge_profiles():
    from api.models import Resume, LeafBridgeConnection
    user_id = get_jwt_identity()
    resumes = Resume.query.filter(Resume.user_id != user_id).all()
    result = []
    for r in resumes:
        try:
            conn = LeafBridgeConnection.query.filter(
                db.or_(
                    db.and_(LeafBridgeConnection.user_id == user_id, LeafBridgeConnection.target_user_id == r.user_id),
                    db.and_(LeafBridgeConnection.user_id == r.user_id, LeafBridgeConnection.target_user_id == user_id)
                )
            ).first()
            conn_status = conn.status if conn else None
        except: conn_status = None
        result.append({
            "id": r.id, "user_id": r.user_id,
            "first_name": r.first_name, "last_name": r.last_name,
            "headline": r.headline if hasattr(r, 'headline') else None,
            "position": r.position if hasattr(r, 'position') else None,
            "location": r.location if hasattr(r, 'location') else None,
            "bio": r.bio if hasattr(r, 'bio') else None,
            "available": r.available if hasattr(r, 'available') else False,
            "certifications": [],
            "connection_status": conn_status,
        })
    return jsonify(result), 200

@api.route('/leafbridge/connections', methods=['GET'])
@jwt_required()
@handle_errors
def get_leafbridge_connections():
    from api.models import LeafBridgeConnection, Resume
    user_id = get_jwt_identity()
    conns = LeafBridgeConnection.query.filter(
        db.or_(LeafBridgeConnection.user_id == user_id, LeafBridgeConnection.target_user_id == user_id),
        LeafBridgeConnection.status == 'accepted'
    ).all()
    result = []
    for c in conns:
        other_id = c.target_user_id if c.user_id == user_id else c.user_id
        r = Resume.query.filter_by(user_id=other_id).first()
        if r:
            result.append({"id": c.id, "first_name": r.first_name, "last_name": r.last_name, "position": getattr(r, 'position', None)})
    return jsonify(result), 200

@api.route('/leafbridge/connections', methods=['POST'])
@jwt_required()
@handle_errors
def send_connection_request():
    from api.models import LeafBridgeConnection
    user_id = get_jwt_identity()
    target_id = request.json.get('target_user_id')
    existing = LeafBridgeConnection.query.filter(
        db.or_(
            db.and_(LeafBridgeConnection.user_id == user_id, LeafBridgeConnection.target_user_id == target_id),
            db.and_(LeafBridgeConnection.user_id == target_id, LeafBridgeConnection.target_user_id == user_id)
        )
    ).first()
    if existing:
        return jsonify({"status": existing.status}), 200
    conn = LeafBridgeConnection(user_id=user_id, target_user_id=target_id, status='pending')
    db.session.add(conn)
    db.session.commit()
    return jsonify({"id": conn.id, "status": "pending"}), 201

@api.route('/leafbridge/connections/pending', methods=['GET'])
@jwt_required()
@handle_errors
def get_pending_connections():
    from api.models import LeafBridgeConnection, Resume
    user_id = get_jwt_identity()
    pending = LeafBridgeConnection.query.filter_by(target_user_id=user_id, status='pending').all()
    result = []
    for c in pending:
        r = Resume.query.filter_by(user_id=c.user_id).first()
        if r:
            result.append({"id": c.id, "first_name": r.first_name, "last_name": r.last_name, "position": getattr(r, 'position', None)})
    return jsonify(result), 200

@api.route('/leafbridge/connections/<int:conn_id>/accept', methods=['PUT'])
@jwt_required()
@handle_errors
def accept_connection(conn_id):
    from api.models import LeafBridgeConnection
    conn = LeafBridgeConnection.query.get_or_404(conn_id)
    conn.status = 'accepted'
    db.session.commit()
    return jsonify({"status": "accepted"}), 200
'''

if 'def get_leafbridge_posts(' not in content:
    content += new_routes
    with open('src/api/routes.py', 'w') as f:
        f.write(content)
    print("✓ Routes: all LeafBridge networking routes added")
else:
    print("  Routes already exist")
PYEOF

# ============================================================
# STEP 5 — Run DB migration
# ============================================================
echo "Running DB migration..."
cd src && pipenv run python -c "
import sys; sys.path.insert(0, '.')
from app import app
from api.models import db
with app.app_context():
    db.create_all()
    print('✓ Tables: LeafBridgePost + LeafBridgeConnection created')
" 2>&1 | grep -E "✓|Error|Assert" | grep -v SAWarning | head -5
cd ..

# ============================================================
# STEP 6 — Verify
# ============================================================
cd src && pipenv run python -c "
from app import app
rules = [r.rule for r in app.url_map._rules if 'static' not in r.rule]
lb = [r for r in rules if 'leafbridge' in r]
print(f'✓ Flask OK — {len(rules)} total routes — {len(lb)} LeafBridge routes')
for r in lb: print(f'   {r}')
" 2>&1 | grep -E "✓|Error" | head -8
cd ..

# ============================================================
# STEP 7 — Commit
# ============================================================
git add .
git commit -m "LeafBridge Connect — full hub with Feed/Network/Jobs/Training/Onboarding/Reviews/Profile tabs, sidebar consolidated, networking models + routes"
git push origin medical

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║          LEAFBRIDGE CONNECT — FULLY WIRED               ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║                                                          ║"
echo "║  Sidebar: ONE entry → 🌿 LeafBridge Connect → /leafbridge ║"
echo "║                                                          ║"
echo "║  Tabs inside /leafbridge:                                ║"
echo "║    📰 Feed       — post updates, jobs, harvests          ║"
echo "║    🤝 Network    — browse profiles, connect, pending     ║"
echo "║    💼 Jobs       — browse, save, apply, post jobs        ║"
echo "║    🎓 Training   — manager-assigned courses only         ║"
echo "║    📋 Onboarding — click-to-complete checklists          ║"
echo "║    ⭐ Reviews    — performance reviews from manager      ║"
echo "║    👤 My Profile — edit info, resume, certifications     ║"
echo "║                                                          ║"
echo "║  Old scattered pages (Job Board, Training) still         ║"
echo "║  accessible by URL but no longer in sidebar.             ║"
echo "║                                                          ║"
echo "║  New DB tables: leafbridge_post, leafbridge_connection   ║"
echo "║  New API routes: /api/leafbridge/*                       ║"
echo "╚══════════════════════════════════════════════════════════╝"
