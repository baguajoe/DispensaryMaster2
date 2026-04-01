import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ─────────────────────────────────────────────────────────────
// LeafBridge Connect — COMPLETE Professional Network
// Tabs: Feed | Network | Messages | Jobs | Training | 
//       Onboarding | Reviews | Groups | Events | Companies |
//       Salary | Notifications | My Profile
// ─────────────────────────────────────────────────────────────


const LaborMarketTab = () => (
    <div style={{ padding: "1.5rem" }}>
        <h3 style={{ color: "#ffab00", fontWeight: 800, marginBottom: "1.5rem" }}>📊 Labor Market Intelligence</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {[
                { label: "Open Positions", value: "2,847", icon: "💼", color: "#ffab00" },
                { label: "Avg Budtender Salary", value: "$38,500", icon: "💰", color: "#4caf50" },
                { label: "States Hiring", value: "38", icon: "🗺️", color: "#ffd740" },
                { label: "YoY Growth", value: "+18%", icon: "📈", color: "#ce93d8" },
                { label: "Compliance Roles", value: "412", icon: "⚖️", color: "#4fc3f7" },
                { label: "Remote Positions", value: "234", icon: "🏠", color: "#ff8a65" },
            ].map((m, i) => (
                <div key={i} style={{ background: "rgba(255,171,0,0.06)", border: "1px solid rgba(255,171,0,0.15)", borderRadius: 12, padding: "1.25rem" }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{m.icon}</div>
                    <div style={{ color: "rgba(255,248,225,0.45)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.label}</div>
                    <div style={{ color: m.color, fontSize: "1.5rem", fontWeight: 900 }}>{m.value}</div>
                </div>
            ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ background: "rgba(255,171,0,0.06)", border: "1px solid rgba(255,171,0,0.15)", borderRadius: 12, padding: "1.25rem" }}>
                <h5 style={{ color: "#ffab00", fontWeight: 700, marginBottom: "1rem" }}>🔥 Most In-Demand Roles</h5>
                {[["Budtender", 1240, "#ffab00"],["Dispensary Manager", 389, "#4caf50"],["Compliance Officer", 312, "#4fc3f7"],["Master Grower", 287, "#ce93d8"],["Delivery Driver", 445, "#ffd740"],["Extraction Tech", 198, "#ff8a65"]].map(([role, count, color]) => (
                    <div key={role} style={{ marginBottom: "0.75rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                            <span style={{ color: "#fff8e1", fontSize: "0.82rem" }}>{role}</span>
                            <span style={{ color, fontWeight: 700, fontSize: "0.82rem" }}>{count} jobs</span>
                        </div>
                        <div style={{ background: "rgba(255,171,0,0.1)", borderRadius: 100, height: 5 }}>
                            <div style={{ background: color, borderRadius: 100, height: 5, width: `${Math.min(100, count/14)}%` }} />
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ background: "rgba(255,171,0,0.06)", border: "1px solid rgba(255,171,0,0.15)", borderRadius: 12, padding: "1.25rem" }}>
                <h5 style={{ color: "#ffab00", fontWeight: 700, marginBottom: "1rem" }}>📍 Top Hiring States</h5>
                {[["California", "$45K avg", 520],["Colorado", "$42K avg", 389],["Massachusetts", "$44K avg", 312],["Michigan", "$38K avg", 287],["Nevada", "$40K avg", 245],["Illinois", "$41K avg", 198]].map(([state, salary, jobs]) => (
                    <div key={state} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,171,0,0.08)" }}>
                        <span style={{ color: "#fff8e1", fontSize: "0.82rem" }}>{state}</span>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ color: "#ffab00", fontWeight: 700, fontSize: "0.78rem" }}>{jobs} jobs</div>
                            <div style={{ color: "rgba(255,248,225,0.4)", fontSize: "0.7rem" }}>{salary}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const LeafBridgeHub = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const [activeTab, setActiveTab] = useState(params.get("tab") || "feed");
    const [myProfile, setMyProfile] = useState(null);
    const [stats, setStats] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/resumes/me`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`${process.env.BACKEND_URL}/api/leafbridge/stats`, { headers }).then(r => r.ok ? r.json() : {}).catch(() => ({})),
            fetch(`${process.env.BACKEND_URL}/api/leafbridge/notifications`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
        ]).then(([profile, statsData, notifs]) => {
            setMyProfile(profile);
            setStats(statsData);
            const notifList = Array.isArray(notifs) ? notifs : [];
            setNotifications(notifList);
            setUnreadCount(notifList.filter(n => !n.read).length);
        });
    }, []);

    const TABS = [
        { id: "feed",        icon: "📰", label: "Feed" },
        { id: "network",     icon: "🤝", label: "Network" },
        { id: "messages",    icon: "💬", label: "Messages", badge: unreadMessages },
        { id: "jobs",        icon: "💼", label: "Jobs" },
        { id: "companies",   icon: "🏢", label: "Companies" },
        { id: "groups",      icon: "👥", label: "Groups" },
        { id: "events",      icon: "📅", label: "Events" },
        { id: "salary",      icon: "💰", label: "Salary" },
        { id: "market",       icon: "📊", label: "Labor Market" },
        { id: "training",    icon: "🎓", label: "Training" },
        { id: "onboarding",  icon: "📋", label: "Onboarding" },
        { id: "reviews",     icon: "⭐", label: "Reviews" },
        { id: "notifications",icon: "🔔", label: "Alerts", badge: unreadCount },
        { id: "profile",     icon: "👤", label: "My Profile" },
    ];

    return (
        <div className="main-content" style={{ background: "#0a0800", minHeight: "100vh", padding: 0 }}>

            {/* Brand Header */}
            <div style={{ background: "linear-gradient(135deg, rgba(255,171,0,0.1) 0%, rgba(105,240,174,0.03) 100%)", borderBottom: "1px solid rgba(255,171,0,0.15)", padding: "1rem 2rem" }}>
                <div style={{ maxWidth: "100%", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontSize: "1.5rem" }}>🌿</span>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "#ffab00" }}>LeafBridge Connect</div>
                            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem" }}>Cannabis Industry Professional Network</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                        {[
                            { label: "Connections", value: stats.connections || 0 },
                            { label: "Profile Views", value: stats.profile_views || 0 },
                            { label: "Applications", value: stats.applications || 0 },
                        ].map((s, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: 800, color: "#ffab00", fontSize: "1rem" }}>{s.value}</div>
                                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.65rem" }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                    {myProfile ? (
                        <div onClick={() => setActiveTab("profile")} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "4px 12px 4px 4px", cursor: "pointer" }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,171,0,0.2)", border: "2px solid rgba(255,171,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#ffab00", fontSize: "0.8rem" }}>
                                {myProfile.first_name?.[0] || "?"}
                            </div>
                            <div>
                                <div style={{ fontSize: "0.75rem", fontWeight: 700 }}>{myProfile.first_name} {myProfile.last_name}</div>
                                <div style={{ fontSize: "0.62rem", color: "#ffab00" }}>{myProfile.position || "Cannabis Pro"}</div>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setActiveTab("profile")} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.4rem 0.9rem", borderRadius: 8, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>Complete Profile</button>
                    )}
                </div>
            </div>

            {/* Tab Bar */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", overflowX: "auto", background: "rgba(0,0,0,0.2)" }}>
                <div style={{ maxWidth: "100%", margin: "0 auto", display: "flex", padding: "0 1rem" }}>
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            background: "transparent", border: "none",
                            borderBottom: `2px solid ${activeTab === tab.id ? "#ffab00" : "transparent"}`,
                            color: activeTab === tab.id ? "#ffab00" : "rgba(255,255,255,0.4)",
                            padding: "0.75rem 0.85rem", cursor: "pointer",
                            fontWeight: activeTab === tab.id ? 700 : 400,
                            fontSize: "0.78rem", whiteSpace: "nowrap",
                            transition: "all 0.18s", position: "relative",
                            display: "flex", alignItems: "center", gap: "0.3rem",
                        }}>
                            {tab.icon} {tab.label}
                            {tab.badge > 0 && (
                                <span style={{ position: "absolute", top: 6, right: 2, background: "#f5365c", color: "white", width: 16, height: 16, borderRadius: "50%", fontSize: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{tab.badge}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div style={{ maxWidth: "100%", margin: "0 auto", padding: "1.5rem 1.5rem" }}>
                {activeTab === "feed"         && <FeedTab headers={headers} myProfile={myProfile} />}
                {activeTab === "network"      && <NetworkTab headers={headers} />}
                {activeTab === "messages"     && <MessagesTab headers={headers} myProfile={myProfile} setUnreadMessages={setUnreadMessages} />}
                {activeTab === "jobs"         && <JobsTab headers={headers} navigate={navigate} />}
                {activeTab === "companies"    && <CompaniesTab headers={headers} />}
                {activeTab === "groups"       && <GroupsTab headers={headers} />}
                {activeTab === "events"       && <EventsTab headers={headers} />}
                {activeTab === "salary"       && <SalaryTab headers={headers} />}
                {activeTab === "market"        && <LaborMarketTab />}
                {activeTab === "training"     && <TrainingTab headers={headers} navigate={navigate} />}
                {activeTab === "onboarding"   && <OnboardingTab headers={headers} />}
                {activeTab === "reviews"      && <ReviewsTab headers={headers} />}
                {activeTab === "notifications"&& <NotificationsTab headers={headers} notifications={notifications} setNotifications={setNotifications} setUnreadCount={setUnreadCount} />}
                {activeTab === "profile"      && <ProfileTab headers={headers} navigate={navigate} myProfile={myProfile} setMyProfile={setMyProfile} />}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════
// FEED TAB — posts, comments, likes, share, polls
// ═══════════════════════════════════════════════════
const FeedTab = ({ headers, myProfile }) => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [postType, setPostType] = useState("update");
    const [posting, setPosting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expandedComments, setExpandedComments] = useState({});
    const [newComments, setNewComments] = useState({});
    const [pollOptions, setPollOptions] = useState(["", ""]);
    const [showPoll, setShowPoll] = useState(false);

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
            const body = { content: newPost, post_type: postType };
            if (showPoll) body.poll_options = pollOptions.filter(o => o.trim());
            const r = await fetch(`${process.env.BACKEND_URL}/api/leafbridge/posts`, { method: "POST", headers, body: JSON.stringify(body) });
            if (r.ok) { const p = await r.json(); setPosts(prev => [p, ...prev]); setNewPost(""); setShowPoll(false); setPollOptions(["", ""]); }
        } finally { setPosting(false); }
    };

    const handleLike = async (postId) => {
        await fetch(`${process.env.BACKEND_URL}/api/leafbridge/posts/${postId}/like`, { method: "POST", headers });
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1, liked: true } : p));
    };

    const handleComment = async (postId) => {
        const content = newComments[postId];
        if (!content?.trim()) return;
        const r = await fetch(`${process.env.BACKEND_URL}/api/leafbridge/posts/${postId}/comments`, { method: "POST", headers, body: JSON.stringify({ content }) });
        if (r.ok) {
            const comment = await r.json();
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), comment], comment_count: (p.comment_count || 0) + 1 } : p));
            setNewComments(prev => ({ ...prev, [postId]: "" }));
        }
    };

    const handleShare = async (post) => {
        const r = await fetch(`${process.env.BACKEND_URL}/api/leafbridge/posts/${post.id}/share`, { method: "POST", headers, body: JSON.stringify({ content: `Sharing: ${post.content.slice(0, 100)}...` }) });
        if (r.ok) { const p = await r.json(); setPosts(prev => [p, ...prev]); }
    };

    const handlePollVote = async (postId, optionIndex) => {
        await fetch(`${process.env.BACKEND_URL}/api/leafbridge/posts/${postId}/poll-vote`, { method: "POST", headers, body: JSON.stringify({ option_index: optionIndex }) });
        setPosts(prev => prev.map(p => {
            if (p.id !== postId) return p;
            const opts = [...(p.poll_options || [])];
            opts[optionIndex] = { ...opts[optionIndex], votes: (opts[optionIndex].votes || 0) + 1 };
            return { ...p, poll_options: opts, user_voted: optionIndex };
        }));
    };

    const POST_TYPES = [
        { v: "update", l: "📢 Update" }, { v: "job", l: "💼 Hiring" },
        { v: "harvest", l: "🌿 Harvest" }, { v: "compliance", l: "⚖️ Compliance" },
        { v: "question", l: "❓ Question" }, { v: "poll", l: "📊 Poll" },
    ];

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.5rem" }}>
            <div>
                {/* Compose */}
                <div className="glass-panel" style={{ marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
                        {POST_TYPES.map(pt => (
                            <button key={pt.v} onClick={() => { setPostType(pt.v); setShowPoll(pt.v === "poll"); }} style={{
                                background: postType === pt.v ? "rgba(255,171,0,0.15)" : "rgba(255,255,255,0.04)",
                                border: `1px solid ${postType === pt.v ? "rgba(255,171,0,0.4)" : "rgba(255,255,255,0.1)"}`,
                                color: postType === pt.v ? "#ffab00" : "rgba(255,255,255,0.45)",
                                padding: "3px 10px", borderRadius: 100, fontSize: "0.72rem", cursor: "pointer", fontWeight: postType === pt.v ? 700 : 400,
                            }}>{pt.l}</button>
                        ))}
                    </div>
                    <textarea rows={3} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "0.7rem 1rem", color: "#e4ede6", resize: "vertical", fontSize: "0.875rem", outline: "none", marginBottom: "0.5rem" }}
                        placeholder="Share an update, job opening, harvest result, compliance news..." value={newPost} onChange={e => setNewPost(e.target.value)}
                        onFocus={e => e.target.style.borderColor = "#ffab00"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                    {showPoll && (
                        <div style={{ marginBottom: "0.75rem" }}>
                            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>Poll Options</div>
                            {pollOptions.map((opt, i) => (
                                <input key={i} value={opt} onChange={e => { const o = [...pollOptions]; o[i] = e.target.value; setPollOptions(o); }}
                                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "0.45rem 0.75rem", color: "#e4ede6", fontSize: "0.82rem", outline: "none", marginBottom: "0.4rem" }}
                                    placeholder={`Option ${i + 1}`} />
                            ))}
                            {pollOptions.length < 4 && (
                                <button onClick={() => setPollOptions([...pollOptions, ""])} style={{ background: "transparent", color: "#ffab00", border: "1px solid rgba(255,171,0,0.3)", padding: "0.3rem 0.75rem", borderRadius: 7, fontSize: "0.75rem", cursor: "pointer" }}>+ Add Option</button>
                            )}
                        </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.4rem 0.75rem", borderRadius: 8, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            &#128247; Add Photo
                            <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={async (e) => {
                                const files = Array.from(e.target.files).slice(0, 4);
                                const urls = [];
                                for (const file of files) {
                                    const fd = new FormData();
                                    fd.append("file", file);
                                    const r = await fetch(`${process.env.BACKEND_URL}/api/leafbridge/posts/upload-image`, {
                                        method: "POST",
                                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                                        body: fd
                                    });
                                    if (r.ok) { const d = await r.json(); urls.push(d.url); }
                                }
                                if (urls.length) setNewPost(prev => prev + (prev ? "\n" : "") + urls.join("\n"));
                            }} />
                        </label>
                        <button onClick={handlePost} disabled={posting || !newPost.trim()} style={{ background: newPost.trim() ? "#ffab00" : "rgba(255,171,0,0.15)", color: newPost.trim() ? "#0a0800" : "rgba(255,255,255,0.3)", border: "none", padding: "0.5rem 1.5rem", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", cursor: newPost.trim() ? "pointer" : "not-allowed" }}>
                            {posting ? "Posting..." : "Post"}
                        </button>
                    </div>
                </div>

                {loading && <div className="text-center py-4"><div className="spinner-border" style={{ color: "#ffab00" }} /></div>}
                {!loading && posts.length === 0 && <div className="glass-panel text-center py-5"><div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📰</div><p style={{ color: "rgba(255,255,255,0.45)" }}>No posts yet.</p></div>}

                {posts.map((post, i) => (
                    <div key={post.id || i} className="glass-panel" style={{ marginBottom: "1rem" }}>
                        {/* Post header */}
                        <div style={{ display: "flex", gap: "0.65rem", marginBottom: "0.65rem", alignItems: "flex-start" }}>
                            <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: "rgba(255,171,0,0.15)", border: "2px solid rgba(255,171,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#ffab00", fontSize: "0.85rem" }}>
                                {post.author_name?.[0] || "?"}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                    <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{post.author_name || "Cannabis Pro"}</span>
                                    {post.author_verified && <span style={{ background: "rgba(255,171,0,0.15)", color: "#ffab00", fontSize: "0.62rem", padding: "1px 6px", borderRadius: 100, fontWeight: 700 }}>✓ Verified</span>}
                                </div>
                                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)" }}>
                                    {post.author_role && <span style={{ color: "#ffab00", marginRight: "0.4rem" }}>{post.author_role}</span>}
                                    {post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}
                                    {post.shared_from && <span style={{ marginLeft: "0.4rem", color: "rgba(255,255,255,0.3)" }}>· Shared</span>}
                                </div>
                            </div>
                        </div>

                        {/* Post content */}
                        <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "0.65rem" }}>{post.content}</p>

                        {/* Poll */}
                        {post.poll_options && post.poll_options.length > 0 && (
                            <div style={{ marginBottom: "0.75rem" }}>
                                {post.poll_options.map((opt, idx) => {
                                    const totalVotes = post.poll_options.reduce((s, o) => s + (o.votes || 0), 0);
                                    const pct = totalVotes ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
                                    const voted = post.user_voted !== undefined;
                                    return (
                                        <div key={idx} onClick={() => !voted && handlePollVote(post.id, idx)} style={{ marginBottom: "0.4rem", cursor: voted ? "default" : "pointer", position: "relative", borderRadius: 8, overflow: "hidden", border: `1px solid ${post.user_voted === idx ? "rgba(255,171,0,0.5)" : "rgba(255,255,255,0.1)"}` }}>
                                            {voted && <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: "rgba(255,171,0,0.12)", transition: "width 0.5s" }} />}
                                            <div style={{ position: "relative", padding: "0.4rem 0.75rem", display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                                                <span>{opt.text || opt}</span>
                                                {voted && <span style={{ color: "#ffab00", fontWeight: 700 }}>{pct}%</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: "0.3rem" }}>{post.poll_options.reduce((s, o) => s + (o.votes || 0), 0)} votes</div>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap" }}>
                            <button onClick={() => handleLike(post.id)} style={{ background: "transparent", border: "none", color: post.liked ? "#ffab00" : "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: "0.78rem", padding: "0.25rem 0.5rem", borderRadius: 6, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                👍 {post.likes || 0}
                            </button>
                            <button onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: "0.78rem", padding: "0.25rem 0.5rem", borderRadius: 6 }}>
                                💬 {post.comment_count || 0} Comments
                            </button>
                            <button onClick={() => handleShare(post)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: "0.78rem", padding: "0.25rem 0.5rem", borderRadius: 6 }}>
                                🔄 Share
                            </button>
                        </div>

                        {/* Comments */}
                        {expandedComments[post.id] && (
                            <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                {(post.comments || []).map((c, ci) => (
                                    <div key={ci} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem" }}>
                                        <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: "rgba(255,171,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 800, color: "#ffab00" }}>
                                            {c.author_name?.[0] || "?"}
                                        </div>
                                        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "0.4rem 0.75rem", flex: 1 }}>
                                            <div style={{ fontSize: "0.72rem", fontWeight: 700, marginBottom: "0.15rem" }}>{c.author_name}</div>
                                            <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)" }}>{c.content}</div>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                                    <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: "rgba(255,171,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 800, color: "#ffab00" }}>
                                        {myProfile?.first_name?.[0] || "?"}
                                    </div>
                                    <input style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "0.35rem 0.85rem", color: "#e4ede6", fontSize: "0.82rem", outline: "none" }}
                                        placeholder="Add a comment..." value={newComments[post.id] || ""}
                                        onChange={e => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                                        onKeyDown={e => e.key === "Enter" && handleComment(post.id)}
                                        onFocus={e => e.target.style.borderColor = "#ffab00"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                                    <button onClick={() => handleComment(post.id)} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.35rem 0.75rem", borderRadius: 20, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>Post</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Right rail */}
            <div>
                <div className="glass-panel" style={{ marginBottom: "1rem" }}>
                    <h6 style={{ color: "#ffab00", fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>🔥 Trending</h6>
                    {["#CannabisCareers", "#MassCompliance", "#MasterGrowers", "#BudtenderLife", "#MetrcTips", "#CannabisHR", "#GrowFarm", "#LeafBridge"].map((tag, i) => (
                        <div key={i} style={{ padding: "0.3rem 0", fontSize: "0.8rem", color: "#ffab00", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{tag}</div>
                    ))}
                </div>
                <div className="glass-panel">
                    <h6 style={{ color: "#ffab00", fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>📰 Cannabis News</h6>
                    {[
                        "MA extends medical cannabis hours",
                        "New Metrc update for CO operators",
                        "Federal rescheduling update 2025",
                        "NY issues 50 new dispensary licenses",
                    ].map((news, i) => (
                        <div key={i} style={{ padding: "0.4rem 0", fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)", lineHeight: 1.4 }}>{news}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════
// MESSAGES TAB — Full DM system
// ═══════════════════════════════════════════════════
const MessagesTab = ({ headers, myProfile, setUnreadMessages }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConvo, setActiveConvo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/leafbridge/conversations`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(d => { setConversations(Array.isArray(d) ? d : []); setLoading(false); setUnreadMessages(0); })
            .catch(() => setLoading(false));
    }, []);

    const loadMessages = async (convo) => {
        setActiveConvo(convo);
        const r = await fetch(`${process.env.BACKEND_URL}/api/leafbridge/conversations/${convo.id}/messages`, { headers });
        if (r.ok) { const msgs = await r.json(); setMessages(Array.isArray(msgs) ? msgs : []); }
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !activeConvo) return;
        setSending(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/leafbridge/conversations/${activeConvo.id}/messages`, {
                method: "POST", headers, body: JSON.stringify({ content: newMessage })
            });
            if (r.ok) {
                const msg = await r.json();
                setMessages(prev => [...prev, msg]);
                setNewMessage("");
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            }
        } finally { setSending(false); }
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 0, height: "600px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
            {/* Conversation list */}
            <div style={{ borderRight: "1px solid rgba(255,255,255,0.08)", overflowY: "auto", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <h5 style={{ fontWeight: 700, color: "#ffab00", marginBottom: "0.5rem", fontSize: "0.9rem" }}>💬 Messages</h5>
                    <input style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "0.4rem 0.75rem", color: "#e4ede6", fontSize: "0.8rem", outline: "none" }} placeholder="Search messages..." onFocus={e => e.target.style.borderColor = "#ffab00"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                </div>
                {loading && <div className="text-center py-4"><div className="spinner-border spinner-border-sm" style={{ color: "#ffab00" }} /></div>}
                {conversations.length === 0 && !loading && (
                    <div style={{ padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "0.82rem" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💬</div>
                        No messages yet.<br />Connect with people to start messaging.
                    </div>
                )}
                {conversations.map((convo, i) => (
                    <div key={i} onClick={() => loadMessages(convo)} style={{
                        padding: "0.85rem 1rem", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)",
                        background: activeConvo?.id === convo.id ? "rgba(255,171,0,0.08)" : "transparent",
                        display: "flex", gap: "0.65rem", alignItems: "flex-start",
                        transition: "background 0.15s",
                    }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: "rgba(255,171,0,0.15)", border: `2px solid ${convo.unread ? "#ffab00" : "rgba(255,171,0,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#ffab00", fontSize: "0.85rem" }}>
                            {convo.other_name?.[0] || "?"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: convo.unread ? 800 : 600, fontSize: "0.82rem", color: convo.unread ? "#fff" : "rgba(255,255,255,0.7)" }}>{convo.other_name}</span>
                                <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.3)" }}>{convo.last_time}</span>
                            </div>
                            <div style={{ fontSize: "0.72rem", color: convo.unread ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{convo.last_message}</div>
                        </div>
                        {convo.unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffab00", flexShrink: 0, marginTop: 4 }} />}
                    </div>
                ))}
            </div>

            {/* Message thread */}
            {activeConvo ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "0.85rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "0.65rem" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,171,0,0.15)", border: "2px solid rgba(255,171,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#ffab00" }}>
                            {activeConvo.other_name?.[0] || "?"}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{activeConvo.other_name}</div>
                            <div style={{ fontSize: "0.68rem", color: "#ffab00" }}>{activeConvo.other_role}</div>
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                        {messages.map((msg, i) => {
                            const isMe = msg.sender_id === myProfile?.user_id;
                            return (
                                <div key={i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                                    <div style={{ maxWidth: "70%", background: isMe ? "#ffab00" : "rgba(255,255,255,0.08)", color: isMe ? "#0a0800" : "#e4ede6", padding: "0.5rem 0.9rem", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px", fontSize: "0.875rem", lineHeight: 1.5 }}>
                                        {msg.content}
                                        <div style={{ fontSize: "0.62rem", color: isMe ? "rgba(10,8,0,0.5)" : "rgba(255,255,255,0.3)", marginTop: "0.2rem", textAlign: isMe ? "right" : "left" }}>{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                    <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: "0.65rem" }}>
                        <input style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "0.5rem 1rem", color: "#e4ede6", fontSize: "0.875rem", outline: "none" }}
                            placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSend()}
                            onFocus={e => e.target.style.borderColor = "#ffab00"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                        <button onClick={handleSend} disabled={sending || !newMessage.trim()} style={{ background: newMessage.trim() ? "#ffab00" : "rgba(255,171,0,0.2)", color: newMessage.trim() ? "#0a0800" : "rgba(255,255,255,0.3)", border: "none", padding: "0.5rem 1.1rem", borderRadius: 20, fontWeight: 700, fontSize: "0.82rem", cursor: newMessage.trim() ? "pointer" : "not-allowed" }}>Send</button>
                    </div>
                </div>
            ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "rgba(255,255,255,0.3)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>💬</div>
                    <p style={{ fontSize: "0.875rem" }}>Select a conversation to start messaging</p>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════
// NETWORK TAB — profiles, connections, endorsements
// ═══════════════════════════════════════════════════
const NetworkTab = ({ headers }) => {
    const [profiles, setProfiles] = useState([]);
    const [connections, setConnections] = useState([]);
    const [pending, setPending] = useState([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [stateFilter, setStateFilter] = useState("All");
    const [section, setSection] = useState("discover");
    const [loading, setLoading] = useState(true);
    const [viewProfile, setViewProfile] = useState(null);

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

    const handleEndorse = async (userId, skill) => {
        await fetch(`${process.env.BACKEND_URL}/api/leafbridge/endorse`, { method: "POST", headers, body: JSON.stringify({ target_user_id: userId, skill }) });
    };

    const handleMessage = async (userId) => {
        await fetch(`${process.env.BACKEND_URL}/api/leafbridge/conversations`, { method: "POST", headers, body: JSON.stringify({ target_user_id: userId }) });
    };

    const ROLES = ["All", "Budtender", "Lead Budtender", "Store Manager", "Master Grower", "Compliance Officer", "Dispensary Owner", "Extractor", "Lab Tech", "Supplier", "Investor", "Lawyer", "Accountant"];
    const STATES = ["All", "MA", "CA", "CO", "IL", "NY", "NV", "OR", "WA", "MI", "AZ", "NJ", "CT", "RI", "ME", "MN"];
    const ROLE_COLORS = { "Budtender": "#ffab00", "Lead Budtender": "#ffab00", "Master Grower": "#a8ff78", "Compliance Officer": "#ffd740", "Dispensary Owner": "#4fc3f7", "Extractor": "#ce93d8", "Lab Tech": "#f48fb1", "Investor": "#fff176", "Supplier": "#ffb74d", "Lawyer": "#80deea", "Accountant": "#80deea", "Store Manager": "#4fc3f7" };

    const filtered = profiles.filter(p => {
        const ms = !search || `${p.first_name} ${p.last_name} ${p.headline} ${p.position} ${p.location}`.toLowerCase().includes(search.toLowerCase());
        const mr = roleFilter === "All" || p.position === roleFilter;
        const mst = stateFilter === "All" || p.location?.includes(stateFilter);
        return ms && mr && mst;
    });

    if (viewProfile) return (
        <div>
            <button onClick={() => setViewProfile(null)} style={{ background: "transparent", color: "#ffab00", border: "1px solid rgba(255,171,0,0.3)", padding: "0.4rem 1rem", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem", marginBottom: "1.25rem" }}>← Back to Network</button>
            <div className="glass-panel">
                <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                    <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${ROLE_COLORS[viewProfile.position] || "#ffab00"}22`, border: `3px solid ${ROLE_COLORS[viewProfile.position] || "#ffab00"}50`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: ROLE_COLORS[viewProfile.position] || "#ffab00", fontSize: "1.5rem", flexShrink: 0 }}>
                        {viewProfile.first_name?.[0] || "?"}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                            <h3 style={{ fontWeight: 800, fontSize: "1.2rem" }}>{viewProfile.first_name} {viewProfile.last_name}</h3>
                            {viewProfile.verified && <span style={{ background: "rgba(255,171,0,0.15)", color: "#ffab00", fontSize: "0.7rem", padding: "2px 8px", borderRadius: 100, fontWeight: 700 }}>✓ Verified</span>}
                            {viewProfile.available && <span style={{ background: "rgba(255,171,0,0.1)", color: "#ffab00", fontSize: "0.7rem", padding: "2px 8px", borderRadius: 100, fontWeight: 600 }}>● Open to Work</span>}
                        </div>
                        <p style={{ color: ROLE_COLORS[viewProfile.position] || "#ffab00", marginBottom: "0.2rem", fontSize: "0.9rem" }}>{viewProfile.position}</p>
                        {viewProfile.location && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>📍 {viewProfile.location}</p>}
                        {viewProfile.bio && <p style={{ color: "rgba(255,255,255,0.65)", marginTop: "0.75rem", fontSize: "0.875rem", lineHeight: 1.6 }}>{viewProfile.bio}</p>}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {viewProfile.connection_status !== "connected" ? (
                            <button onClick={() => handleConnect(viewProfile.user_id)} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.5rem 1.1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>+ Connect</button>
                        ) : (
                            <button onClick={() => handleMessage(viewProfile.user_id)} style={{ background: "rgba(255,171,0,0.1)", color: "#ffab00", border: "1px solid rgba(255,171,0,0.3)", padding: "0.5rem 1.1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>💬 Message</button>
                        )}
                    </div>
                </div>
                {viewProfile.certifications?.length > 0 && (
                    <div style={{ marginBottom: "1.25rem" }}>
                        <h5 style={{ fontWeight: 700, marginBottom: "0.75rem", color: "#ffab00", fontSize: "0.875rem" }}>🏆 Certifications</h5>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {viewProfile.certifications.map((c, i) => (
                                <span key={i} style={{ background: "rgba(255,171,0,0.08)", border: "1px solid rgba(255,171,0,0.2)", color: "rgba(105,240,174,0.8)", padding: "4px 12px", borderRadius: 100, fontSize: "0.75rem" }}>{c.name || c}</span>
                            ))}
                        </div>
                    </div>
                )}
                <div>
                    <h5 style={{ fontWeight: 700, marginBottom: "0.75rem", color: "#ffab00", fontSize: "0.875rem" }}>👍 Endorse Skills</h5>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {["Metrc", "Customer Service", "Compliance", "Inventory", "POS Systems", "Cannabis Knowledge", "Team Leadership"].map((skill, i) => (
                            <button key={i} onClick={() => handleEndorse(viewProfile.user_id, skill)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", padding: "4px 12px", borderRadius: 100, fontSize: "0.75rem", cursor: "pointer", transition: "all 0.15s" }}
                                onMouseEnter={e => { e.target.style.borderColor = "#ffab00"; e.target.style.color = "#ffab00"; }}
                                onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.color = "rgba(255,255,255,0.6)"; }}>
                                + {skill}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                {[{ id: "discover", l: "Discover" }, { id: "connections", l: `My Connections (${connections.length})` }, { id: "pending", l: `Pending (${pending.length})` }].map(s => (
                    <button key={s.id} onClick={() => setSection(s.id)} style={{ background: section === s.id ? "rgba(255,171,0,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${section === s.id ? "rgba(255,171,0,0.4)" : "rgba(255,255,255,0.1)"}`, color: section === s.id ? "#ffab00" : "rgba(255,255,255,0.5)", padding: "0.45rem 1rem", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem", fontWeight: section === s.id ? 700 : 400 }}>{s.l}</button>
                ))}
            </div>

            {section === "discover" && (
                <>
                    <div className="glass-panel" style={{ marginBottom: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        <input style={{ flex: 1, minWidth: 180, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.55rem 1rem", color: "#e4ede6", fontSize: "0.875rem", outline: "none" }} placeholder="Search by name, role, company, location..." value={search} onChange={e => setSearch(e.target.value)} onFocus={e => e.target.style.borderColor = "#ffab00"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"} />
                        <select style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.55rem 0.85rem", color: "#e4ede6", fontSize: "0.82rem", outline: "none" }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>{ROLES.map(r => <option key={r}>{r}</option>)}</select>
                        <select style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.55rem 0.85rem", color: "#e4ede6", fontSize: "0.82rem", outline: "none" }} value={stateFilter} onChange={e => setStateFilter(e.target.value)}>{STATES.map(s => <option key={s}>{s}</option>)}</select>
                    </div>
                    {loading && <div className="text-center py-4"><div className="spinner-border" style={{ color: "#ffab00" }} /></div>}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
                        {filtered.map((p, i) => (
                            <div key={p.id || i} className="glass-panel" style={{ position: "relative", cursor: "pointer" }} onClick={() => setViewProfile(p)}>
                                {p.available && <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "rgba(255,171,0,0.15)", color: "#ffab00", fontSize: "0.62rem", padding: "2px 8px", borderRadius: 100, fontWeight: 700 }}>● Open to Work</div>}
                                {p.verified && <div style={{ position: "absolute", top: p.available ? "1.75rem" : "0.75rem", right: "0.75rem", background: "rgba(255,171,0,0.1)", color: "#ffab00", fontSize: "0.6rem", padding: "1px 6px", borderRadius: 100, fontWeight: 700 }}>✓ Verified</div>}
                                <div style={{ display: "flex", gap: "0.65rem", marginBottom: "0.65rem" }}>
                                    <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: `${ROLE_COLORS[p.position] || "#ffab00"}22`, border: `2px solid ${ROLE_COLORS[p.position] || "#ffab00"}50`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: ROLE_COLORS[p.position] || "#ffab00", fontSize: "1rem" }}>
                                        {p.first_name?.[0] || "?"}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{p.first_name} {p.last_name}</div>
                                        <div style={{ fontSize: "0.72rem", color: ROLE_COLORS[p.position] || "#ffab00" }}>{p.position || "Cannabis Pro"}</div>
                                        {p.location && <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)" }}>📍 {p.location}</div>}
                                    </div>
                                </div>
                                {p.bio && <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.65rem", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.bio}</p>}
                                <div style={{ display: "flex", gap: "0.4rem" }} onClick={e => e.stopPropagation()}>
                                    {p.connection_status === "connected" ? (
                                        <button onClick={() => handleMessage(p.user_id)} style={{ background: "rgba(255,171,0,0.1)", color: "#ffab00", border: "1px solid rgba(255,171,0,0.3)", padding: "0.35rem 0.75rem", borderRadius: 7, fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", flex: 1 }}>💬 Message</button>
                                    ) : p.connection_status === "pending" ? (
                                        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", padding: "0.35rem 0" }}>Request Sent</span>
                                    ) : (
                                        <button onClick={() => handleConnect(p.user_id)} style={{ background: "rgba(255,171,0,0.1)", color: "#ffab00", border: "1px solid rgba(255,171,0,0.3)", padding: "0.35rem 0.75rem", borderRadius: 7, fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", flex: 1 }}>+ Connect</button>
                                    )}
                                    <button onClick={() => setViewProfile(p)} style={{ background: "transparent", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.35rem 0.6rem", borderRadius: 7, fontSize: "0.72rem", cursor: "pointer" }}>View</button>
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && !loading && <div className="glass-panel text-center py-4" style={{ gridColumn: "1/-1" }}><p style={{ color: "rgba(255,255,255,0.4)" }}>No profiles match your search.</p></div>}
                    </div>
                </>
            )}

            {section === "connections" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
                    {connections.length === 0 && <div className="glass-panel text-center py-4" style={{ gridColumn: "1/-1" }}><p style={{ color: "rgba(255,255,255,0.4)" }}>No connections yet.</p></div>}
                    {connections.map((c, i) => (
                        <div key={i} className="glass-panel" style={{ display: "flex", gap: "0.65rem", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", gap: "0.65rem", alignItems: "center" }}>
                                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,171,0,0.15)", border: "2px solid rgba(255,171,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#ffab00" }}>{c.first_name?.[0] || "?"}</div>
                                <div><div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{c.first_name} {c.last_name}</div><div style={{ fontSize: "0.7rem", color: "#ffab00" }}>{c.position}</div></div>
                            </div>
                            <button onClick={() => handleMessage(c.user_id)} style={{ background: "transparent", color: "#ffab00", border: "1px solid rgba(255,171,0,0.3)", padding: "0.3rem 0.6rem", borderRadius: 7, fontSize: "0.72rem", cursor: "pointer" }}>💬</button>
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
                                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,171,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#ffab00" }}>{req.first_name?.[0] || "?"}</div>
                                <div><div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{req.first_name} {req.last_name}</div><div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>{req.position}</div></div>
                            </div>
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                                <button onClick={async () => { await fetch(`${process.env.BACKEND_URL}/api/leafbridge/connections/${req.id}/accept`, { method: "PUT", headers }); setPending(prev => prev.filter(r => r.id !== req.id)); }} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.35rem 0.85rem", borderRadius: 7, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>Accept</button>
                                <button onClick={() => setPending(prev => prev.filter(r => r.id !== req.id))} style={{ background: "transparent", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.35rem 0.65rem", borderRadius: 7, fontSize: "0.78rem", cursor: "pointer" }}>Ignore</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════
// COMPANIES TAB
// ═══════════════════════════════════════════════════
const CompaniesTab = ({ headers }) => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: "", type: "Dispensary", state: "MA", description: "", website: "" });

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/leafbridge/companies`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(d => { setCompanies(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleCreate = async () => {
        const r = await fetch(`${process.env.BACKEND_URL}/api/leafbridge/companies`, { method: "POST", headers, body: JSON.stringify(form) });
        if (r.ok) { const c = await r.json(); setCompanies(prev => [c, ...prev]); setShowCreate(false); }
    };

    const TYPES = ["Dispensary", "Grow Farm", "Seed Bank", "Testing Lab", "Supplier", "Delivery", "Law Firm", "Consulting", "Technology"];
    const TYPE_ICONS = { "Dispensary": "🏪", "Grow Farm": "🌿", "Seed Bank": "🌱", "Testing Lab": "🧪", "Supplier": "🚚", "Delivery": "🛵", "Law Firm": "⚖️", "Consulting": "💼", "Technology": "💻" };

    const filtered = companies.filter(c => !search || `${c.name} ${c.type} ${c.state}`.toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                    <h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>🏢 Company Pages</h4>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Dispensaries, farms, labs, and vendors</p>
                </div>
                <button onClick={() => setShowCreate(!showCreate)} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.45rem 1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>+ Create Company Page</button>
            </div>

            {showCreate && (
                <div className="glass-panel" style={{ marginBottom: "1.25rem", border: "1px solid rgba(255,171,0,0.2)" }}>
                    <h5 style={{ fontWeight: 700, marginBottom: "1rem", color: "#ffab00", fontSize: "0.9rem" }}>Create Company Page</h5>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                        <div><label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.3rem" }}>Company Name</label><input style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.5rem 0.85rem", color: "#e4ede6", fontSize: "0.875rem", outline: "none" }} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                        <div><label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.3rem" }}>Type</label><select style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.5rem 0.85rem", color: "#e4ede6", fontSize: "0.875rem", outline: "none" }} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                        <div><label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.3rem" }}>State</label><select style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.5rem 0.85rem", color: "#e4ede6", fontSize: "0.875rem", outline: "none" }} value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}>{["MA","CA","CO","IL","NY","NV","OR","WA","MI","AZ","NJ","CT","RI"].map(s => <option key={s}>{s}</option>)}</select></div>
                        <div><label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.3rem" }}>Website</label><input style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.5rem 0.85rem", color: "#e4ede6", fontSize: "0.875rem", outline: "none" }} placeholder="https://..." value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} /></div>
                        <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.3rem" }}>Description</label><textarea rows={3} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.5rem 0.85rem", color: "#e4ede6", fontSize: "0.875rem", outline: "none", resize: "vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => setShowCreate(false)} style={{ background: "transparent", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.15)", padding: "0.45rem 1rem", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem" }}>Cancel</button>
                        <button onClick={handleCreate} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.45rem 1.25rem", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>Create Page</button>
                    </div>
                </div>
            )}

            <input style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.55rem 1rem", color: "#e4ede6", fontSize: "0.875rem", outline: "none", marginBottom: "1.25rem" }} placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} onFocus={e => e.target.style.borderColor = "#ffab00"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"} />

            {loading && <div className="text-center py-4"><div className="spinner-border" style={{ color: "#ffab00" }} /></div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                {filtered.map((c, i) => (
                    <div key={i} className="glass-panel">
                        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", alignItems: "flex-start" }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,171,0,0.1)", border: "1px solid rgba(255,171,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>{TYPE_ICONS[c.type] || "🏢"}</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.15rem" }}>{c.name}</div>
                                <div style={{ fontSize: "0.72rem", color: "#ffab00", marginBottom: "0.15rem" }}>{c.type} · {c.state}</div>
                                {c.verified && <span style={{ background: "rgba(255,171,0,0.12)", color: "#ffab00", fontSize: "0.6rem", padding: "1px 6px", borderRadius: 100, fontWeight: 700 }}>✓ Verified</span>}
                            </div>
                        </div>
                        {c.description && <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.75rem", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{c.description}</p>}
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                            <button style={{ background: "rgba(255,171,0,0.08)", color: "#ffab00", border: "1px solid rgba(255,171,0,0.2)", padding: "0.35rem 0.75rem", borderRadius: 7, fontSize: "0.72rem", cursor: "pointer", flex: 1 }}>Follow</button>
                            {c.open_jobs > 0 && <button style={{ background: "transparent", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.35rem 0.75rem", borderRadius: 7, fontSize: "0.72rem", cursor: "pointer" }}>{c.open_jobs} Jobs</button>}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && !loading && <div className="glass-panel text-center py-4" style={{ gridColumn: "1/-1" }}><div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🏢</div><p style={{ color: "rgba(255,255,255,0.4)" }}>No companies yet. Create the first page!</p></div>}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════
// GROUPS TAB
// ═══════════════════════════════════════════════════
const GroupsTab = ({ headers }) => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: "", category: "Compliance", description: "", state: "" });

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/leafbridge/groups`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(d => { setGroups(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => {
                setGroups([
                    { id: 1, name: "MA Compliance Officers", category: "Compliance", members: 47, state: "MA", description: "Massachusetts cannabis compliance professionals" },
                    { id: 2, name: "CO Craft Growers", category: "Cultivation", members: 83, state: "CO", description: "Colorado small batch and craft cannabis cultivators" },
                    { id: 3, name: "Cannabis Lawyers Network", category: "Legal", members: 124, state: "", description: "Attorneys specializing in cannabis law nationwide" },
                    { id: 4, name: "Budtender Community", category: "Retail", members: 891, state: "", description: "For budtenders to share knowledge and support each other" },
                    { id: 5, name: "NY Dispensary Owners", category: "Business", members: 56, state: "NY", description: "New York dispensary operators and licensees" },
                    { id: 6, name: "Cannabis HR Professionals", category: "HR", members: 203, state: "", description: "Human resources for cannabis industry businesses" },
                ]);
                setLoading(false);
            });
    }, []);

    const CATEGORIES = ["Compliance", "Cultivation", "Legal", "Retail", "Business", "HR", "Science", "Advocacy", "Investment"];
    const CAT_ICONS = { "Compliance": "⚖️", "Cultivation": "🌿", "Legal": "👨‍⚖️", "Retail": "🏪", "Business": "💼", "HR": "👔", "Science": "🧪", "Advocacy": "📢", "Investment": "💰" };

    const handleJoin = async (groupId) => {
        await fetch(`${process.env.BACKEND_URL}/api/leafbridge/groups/${groupId}/join`, { method: "POST", headers });
        setGroups(prev => prev.map(g => g.id === groupId ? { ...g, joined: true, members: (g.members || 0) + 1 } : g));
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                    <h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>👥 Industry Groups</h4>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Connect with professionals in your specialty</p>
                </div>
                <button onClick={() => setShowCreate(!showCreate)} style={{ background: "rgba(255,171,0,0.1)", color: "#ffab00", border: "1px solid rgba(255,171,0,0.3)", padding: "0.45rem 1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>+ Create Group</button>
            </div>

            {showCreate && (
                <div className="glass-panel" style={{ marginBottom: "1.25rem", border: "1px solid rgba(255,171,0,0.2)" }}>
                    <h5 style={{ color: "#ffab00", fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.9rem" }}>Create a Group</h5>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem", marginBottom: "0.65rem" }}>
                        <div><label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.25rem" }}>Group Name</label><input style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.45rem 0.75rem", color: "#e4ede6", fontSize: "0.82rem", outline: "none" }} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                        <div><label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.25rem" }}>Category</label><select style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.45rem 0.75rem", color: "#e4ede6", fontSize: "0.82rem", outline: "none" }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                        <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.25rem" }}>Description</label><textarea rows={2} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.45rem 0.75rem", color: "#e4ede6", fontSize: "0.82rem", outline: "none", resize: "vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => setShowCreate(false)} style={{ background: "transparent", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.15)", padding: "0.4rem 0.9rem", borderRadius: 8, cursor: "pointer", fontSize: "0.8rem" }}>Cancel</button>
                        <button onClick={async () => { const r = await fetch(`${process.env.BACKEND_URL}/api/leafbridge/groups`, { method: "POST", headers, body: JSON.stringify(form) }); if (r.ok) { const g = await r.json(); setGroups(prev => [g, ...prev]); setShowCreate(false); } }} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.4rem 1.1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>Create Group</button>
                    </div>
                </div>
            )}

            {loading && <div className="text-center py-4"><div className="spinner-border" style={{ color: "#ffab00" }} /></div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                {groups.map((g, i) => (
                    <div key={g.id || i} className="glass-panel">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                            <span style={{ fontSize: "1.8rem" }}>{CAT_ICONS[g.category] || "👥"}</span>
                            <span style={{ background: "rgba(255,171,0,0.08)", color: "#ffab00", fontSize: "0.65rem", padding: "2px 8px", borderRadius: 100, fontWeight: 600 }}>{g.category}</span>
                        </div>
                        <h5 style={{ fontWeight: 700, marginBottom: "0.25rem", fontSize: "0.9rem" }}>{g.name}</h5>
                        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginBottom: "0.65rem", lineHeight: 1.5 }}>{g.description}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>👥 {g.members} members{g.state && ` · ${g.state}`}</span>
                            <button onClick={() => handleJoin(g.id)} style={{ background: g.joined ? "rgba(255,171,0,0.08)" : "rgba(255,171,0,0.1)", color: "#ffab00", border: "1px solid rgba(255,171,0,0.3)", padding: "0.3rem 0.75rem", borderRadius: 7, fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>{g.joined ? "✓ Joined" : "Join"}</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════
// EVENTS TAB
// ═══════════════════════════════════════════════════
const EventsTab = ({ headers }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ title: "", type: "Job Fair", date: "", location: "", description: "", virtual: false });

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/leafbridge/events`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(d => { setEvents(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => {
                setEvents([
                    { id: 1, title: "Cannabis Career Fair — Boston", type: "Job Fair", date: "2025-05-15", location: "Boston, MA", attendees: 234, description: "Annual cannabis career fair with 30+ employers" },
                    { id: 2, title: "Metrc Compliance Workshop", type: "Workshop", date: "2025-04-20", location: "Virtual", attendees: 89, description: "Deep dive into Metrc reporting requirements" },
                    { id: 3, title: "MA Cannabis Summit 2025", type: "Conference", date: "2025-06-01", location: "Worcester, MA", attendees: 512, description: "The premier cannabis industry conference in Massachusetts" },
                ]);
                setLoading(false);
            });
    }, []);

    const TYPE_ICONS = { "Job Fair": "💼", "Workshop": "🎓", "Conference": "🏛️", "Networking": "🤝", "Webinar": "💻", "Training": "📚" };
    const TYPES = ["Job Fair", "Workshop", "Conference", "Networking", "Webinar", "Training"];

    const handleRSVP = async (eventId) => {
        await fetch(`${process.env.BACKEND_URL}/api/leafbridge/events/${eventId}/rsvp`, { method: "POST", headers });
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, rsvped: true, attendees: (e.attendees || 0) + 1 } : e));
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                    <h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>📅 Industry Events</h4>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Job fairs, conferences, workshops, networking</p>
                </div>
                <button onClick={() => setShowCreate(!showCreate)} style={{ background: "rgba(255,171,0,0.1)", color: "#ffab00", border: "1px solid rgba(255,171,0,0.3)", padding: "0.45rem 1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>+ Create Event</button>
            </div>

            {showCreate && (
                <div className="glass-panel" style={{ marginBottom: "1.25rem", border: "1px solid rgba(255,171,0,0.2)" }}>
                    <h5 style={{ color: "#ffab00", fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.9rem" }}>Create Event</h5>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem", marginBottom: "0.65rem" }}>
                        <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.25rem" }}>Event Title</label><input style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.45rem 0.75rem", color: "#e4ede6", fontSize: "0.82rem", outline: "none" }} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
                        <div><label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.25rem" }}>Type</label><select style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.45rem 0.75rem", color: "#e4ede6", fontSize: "0.82rem", outline: "none" }} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                        <div><label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.25rem" }}>Date</label><input type="date" style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.45rem 0.75rem", color: "#e4ede6", fontSize: "0.82rem", outline: "none" }} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
                        <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.25rem" }}>Location</label><input style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.45rem 0.75rem", color: "#e4ede6", fontSize: "0.82rem", outline: "none" }} placeholder="City, State or Virtual" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
                        <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.25rem" }}>Description</label><textarea rows={2} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.45rem 0.75rem", color: "#e4ede6", fontSize: "0.82rem", outline: "none", resize: "vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => setShowCreate(false)} style={{ background: "transparent", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.15)", padding: "0.4rem 0.9rem", borderRadius: 8, cursor: "pointer", fontSize: "0.8rem" }}>Cancel</button>
                        <button onClick={async () => { const r = await fetch(`${process.env.BACKEND_URL}/api/leafbridge/events`, { method: "POST", headers, body: JSON.stringify(form) }); if (r.ok) { const e = await r.json(); setEvents(prev => [e, ...prev]); setShowCreate(false); } }} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.4rem 1.1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>Create Event</button>
                    </div>
                </div>
            )}

            {loading && <div className="text-center py-4"><div className="spinner-border" style={{ color: "#ffab00" }} /></div>}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {events.map((event, i) => (
                    <div key={event.id || i} className="glass-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", gap: "1rem", flex: 1 }}>
                            <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(255,171,0,0.1)", border: "1px solid rgba(255,171,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>{TYPE_ICONS[event.type] || "📅"}</div>
                            <div>
                                <h5 style={{ fontWeight: 700, marginBottom: "0.2rem", fontSize: "0.9rem" }}>{event.title}</h5>
                                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
                                    <span>📅 {event.date}</span>
                                    <span>📍 {event.location}</span>
                                    <span>👥 {event.attendees} attending</span>
                                </div>
                                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{event.description}</p>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0, flexWrap: "wrap" }}>
                            <button onClick={() => handleRSVP(event.id)} style={{ background: event.rsvped ? "rgba(255,171,0,0.1)" : "#ffab00", color: event.rsvped ? "#ffab00" : "#0a0800", border: event.rsvped ? "1px solid rgba(255,171,0,0.3)" : "none", padding: "0.45rem 1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                                {event.rsvped ? "✓ Going" : "RSVP"}
                            </button>
                            <label style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.45rem 0.75rem", borderRadius: 8, fontSize: "0.72rem", cursor: "pointer" }} title="Upload event photos">
                                &#128247; Photos
                                <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={async (e) => {
                                    const files = Array.from(e.target.files).slice(0, 10);
                                    for (const file of files) {
                                        const fd = new FormData();
                                        fd.append("file", file);
                                        await fetch(`${process.env.BACKEND_URL}/api/leafbridge/events/${event.id}/photos`, {
                                            method: "POST",
                                            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                                            body: fd
                                        });
                                    }
                                    alert(`${files.length} photo(s) uploaded to event!`);
                                }} />
                            </label>
                        </div>
                    </div>
                ))}
                {events.length === 0 && !loading && <div className="glass-panel text-center py-5"><div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📅</div><p style={{ color: "rgba(255,255,255,0.4)" }}>No events yet.</p></div>}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════
// SALARY TAB — cannabis salary insights by role/state
// ═══════════════════════════════════════════════════
const SalaryTab = ({ headers }) => {
    const [stateFilter, setStateFilter] = useState("All");
    const [roleFilter, setRoleFilter] = useState("All");

    const SALARY_DATA = [
        { role: "Budtender", state: "MA", min: 16, max: 22, avg: 18, unit: "hr" },
        { role: "Lead Budtender", state: "MA", min: 19, max: 26, avg: 22, unit: "hr" },
        { role: "Store Manager", state: "MA", min: 55000, max: 80000, avg: 67000, unit: "yr" },
        { role: "General Manager", state: "MA", min: 75000, max: 120000, avg: 95000, unit: "yr" },
        { role: "Compliance Officer", state: "MA", min: 65000, max: 100000, avg: 78000, unit: "yr" },
        { role: "Master Grower", state: "MA", min: 70000, max: 130000, avg: 95000, unit: "yr" },
        { role: "Cultivation Technician", state: "MA", min: 17, max: 24, avg: 20, unit: "hr" },
        { role: "Extraction Technician", state: "MA", min: 20, max: 30, avg: 24, unit: "hr" },
        { role: "Inventory Manager", state: "MA", min: 45000, max: 70000, avg: 55000, unit: "yr" },
        { role: "Budtender", state: "CA", min: 17, max: 25, avg: 20, unit: "hr" },
        { role: "Store Manager", state: "CA", min: 60000, max: 95000, avg: 75000, unit: "yr" },
        { role: "Master Grower", state: "CA", min: 75000, max: 150000, avg: 105000, unit: "yr" },
        { role: "Budtender", state: "CO", min: 15, max: 22, avg: 17, unit: "hr" },
        { role: "Store Manager", state: "CO", min: 50000, max: 75000, avg: 62000, unit: "yr" },
        { role: "Compliance Officer", state: "CO", min: 60000, max: 90000, avg: 72000, unit: "yr" },
    ];

    const ROLES = ["All", ...new Set(SALARY_DATA.map(s => s.role))];
    const STATES = ["All", ...new Set(SALARY_DATA.map(s => s.state))];

    const filtered = SALARY_DATA.filter(s =>
        (stateFilter === "All" || s.state === stateFilter) &&
        (roleFilter === "All" || s.role === roleFilter)
    );

    const fmt = (val, unit) => unit === "hr" ? `$${val}/hr` : `$${val.toLocaleString()}/yr`;

    return (
        <div>
            <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>💰 Cannabis Salary Insights</h4>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Average compensation by role and state</p>
            </div>

            <div className="glass-panel" style={{ marginBottom: "1.25rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <select style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.55rem 0.85rem", color: "#e4ede6", fontSize: "0.82rem", outline: "none" }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>{ROLES.map(r => <option key={r}>{r}</option>)}</select>
                <select style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.55rem 0.85rem", color: "#e4ede6", fontSize: "0.82rem", outline: "none" }} value={stateFilter} onChange={e => setStateFilter(e.target.value)}>{STATES.map(s => <option key={s}>{s}</option>)}</select>
            </div>

            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                            {["Role", "State", "Min", "Max", "Average"].map(h => (
                                <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((s, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                                <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{s.role}</td>
                                <td style={{ padding: "0.75rem 1rem" }}><span style={{ background: "rgba(255,171,0,0.1)", color: "#ffab00", padding: "2px 8px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700 }}>{s.state}</span></td>
                                <td style={{ padding: "0.75rem 1rem", color: "rgba(255,255,255,0.5)" }}>{fmt(s.min, s.unit)}</td>
                                <td style={{ padding: "0.75rem 1rem", color: "rgba(255,255,255,0.5)" }}>{fmt(s.max, s.unit)}</td>
                                <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#ffab00" }}>{fmt(s.avg, s.unit)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p style={{ padding: "0.75rem 1rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.25)" }}>Salary data is based on industry reports and self-reported figures. Actual compensation may vary.</p>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════
// NOTIFICATIONS TAB
// ═══════════════════════════════════════════════════
const NotificationsTab = ({ headers, notifications, setNotifications, setUnreadCount }) => {
    const markAllRead = async () => {
        await fetch(`${process.env.BACKEND_URL}/api/leafbridge/notifications/read-all`, { method: "PUT", headers });
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const NOTIF_ICONS = {
        "connection_request": "🤝",
        "connection_accepted": "✅",
        "post_like": "👍",
        "post_comment": "💬",
        "job_application": "💼",
        "training_assigned": "🎓",
        "review_posted": "⭐",
        "message": "💬",
        "group_invite": "👥",
        "event_reminder": "📅",
        "endorsement": "👍",
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div>
                    <h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>🔔 Notifications</h4>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>{notifications.filter(n => !n.read).length} unread</p>
                </div>
                <button onClick={markAllRead} style={{ background: "transparent", color: "#ffab00", border: "1px solid rgba(255,171,0,0.3)", padding: "0.4rem 0.9rem", borderRadius: 8, fontSize: "0.78rem", cursor: "pointer", fontWeight: 600 }}>Mark All Read</button>
            </div>
            {notifications.length === 0 && (
                <div className="glass-panel text-center py-5">
                    <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔔</div>
                    <p style={{ color: "rgba(255,255,255,0.45)" }}>No notifications yet.</p>
                </div>
            )}
            {notifications.map((notif, i) => (
                <div key={i} onClick={async () => {
                    await fetch(`${process.env.BACKEND_URL}/api/leafbridge/notifications/${notif.id}/read`, { method: "PUT", headers });
                    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }} style={{
                    display: "flex", gap: "0.75rem", padding: "0.85rem 1rem",
                    background: notif.read ? "rgba(255,255,255,0.02)" : "rgba(105,240,174,0.05)",
                    border: `1px solid ${notif.read ? "rgba(255,255,255,0.06)" : "rgba(255,171,0,0.15)"}`,
                    borderRadius: 12, marginBottom: "0.5rem", cursor: "pointer",
                    transition: "background 0.15s",
                }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: notif.read ? "rgba(255,255,255,0.06)" : "rgba(255,171,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
                        {NOTIF_ICONS[notif.type] || "🔔"}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.85rem", color: notif.read ? "rgba(255,255,255,0.6)" : "#e4ede6", fontWeight: notif.read ? 400 : 600, lineHeight: 1.4 }}>{notif.message || "You have a new notification"}</div>
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: "0.2rem" }}>{notif.created_at ? new Date(notif.created_at).toLocaleDateString() : ""}</div>
                    </div>
                    {!notif.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffab00", flexShrink: 0, marginTop: 6 }} />}
                </div>
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════
// JOBS TAB
// ═══════════════════════════════════════════════════
const JobsTab = ({ headers, navigate }) => {
    const [jobs, setJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [section, setSection] = useState("browse");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [stateFilter, setStateFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/jobs`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
            fetch(`${process.env.BACKEND_URL}/api/saved-jobs`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
            fetch(`${process.env.BACKEND_URL}/api/jobs/applications`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
        ]).then(([j, sj, apps]) => { setJobs(Array.isArray(j) ? j : []); setSavedJobs(Array.isArray(sj) ? sj : []); setApplications(Array.isArray(apps) ? apps : []); setLoading(false); });
    }, []);

    const handleSave = async (jobId) => {
        await fetch(`${process.env.BACKEND_URL}/api/saved-jobs`, { method: "POST", headers, body: JSON.stringify({ job_id: jobId }) });
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, saved: true } : j));
    };

    const handleApply = async (jobId) => {
        await fetch(`${process.env.BACKEND_URL}/api/jobs/${jobId}/apply`, { method: "POST", headers });
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, applied: true } : j));
    };

    const ROLES = ["All", "Budtender", "Lead Budtender", "Store Manager", "General Manager", "Master Grower", "Compliance Officer", "Extractor", "Lab Tech", "Delivery Driver", "Security", "Receptionist"];
    const STATES = ["All", "MA", "CA", "CO", "IL", "NY", "NV", "OR", "WA", "MI", "AZ"];
    const TYPES = ["All", "Full Time", "Part Time", "Contract", "Seasonal"];

    const filtered = jobs.filter(j => {
        const ms = !search || `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(search.toLowerCase());
        const mr = roleFilter === "All" || j.title?.includes(roleFilter);
        const mst = stateFilter === "All" || j.location?.includes(stateFilter);
        const mt = typeFilter === "All" || j.type === typeFilter;
        return ms && mr && mst && mt;
    });

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {[{ id: "browse", l: "Browse Jobs" }, { id: "saved", l: `Saved (${savedJobs.length})` }, { id: "applications", l: `Applications (${applications.length})` }].map(s => (
                        <button key={s.id} onClick={() => setSection(s.id)} style={{ background: section === s.id ? "rgba(255,171,0,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${section === s.id ? "rgba(255,171,0,0.4)" : "rgba(255,255,255,0.1)"}`, color: section === s.id ? "#ffab00" : "rgba(255,255,255,0.5)", padding: "0.4rem 0.85rem", borderRadius: 8, cursor: "pointer", fontSize: "0.78rem", fontWeight: section === s.id ? 700 : 400 }}>{s.l}</button>
                    ))}
                </div>
                <button onClick={() => navigate("/jobs/post")} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.4rem 1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>+ Post a Job</button>
            </div>

            {section === "browse" && (
                <>
                    <div className="glass-panel" style={{ marginBottom: "1.25rem", display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
                        <input style={{ flex: 1, minWidth: 160, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.5rem 0.85rem", color: "#e4ede6", fontSize: "0.82rem", outline: "none" }} placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} onFocus={e => e.target.style.borderColor = "#ffab00"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"} />
                        {[{ v: roleFilter, s: setRoleFilter, opts: ROLES }, { v: stateFilter, s: setStateFilter, opts: STATES }, { v: typeFilter, s: setTypeFilter, opts: TYPES }].map((f, i) => (
                            <select key={i} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.5rem 0.75rem", color: "#e4ede6", fontSize: "0.78rem", outline: "none" }} value={f.v} onChange={e => f.s(e.target.value)}>{f.opts.map(o => <option key={o}>{o}</option>)}</select>
                        ))}
                    </div>
                    {loading && <div className="text-center py-4"><div className="spinner-border" style={{ color: "#ffab00" }} /></div>}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                        {filtered.map((job, i) => (
                            <div key={job.id || i} className="glass-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem", flexWrap: "wrap" }}>
                                        <h5 style={{ fontWeight: 700, fontSize: "0.9rem" }}>{job.title}</h5>
                                        {job.urgent && <span style={{ background: "rgba(245,54,92,0.15)", color: "#f5365c", fontSize: "0.62rem", padding: "1px 6px", borderRadius: 100, fontWeight: 700 }}>Urgent</span>}
                                    </div>
                                    <div style={{ fontSize: "0.8rem", color: "#ffab00", marginBottom: "0.2rem" }}>{job.company}</div>
                                    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                                        {job.location && <span>📍 {job.location}</span>}
                                        {job.salary && <span>💰 {job.salary}</span>}
                                        {job.type && <span>⏰ {job.type}</span>}
                                        {job.posted_at && <span>🕐 {new Date(job.posted_at).toLocaleDateString()}</span>}
                                    </div>
                                    {job.requirements?.length > 0 && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.4rem" }}>
                                            {job.requirements.slice(0, 3).map((r, ri) => <span key={ri} style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", padding: "1px 8px", borderRadius: 100, fontSize: "0.68rem" }}>{r}</span>)}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                                    <button onClick={() => handleSave(job.id)} style={{ background: job.saved ? "rgba(255,171,0,0.1)" : "transparent", color: job.saved ? "#ffab00" : "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.35rem 0.6rem", borderRadius: 7, cursor: "pointer", fontSize: "0.75rem" }}>{job.saved ? "★" : "☆"}</button>
                                    <button onClick={() => handleApply(job.id)} disabled={job.applied} style={{ background: job.applied ? "rgba(255,171,0,0.1)" : "#ffab00", color: job.applied ? "#ffab00" : "#0a0800", border: job.applied ? "1px solid rgba(255,171,0,0.3)" : "none", padding: "0.35rem 0.85rem", borderRadius: 7, fontWeight: 700, fontSize: "0.75rem", cursor: job.applied ? "default" : "pointer" }}>{job.applied ? "✓ Applied" : "Apply"}</button>
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && !loading && <div className="glass-panel text-center py-5"><div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>💼</div><p style={{ color: "rgba(255,255,255,0.4)" }}>No jobs match your search.</p></div>}
                    </div>
                </>
            )}

            {section === "saved" && (
                <div>
                    {savedJobs.length === 0 ? <div className="glass-panel text-center py-4"><p style={{ color: "rgba(255,255,255,0.4)" }}>No saved jobs yet.</p></div>
                        : savedJobs.map((j, i) => <div key={i} className="glass-panel" style={{ marginBottom: "0.6rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{j.title}</div><div style={{ fontSize: "0.78rem", color: "#ffab00" }}>{j.company}</div></div><button onClick={() => handleApply(j.id)} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.35rem 0.85rem", borderRadius: 7, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>Apply</button></div>)}
                </div>
            )}

            {section === "applications" && (
                <div>
                    {applications.length === 0 ? <div className="glass-panel text-center py-4"><p style={{ color: "rgba(255,255,255,0.4)" }}>No applications yet.</p></div>
                        : applications.map((app, i) => (
                            <div key={i} className="glass-panel" style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div><div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{app.job_title}</div><div style={{ fontSize: "0.78rem", color: "#ffab00" }}>{app.company}</div><div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : ""}</div></div>
                                <span style={{ background: app.status === "reviewing" ? "rgba(255,215,64,0.15)" : app.status === "rejected" ? "rgba(245,54,92,0.15)" : app.status === "accepted" ? "rgba(255,171,0,0.15)" : "rgba(255,255,255,0.08)", color: app.status === "reviewing" ? "#ffd740" : app.status === "rejected" ? "#f5365c" : app.status === "accepted" ? "#ffab00" : "rgba(255,255,255,0.4)", padding: "3px 10px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700, textTransform: "capitalize" }}>{app.status || "Submitted"}</span>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════
// TRAINING TAB
// ═══════════════════════════════════════════════════
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
                <div><h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>🎓 Training Center</h4><p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Courses assigned to you by your manager</p></div>
                <button onClick={() => navigate("/training/create")} style={{ background: "rgba(255,171,0,0.1)", color: "#ffab00", border: "1px solid rgba(255,171,0,0.3)", padding: "0.4rem 1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>+ Create Training</button>
            </div>
            {loading && <div className="text-center py-4"><div className="spinner-border" style={{ color: "#ffab00" }} /></div>}
            {!loading && courses.length === 0 && <div className="glass-panel text-center py-5"><div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🎓</div><h5>No Training Assigned Yet</h5><p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem", marginTop: "0.5rem" }}>Your manager assigns training here. You only see what they assign you — nothing else.</p></div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                {courses.map((c, i) => {
                    const pct = c.completion_percentage || 0;
                    return (
                        <div key={c.id || i} className="glass-panel">
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                                <span style={{ fontSize: "1.6rem" }}>{c.category === "compliance" ? "⚖️" : c.category === "product" ? "🌿" : c.category === "safety" ? "🦺" : c.category === "customer_service" ? "🤝" : "📚"}</span>
                                <span style={{ fontSize: "0.68rem", fontWeight: 700, background: pct === 100 ? "rgba(255,171,0,0.15)" : pct > 0 ? "rgba(255,215,64,0.15)" : "rgba(255,255,255,0.07)", color: pct === 100 ? "#ffab00" : pct > 0 ? "#ffd740" : "rgba(255,255,255,0.35)", padding: "2px 8px", borderRadius: 100 }}>
                                    {pct === 100 ? "✓ Complete" : pct > 0 ? `${pct}%` : "Not Started"}
                                </span>
                            </div>
                            <h5 style={{ fontWeight: 700, marginBottom: "0.3rem", fontSize: "0.9rem" }}>{c.title}</h5>
                            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginBottom: "0.65rem", lineHeight: 1.5 }}>{c.description}</p>
                            {c.duration && <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", marginBottom: "0.65rem" }}>⏱ {c.duration} mins</p>}
                            <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: "0.65rem" }}>
                                <div style={{ height: "100%", width: `${pct}%`, background: "#ffab00", borderRadius: 2, transition: "width 0.5s" }} />
                            </div>
                            <button onClick={() => navigate(`/training/${c.id}`)} style={{ width: "100%", background: pct === 100 ? "rgba(255,171,0,0.08)" : "#ffab00", color: pct === 100 ? "#ffab00" : "#0a0800", border: pct === 100 ? "1px solid rgba(105,240,174,0.25)" : "none", padding: "0.45rem", borderRadius: 8, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                                {pct === 100 ? "Review" : pct > 0 ? "Continue" : "Start"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════
// ONBOARDING TAB
// ═══════════════════════════════════════════════════
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
            <div style={{ marginBottom: "1.25rem" }}><h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>📋 Onboarding</h4><p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Complete your checklist to get fully set up</p></div>
            {loading && <div className="text-center py-4"><div className="spinner-border" style={{ color: "#ffab00" }} /></div>}
            {!loading && checklists.length === 0 && <div className="glass-panel text-center py-5"><div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📋</div><p style={{ color: "rgba(255,255,255,0.45)" }}>No onboarding checklist assigned yet.</p></div>}
            {checklists.map((cl, i) => {
                const total = cl.tasks?.length || 0;
                const done = cl.tasks?.filter(t => t.completed).length || 0;
                return (
                    <div key={i} className="glass-panel" style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" }}>
                            <h5 style={{ fontWeight: 700, fontSize: "0.9rem" }}>{cl.title || cl.role}</h5>
                            <span style={{ color: done === total && total > 0 ? "#ffab00" : "#ffd740", fontWeight: 700, fontSize: "0.8rem" }}>{done}/{total}</span>
                        </div>
                        <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: "0.65rem" }}>
                            <div style={{ height: "100%", width: `${total ? (done / total) * 100 : 0}%`, background: "#ffab00", borderRadius: 2 }} />
                        </div>
                        {cl.tasks?.map((task, j) => (
                            <div key={j} onClick={() => !task.completed && handleComplete(task.id)} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", padding: "0.45rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: task.completed ? "default" : "pointer" }}>
                                <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2, background: task.completed ? "#ffab00" : "transparent", border: `2px solid ${task.completed ? "#ffab00" : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                                    {task.completed && <span style={{ color: "#0a0800", fontSize: "0.6rem", fontWeight: 800 }}>✓</span>}
                                </div>
                                <div>
                                    <div style={{ fontSize: "0.82rem", fontWeight: task.completed ? 400 : 600, textDecoration: task.completed ? "line-through" : "none", color: task.completed ? "rgba(255,255,255,0.25)" : "#e4ede6" }}>{task.title}</div>
                                    {task.description && <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginTop: "0.15rem" }}>{task.description}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

// ═══════════════════════════════════════════════════
// REVIEWS TAB
// ═══════════════════════════════════════════════════
const ReviewsTab = ({ headers }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const RCOLORS = { 5: "#ffab00", 4: "#a8ff78", 3: "#ffd740", 2: "#ffb74d", 1: "#f5365c" };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/performance-reviews`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(d => { setReviews(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div>
            <div style={{ marginBottom: "1.25rem" }}><h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>⭐ Performance Reviews</h4><p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Stored permanently in your LeafBridge profile</p></div>
            {loading && <div className="text-center py-4"><div className="spinner-border" style={{ color: "#ffab00" }} /></div>}
            {!loading && reviews.length === 0 && <div className="glass-panel text-center py-5"><div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>⭐</div><p style={{ color: "rgba(255,255,255,0.45)" }}>No reviews yet.</p></div>}
            {reviews.map((r, i) => (
                <div key={r.id || i} className="glass-panel" style={{ marginBottom: "1rem", borderColor: r.acknowledged ? "rgba(255,255,255,0.08)" : "rgba(255,171,0,0.3)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.65rem", flexWrap: "wrap", gap: "0.5rem" }}>
                        <div><div style={{ fontWeight: 700, fontSize: "0.875rem" }}>Review — {r.review_period || r.created_at?.split("T")[0]}</div><div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>by {r.reviewer_name || "Manager"}</div></div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {r.rating && <div style={{ display: "flex", gap: "1px" }}>{[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= r.rating ? RCOLORS[r.rating] : "rgba(255,255,255,0.12)", fontSize: "0.9rem" }}>★</span>)}</div>}
                            {!r.acknowledged && <span style={{ background: "rgba(255,171,0,0.15)", color: "#ffab00", fontSize: "0.65rem", padding: "2px 8px", borderRadius: 100, fontWeight: 700 }}>New</span>}
                        </div>
                    </div>
                    {r.feedback && <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "0.65rem" }}>{r.feedback}</p>}
                    {r.goals && <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "0.6rem 0.85rem", marginBottom: "0.65rem" }}><div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.2rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Goals</div><p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>{r.goals}</p></div>}
                    {!r.acknowledged && (
                        <button onClick={() => fetch(`${process.env.BACKEND_URL}/api/performance-reviews/${r.id}/acknowledge`, { method: "PUT", headers }).then(() => setReviews(prev => prev.map(rv => rv.id === r.id ? { ...rv, acknowledged: true } : rv)))} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.4rem 1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>✓ Acknowledge</button>
                    )}
                </div>
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════
// MY PROFILE TAB
// ═══════════════════════════════════════════════════
const ProfileTab = ({ headers, navigate, myProfile, setMyProfile }) => {
    const [form, setForm] = useState(myProfile || {});
    const [edit, setEdit] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [galleryUploading, setGalleryUploading] = useState(false);
    const [lightboxPhoto, setLightboxPhoto] = useState(null);

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/leafbridge/profile/gallery`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(d => setGallery(Array.isArray(d) ? d : []))
            .catch(() => {});
    }, []);

    const handleGalleryUpload = async (files) => {
        if (!files.length) return;
        setGalleryUploading(true);
        for (const file of Array.from(files).slice(0, 10)) {
            const formData = new FormData();
            formData.append("file", file);
            try {
                const r = await fetch(`${process.env.BACKEND_URL}/api/leafbridge/profile/gallery`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    body: formData
                });
                if (r.ok) {
                    const photo = await r.json();
                    setGallery(prev => [photo, ...prev]);
                }
            } catch(e) { console.error(e); }
        }
        setGalleryUploading(false);
    };

    const handleDeleteGalleryPhoto = async (photoId) => {
        await fetch(`${process.env.BACKEND_URL}/api/leafbridge/profile/gallery/${photoId}`, {
            method: "DELETE", headers
        });
        setGallery(prev => prev.filter(p => p.id !== photoId));
    };

    useEffect(() => { if (myProfile) setForm(myProfile); }, [myProfile]);

    const handleSave = async () => {
        setSaving(true);
        const method = myProfile?.id ? "PUT" : "POST";
        const url = myProfile?.id ? `${process.env.BACKEND_URL}/api/resumes/${myProfile.id}` : `${process.env.BACKEND_URL}/api/resumes`;
        const r = await fetch(url, { method, headers, body: JSON.stringify(form) });
        if (r.ok) { const d = await r.json(); setMyProfile(d); setEdit(false); }
        setSaving(false);
    };

    const handlePhotoUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("doc_type", "profile_photo");
        const r = await fetch(`${process.env.BACKEND_URL}/api/leafbridge/profile/photo`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, body: formData });
        if (r.ok) { const d = await r.json(); setProfilePhoto(d.url); }
    };

    const inp = (field, label, type = "text") => (
        <div>
            <label style={{ display: "block", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>{label}</label>
            {type === "textarea" ? (
                <textarea rows={3} disabled={!edit} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.5rem 0.85rem", color: "#e4ede6", fontSize: "0.875rem", outline: "none", resize: "vertical" }} value={form[field] || ""} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
            ) : (
                <input type={type} disabled={!edit} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0.5rem 0.85rem", color: "#e4ede6", fontSize: "0.875rem", outline: "none" }} value={form[field] || ""} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} onFocus={e => e.target.style.borderColor = "#ffab00"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"} />
            )}
        </div>
    );

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div><h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>👤 My LeafBridge Profile</h4><p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Your professional identity — travels with you across jobs</p></div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {edit ? (
                        <>
                            <button onClick={() => setEdit(false)} style={{ background: "transparent", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.15)", padding: "0.4rem 0.85rem", borderRadius: 8, cursor: "pointer", fontSize: "0.8rem" }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.4rem 1.1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>{saving ? "Saving..." : "Save Profile"}</button>
                        </>
                    ) : (
                        <button onClick={() => setEdit(true)} style={{ background: "rgba(255,171,0,0.1)", color: "#ffab00", border: "1px solid rgba(105,240,174,0.35)", padding: "0.4rem 1.1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>Edit Profile</button>
                    )}
                </div>
            </div>

            {/* Profile photo */}
            <div className="glass-panel" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
                <div style={{ position: "relative" }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,171,0,0.15)", border: "3px solid rgba(255,171,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#ffab00", fontSize: "1.5rem", overflow: "hidden" }}>
                        {profilePhoto ? <img src={profilePhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (form.first_name?.[0] || "?")}
                    </div>
                    <label style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: "#ffab00", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.75rem", boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }} title="Upload profile photo">
                        &#128247;
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files[0] && handlePhotoUpload(e.target.files[0])} />
                    </label>
                </div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{form.first_name} {form.last_name}</div>
                    <div style={{ color: "#ffab00", fontSize: "0.85rem" }}>{form.position || form.headline || "Cannabis Professional"}</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>📍 {form.location || "Location not set"}</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.78rem" }}>
                        <div onClick={() => setForm(f => ({ ...f, available: !f.available }))} style={{ width: 36, height: 20, borderRadius: 10, background: form.available ? "#ffab00" : "rgba(255,255,255,0.12)", position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
                            <div style={{ position: "absolute", top: 2, left: form.available ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "rgba(255,171,0,0.08)", transition: "left 0.2s" }} />
                        </div>
                        <span style={{ color: form.available ? "#ffab00" : "rgba(255,255,255,0.35)", fontWeight: 600 }}>Open to Work</span>
                    </label>
                </div>
            </div>

            <div className="glass-panel" style={{ marginBottom: "1rem" }}>
                <h5 style={{ color: "#ffab00", fontWeight: 700, marginBottom: "0.85rem", fontSize: "0.875rem" }}>Basic Information</h5>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
                    {inp("first_name", "First Name")}
                    {inp("last_name", "Last Name")}
                    {inp("email", "Email", "email")}
                    {inp("phone", "Phone")}
                    {inp("headline", "Professional Headline")}
                    {inp("position", "Current Role")}
                    {inp("location", "Location (City, State)")}
                    {inp("years_experience", "Years in Cannabis")}
                    <div style={{ gridColumn: "1/-1" }}>{inp("bio", "Professional Bio", "textarea")}</div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.65rem" }}>
                {[
                    { label: "Build Resume", icon: "📄", path: "/resume-builder", color: "#4fc3f7" },
                    { label: "Work History", icon: "💼", path: "/resume-builder", color: "#ffab00" },
                    { label: "Certifications", icon: "🏆", path: "/resume-builder", color: "#ffd740" },
                    { label: "Cannabis Licenses", icon: "🪪", path: "/resume-builder", color: "#a8ff78" },
                    { label: "Job Preferences", icon: "🎯", path: "/resume-builder", color: "#ffb74d" },
                    { label: "Search Resumes", icon: "🔍", path: "/resume-search", color: "#f48fb1" },
                    { label: "Skills & Endorsements", icon: "👍", path: "/leafbridge?tab=network", color: "#ce93d8" },
                    { label: "My Applications", icon: "📋", path: "/leafbridge?tab=jobs", color: "#80deea" },
                ].map((item, i) => (
                    <div key={i} onClick={() => navigate(item.path)} className="glass-panel text-center py-3" style={{ cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "none"; }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>{item.icon}</div>
                        <div style={{ fontWeight: 600, color: item.color, fontSize: "0.78rem" }}>{item.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeafBridgeHub;
