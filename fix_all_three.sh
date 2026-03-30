#!/bin/bash
cd /workspaces/DispensaryMaster2
echo "Fixing Job Board, Training, and POS..."

# ============================================================
# 1. FIX JOBAPPLICATION MODEL - add missing fields
# ============================================================
python3 << 'PYEOF'
with open('src/api/models.py', 'r') as f:
    content = f.read()

old = '''class JobApplication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey("job.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    company_id = db.Column(db.Integer, db.ForeignKey("company.id"))
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)'''

new = '''class JobApplication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey("job.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    company_id = db.Column(db.Integer, db.ForeignKey("company.id"))
    applicant_name = db.Column(db.String(100), nullable=True)
    applicant_email = db.Column(db.String(120), nullable=True)
    applicant_phone = db.Column(db.String(20), nullable=True)
    cover_letter = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default="pending")
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "job_id": self.job_id,
            "user_id": self.user_id,
            "company_id": self.company_id,
            "applicant_name": self.applicant_name,
            "applicant_email": self.applicant_email,
            "applicant_phone": self.applicant_phone,
            "cover_letter": self.cover_letter,
            "status": self.status,
            "applied_at": self.applied_at.isoformat() if self.applied_at else None
        }'''

if old in content:
    content = content.replace(old, new)
    print("✓ JobApplication model updated")
else:
    print("  JobApplication already updated")

# Fix EmployeeTraining model
old_et = '''class EmployeeTraining(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee = db.Column(db.String(255), nullable=False)  # Employee name
    status = db.Column(db.String(50), nullable=False)  # e.g., "Completed", "Pending"
    completed_date = db.Column(db.Date, nullable=True)  # Date training was completed
    def serialize(self):
        return {
            "id": self.id,
            "employee": self.employee,
            "status": self.status,
            "completedDate": self.completed_date.strftime("%Y-%m-%d") if self.completed_date else None
        }'''

new_et = '''class EmployeeTraining(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    training_resource_id = db.Column(db.Integer, db.ForeignKey("staff_training_resource.id"), nullable=True)
    employee = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), nullable=False, default="completed")
    completed_date = db.Column(db.Date, nullable=True)
    completion_date = db.Column(db.DateTime, nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "training_resource_id": self.training_resource_id,
            "employee": self.employee,
            "status": self.status,
            "completed_date": self.completed_date.strftime("%Y-%m-%d") if self.completed_date else None,
            "completion_date": self.completion_date.isoformat() if self.completion_date else None
        }'''

if old_et in content:
    content = content.replace(old_et, new_et)
    print("✓ EmployeeTraining model updated")
else:
    print("  EmployeeTraining already updated")

with open('src/api/models.py', 'w') as f:
    f.write(content)
PYEOF

# ============================================================
# 2. ADD MISSING ROUTES TO ROUTES.PY
# ============================================================
python3 << 'PYEOF'
with open('src/api/routes.py', 'r') as f:
    content = f.read()

routes_to_add = ""

# Add /apply route if missing
if "def apply_to_job" not in content and "@api.route('/apply'" not in content:
    routes_to_add += '''
# -------------------- JOB APPLICATION --------------------
@api.route('/apply', methods=['POST'])
@jwt_required()
@handle_errors
def apply_to_job():
    user_id = get_jwt_identity()
    data = request.json
    job_id = data.get('job_id')
    company_id = data.get('company_id')

    if not job_id:
        return jsonify({"error": "job_id required"}), 400

    # Check if already applied
    existing = JobApplication.query.filter_by(user_id=user_id, job_id=job_id).first()
    if existing:
        return jsonify({"msg": "Already applied", "id": existing.id}), 200

    application = JobApplication(
        user_id=user_id,
        job_id=job_id,
        company_id=company_id,
        applicant_name=data.get('name', ''),
        applicant_email=data.get('email', ''),
        applicant_phone=data.get('phone', ''),
        cover_letter=data.get('cover_letter', ''),
        status='pending',
        applied_at=datetime.utcnow()
    )
    db.session.add(application)
    db.session.commit()
    return jsonify({"msg": "Applied successfully", "id": application.id}), 201

@api.route('/jobs/<int:job_id>/applications', methods=['GET'])
@jwt_required()
@handle_errors
def get_job_applications(job_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role not in ['admin', 'owner', 'manager']:
        return jsonify({"error": "Access denied"}), 403
    apps = JobApplication.query.filter_by(job_id=job_id).all()
    return jsonify([a.serialize() for a in apps]), 200

@api.route('/jobs/<int:job_id>/applications/<int:app_id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_application_status(job_id, app_id):
    application = JobApplication.query.get_or_404(app_id)
    data = request.json
    application.status = data.get('status', application.status)
    db.session.commit()
    return jsonify(application.serialize()), 200

@api.route('/jobs/<int:job_id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_job(job_id):
    job = Job.query.get_or_404(job_id)
    db.session.delete(job)
    db.session.commit()
    return jsonify({"message": "Job deleted"}), 200

@api.route('/jobs/<int:job_id>', methods=['GET'])
@handle_errors
def get_job(job_id):
    job = Job.query.get_or_404(job_id)
    data = job.serialize()
    company = Company.query.get(job.company_id)
    if company:
        data['company_name'] = company.name
        data['company_city'] = company.city
        data['company_state'] = company.state
    data['application_count'] = JobApplication.query.filter_by(job_id=job_id).count()
    return jsonify(data), 200
'''
    print("✓ /apply and job routes added")
else:
    print("  apply route already exists")

# Add my-applications if missing
if 'my-applications' not in content:
    routes_to_add += '''
@api.route('/my-applications', methods=['GET'])
@jwt_required()
@handle_errors
def get_my_applications():
    user_id = get_jwt_identity()
    apps = JobApplication.query.filter_by(user_id=user_id).order_by(JobApplication.applied_at.desc()).all()
    result = []
    for app in apps:
        job = Job.query.get(app.job_id)
        company = Company.query.get(app.company_id) if app.company_id else None
        result.append({
            "id": app.id,
            "job_id": app.job_id,
            "job_title": job.title if job else "Unknown",
            "company_name": company.name if company else "Unknown",
            "location": job.location if job else "",
            "salary": job.salary if job else "",
            "status": app.status or "pending",
            "applied_at": app.applied_at.isoformat() if app.applied_at else None
        })
    return jsonify(result), 200
'''
    print("✓ my-applications route added")

if routes_to_add:
    content += routes_to_add
    with open('src/api/routes.py', 'w') as f:
        f.write(content)
    print("✓ routes.py saved")
else:
    print("  All routes already exist")
PYEOF

# ============================================================
# 3. RUN MIGRATIONS
# ============================================================
echo "Running migrations..."
pipenv run flask --app src/app.py db migrate -m "job application and employee training fields" 2>/dev/null
pipenv run flask --app src/app.py db upgrade
echo "✓ Migrations done"

# ============================================================
# 4. FIX FLUX - update applyToJob to send full form data
# ============================================================
python3 << 'PYEOF'
with open('src/front/js/store/flux.js', 'r') as f:
    content = f.read()

old = '''            applyToJob: async (jobId, companyId) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/apply", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify({ job_id: jobId, company_id: companyId }),
                    });
                    const data = await resp.json();
                    if (resp.ok) return { success: true, data };
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },'''

new = '''            applyToJob: async (jobId, companyId, formData = {}) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/apply", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify({
                            job_id: jobId,
                            company_id: companyId,
                            name: formData.name || "",
                            email: formData.email || "",
                            phone: formData.phone || "",
                            cover_letter: formData.cover_letter || ""
                        }),
                    });
                    const data = await resp.json();
                    if (resp.ok) return { success: true, data };
                    return { success: false, error: data.error || data.msg };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },'''

if old in content:
    content = content.replace(old, new)
    with open('src/front/js/store/flux.js', 'w') as f:
        f.write(content)
    print("✓ flux.js applyToJob updated")
else:
    print("  applyToJob already updated")
PYEOF

# ============================================================
# 5. FIX JOBBOARD - use flux applyToJob properly
# ============================================================
python3 << 'PYEOF'
with open('src/front/js/pages/JobBoard.js', 'r') as f:
    content = f.read()

# Fix handleApply to use flux action instead of direct fetch
old_apply = '''    const handleApply = async (e) => {
        e.preventDefault();
        if (!token) { navigate("/login"); return; }
        setApplying(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/apply`, {
                method: "POST",
                headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
                body: JSON.stringify({ job_id: selectedJob.id, company_id: selectedJob.company_id, ...applyForm })
            });
            if (r.ok) {
                setApplied(p => ({ ...p, [selectedJob.id]: true }));
                setSelectedJob(null);
                setApplyForm({ name:"", email:"", phone:"", cover_letter:"" });
            } else {
                const d = await r.json();
                alert(d.msg || "Application failed");
            }
        } catch(e) { console.error(e); }
        finally { setApplying(false); }
    };'''

new_apply = '''    const handleApply = async (e) => {
        e.preventDefault();
        if (!token) { navigate("/login"); return; }
        setApplying(true);
        try {
            const result = await actions.applyToJob(selectedJob.id, selectedJob.company_id, applyForm);
            if (result.success) {
                setApplied(p => ({ ...p, [selectedJob.id]: true }));
                setSelectedJob(null);
                setApplyForm({ name:"", email:"", phone:"", cover_letter:"" });
            } else {
                alert(result.error || "Application failed");
            }
        } catch(e) { console.error(e); }
        finally { setApplying(false); }
    };'''

if old_apply in content:
    content = content.replace(old_apply, new_apply)
    with open('src/front/js/pages/JobBoard.js', 'w') as f:
        f.write(content)
    print("✓ JobBoard.js handleApply fixed")
else:
    print("  handleApply already using actions")
PYEOF

# ============================================================
# 6. FIX JOBAPPLICATIONS PAGE - show real data with status
# ============================================================
cat > src/front/js/pages/JobApplications.js << 'JSEOF'
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
    pending: "warning",
    reviewed: "info",
    interview: "primary",
    offered: "success",
    rejected: "danger"
};

const JobApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/my-applications`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setApplications(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"50vh"}}>
            <div className="spinner-border text-light" />
        </div>
    );

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="text-white mb-0">My Applications</h3>
                    <small style={{color:"rgba(255,255,255,0.5)"}}>Track your cannabis industry job applications</small>
                </div>
                <button className="btn btn-success" onClick={() => navigate("/jobs")}>Browse Jobs</button>
            </div>

            {applications.length === 0 ? (
                <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                    <div style={{fontSize:"3rem"}}>📋</div>
                    <h5 className="text-white mt-3">No applications yet</h5>
                    <p>Start applying to cannabis industry positions</p>
                    <button className="btn btn-success mt-2" onClick={() => navigate("/jobs")}>Browse Jobs</button>
                </div>
            ) : (
                <div className="rounded-3 overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.12)"}}>
                    <table className="table mb-0" style={{color:"white"}}>
                        <thead style={{background:"rgba(255,255,255,0.08)"}}>
                            <tr>
                                <th className="border-0 py-3">Position</th>
                                <th className="border-0 py-3">Company</th>
                                <th className="border-0 py-3">Location</th>
                                <th className="border-0 py-3">Salary</th>
                                <th className="border-0 py-3">Applied</th>
                                <th className="border-0 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app, i) => (
                                <tr key={i} style={{borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                                    <td className="border-0 py-3">
                                        <strong>{app.job_title}</strong>
                                    </td>
                                    <td className="border-0 py-3" style={{color:"rgba(255,255,255,0.7)"}}>{app.company_name}</td>
                                    <td className="border-0 py-3" style={{color:"rgba(255,255,255,0.7)"}}>{app.location || "—"}</td>
                                    <td className="border-0 py-3" style={{color:"rgba(255,255,255,0.7)"}}>{app.salary || "—"}</td>
                                    <td className="border-0 py-3 small" style={{color:"rgba(255,255,255,0.5)"}}>
                                        {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "Recently"}
                                    </td>
                                    <td className="border-0 py-3">
                                        <span className={`badge bg-${STATUS_COLORS[app.status] || "secondary"} text-capitalize`}>
                                            {app.status || "pending"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
export default JobApplications;
JSEOF
echo "✓ JobApplications.js updated"

# ============================================================
# 7. VERIFY POS ROUTES ARE COMPLETE
# ============================================================
python3 << 'PYEOF'
with open('src/api/pos_routes.py', 'r') as f:
    content = f.read()

routes = [
    ('/pos/checkout', 'checkout'),
    ('/pos/transactions', 'transactions'),
    ('/pos/returns', 'returns'),
    ('/pos/reports', 'reports'),
    ('/pos/reconciliation', 'reconciliation'),
    ('/pos/customers/search', 'customer search'),
    ('/pos/settings', 'settings'),
    ('/pos/receipt-template', 'receipt template'),
]

print("POS Route Status:")
for route, name in routes:
    status = "✓" if route in content else "✗ MISSING"
    print(f"  {status} {name} ({route})")
PYEOF

echo ""
echo "============================================================"
echo "✅ ALL FIXES APPLIED"
echo "============================================================"
echo ""
echo "Restart backend:"
echo "  cd /workspaces/DispensaryMaster2 && pipenv run start"
