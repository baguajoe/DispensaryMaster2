#!/bin/bash
cd /workspaces/DispensaryMaster2
echo "Building LeafBridgeConnect features..."

# ============================================================
# 1. ADD MODELS
# ============================================================
python3 << 'PYEOF'
with open('src/api/models.py', 'r') as f:
    content = f.read()

new_models = '''
# ==================== LEAFBRIDGE CONNECT MODELS ====================

class Resume(db.Model):
    __tablename__ = 'resume'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    location = db.Column(db.String(100))
    summary = db.Column(db.Text)
    experience_years = db.Column(db.Integer, default=0)
    cannabis_experience = db.Column(db.Boolean, default=False)
    certifications = db.Column(db.JSON, default=[])
    skills = db.Column(db.JSON, default=[])
    resume_url = db.Column(db.String(500))  # R2 uploaded file
    linkedin_url = db.Column(db.String(255))
    desired_role = db.Column(db.String(100))
    desired_salary = db.Column(db.String(50))
    available_from = db.Column(db.Date)
    is_visible = db.Column(db.Boolean, default=True)  # opt in/out of search
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    user = db.relationship('User', backref='resume')

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "location": self.location,
            "summary": self.summary,
            "experience_years": self.experience_years,
            "cannabis_experience": self.cannabis_experience,
            "certifications": self.certifications or [],
            "skills": self.skills or [],
            "resume_url": self.resume_url,
            "linkedin_url": self.linkedin_url,
            "desired_role": self.desired_role,
            "desired_salary": self.desired_salary,
            "available_from": self.available_from.isoformat() if self.available_from else None,
            "is_visible": self.is_visible,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class OnboardingChecklist(db.Model):
    __tablename__ = 'onboarding_checklist'
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), default="New Employee Onboarding")
    state = db.Column(db.String(50))  # MA, CA, CO etc
    status = db.Column(db.String(20), default="in_progress")  # in_progress, completed
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

    company = db.relationship('Company', backref='onboarding_checklists')
    employee = db.relationship('User', backref='onboarding_checklists')
    tasks = db.relationship('OnboardingTask', backref='checklist', cascade='all, delete')

    def serialize(self):
        return {
            "id": self.id,
            "company_id": self.company_id,
            "employee_id": self.employee_id,
            "title": self.title,
            "state": self.state,
            "status": self.status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "tasks": [t.serialize() for t in self.tasks],
            "progress": round(len([t for t in self.tasks if t.completed]) / len(self.tasks) * 100) if self.tasks else 0,
        }

class OnboardingTask(db.Model):
    __tablename__ = 'onboarding_task'
    id = db.Column(db.Integer, primary_key=True)
    checklist_id = db.Column(db.Integer, db.ForeignKey('onboarding_checklist.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))  # paperwork, training, compliance, equipment
    required = db.Column(db.Boolean, default=True)
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)
    due_days = db.Column(db.Integer, default=3)  # days from start to complete
    document_url = db.Column(db.String(500))  # uploaded doc if needed

    def serialize(self):
        return {
            "id": self.id,
            "checklist_id": self.checklist_id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "required": self.required,
            "completed": self.completed,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "due_days": self.due_days,
            "document_url": self.document_url,
        }

class PerformanceReview(db.Model):
    __tablename__ = 'performance_review'
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=False)
    review_period = db.Column(db.String(50))  # Q1 2025, Annual 2024 etc
    overall_rating = db.Column(db.Float)  # 1-5
    attendance_rating = db.Column(db.Float)
    performance_rating = db.Column(db.Float)
    teamwork_rating = db.Column(db.Float)
    knowledge_rating = db.Column(db.Float)
    customer_service_rating = db.Column(db.Float)
    strengths = db.Column(db.Text)
    improvements = db.Column(db.Text)
    goals = db.Column(db.Text)
    manager_comments = db.Column(db.Text)
    employee_comments = db.Column(db.Text)
    training_completed = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default="draft")  # draft, submitted, acknowledged
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    employee = db.relationship('User', foreign_keys=[employee_id], backref='reviews_received')
    reviewer = db.relationship('User', foreign_keys=[reviewer_id], backref='reviews_given')
    company = db.relationship('Company', backref='performance_reviews')

    def serialize(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "reviewer_id": self.reviewer_id,
            "company_id": self.company_id,
            "review_period": self.review_period,
            "overall_rating": self.overall_rating,
            "attendance_rating": self.attendance_rating,
            "performance_rating": self.performance_rating,
            "teamwork_rating": self.teamwork_rating,
            "knowledge_rating": self.knowledge_rating,
            "customer_service_rating": self.customer_service_rating,
            "strengths": self.strengths,
            "improvements": self.improvements,
            "goals": self.goals,
            "manager_comments": self.manager_comments,
            "employee_comments": self.employee_comments,
            "training_completed": self.training_completed,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class SavedJob(db.Model):
    __tablename__ = 'saved_job'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    saved_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='saved_jobs')
    job = db.relationship('Job', backref='saved_by')

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "job_id": self.job_id,
            "saved_at": self.saved_at.isoformat() if self.saved_at else None,
            "job": self.job.serialize() if self.job else None,
        }
'''

if 'class Resume(' not in content:
    content += new_models
    with open('src/api/models.py', 'w') as f:
        f.write(content)
    print("✓ LeafBridge models added")
else:
    print("  Models already exist")
PYEOF

# ============================================================
# 2. ADD BACKEND ROUTES
# ============================================================
python3 << 'PYEOF'
with open('src/api/routes.py', 'r') as f:
    content = f.read()

if 'def get_resumes(' not in content:
    new_routes = '''
# ==================== LEAFBRIDGE CONNECT ROUTES ====================

# --- RESUME ROUTES ---
@api.route('/resumes', methods=['GET'])
@jwt_required()
@handle_errors
def get_resumes():
    """Dispensaries search resumes"""
    role = request.args.get('desired_role', '')
    location = request.args.get('location', '')
    cannabis_exp = request.args.get('cannabis_experience')
    min_years = request.args.get('min_years', 0, type=int)

    query = Resume.query.filter_by(is_visible=True)
    if role:
        query = query.filter(Resume.desired_role.ilike(f'%{role}%'))
    if location:
        query = query.filter(Resume.location.ilike(f'%{location}%'))
    if cannabis_exp == 'true':
        query = query.filter_by(cannabis_experience=True)
    if min_years:
        query = query.filter(Resume.experience_years >= min_years)

    resumes = query.order_by(Resume.created_at.desc()).all()
    return jsonify([r.serialize() for r in resumes]), 200

@api.route('/resumes/me', methods=['GET'])
@jwt_required()
@handle_errors
def get_my_resume():
    user_id = get_jwt_identity()
    resume = Resume.query.filter_by(user_id=user_id).first()
    if not resume:
        return jsonify({"error": "No resume found"}), 404
    return jsonify(resume.serialize()), 200

@api.route('/resumes', methods=['POST'])
@jwt_required()
@handle_errors
def create_resume():
    user_id = get_jwt_identity()
    data = request.json
    existing = Resume.query.filter_by(user_id=user_id).first()
    if existing:
        for key, value in data.items():
            setattr(existing, key, value)
        db.session.commit()
        return jsonify(existing.serialize()), 200
    resume = Resume(user_id=user_id, **{k: v for k, v in data.items() if hasattr(Resume, k)})
    db.session.add(resume)
    db.session.commit()
    return jsonify(resume.serialize()), 201

@api.route('/resumes/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_resume(id):
    user_id = get_jwt_identity()
    resume = Resume.query.filter_by(id=id, user_id=user_id).first_or_404()
    data = request.json
    for key, value in data.items():
        if hasattr(resume, key):
            setattr(resume, key, value)
    db.session.commit()
    return jsonify(resume.serialize()), 200

@api.route('/resumes/upload', methods=['POST'])
@jwt_required()
@handle_errors
def upload_resume_file():
    user_id = get_jwt_identity()
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['file']
    allowed = {'pdf', 'doc', 'docx'}
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in allowed:
        return jsonify({"error": "Only PDF, DOC, DOCX allowed"}), 400
    import uuid
    filename = f"leafbridge/resumes/user_{user_id}/{uuid.uuid4()}.{ext}"
    r2 = get_r2_client()
    r2.upload_fileobj(file, os.getenv('R2_BUCKET_NAME'), filename, ExtraArgs={'ContentType': file.content_type})
    public_url = f"{os.getenv('R2_ENDPOINT_URL')}/{os.getenv('R2_BUCKET_NAME')}/{filename}"
    resume = Resume.query.filter_by(user_id=user_id).first()
    if resume:
        resume.resume_url = public_url
        db.session.commit()
    return jsonify({"resume_url": public_url}), 200

# --- SAVED JOBS ---
@api.route('/saved-jobs', methods=['GET'])
@jwt_required()
@handle_errors
def get_saved_jobs():
    user_id = get_jwt_identity()
    saved = SavedJob.query.filter_by(user_id=user_id).all()
    return jsonify([s.serialize() for s in saved]), 200

@api.route('/saved-jobs', methods=['POST'])
@jwt_required()
@handle_errors
def save_job():
    user_id = get_jwt_identity()
    job_id = request.json.get('job_id')
    existing = SavedJob.query.filter_by(user_id=user_id, job_id=job_id).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({"message": "Job unsaved"}), 200
    saved = SavedJob(user_id=user_id, job_id=job_id)
    db.session.add(saved)
    db.session.commit()
    return jsonify(saved.serialize()), 201

# --- ONBOARDING ROUTES ---
@api.route('/onboarding', methods=['GET'])
@jwt_required()
@handle_errors
def get_onboarding():
    user_id = get_jwt_identity()
    checklists = OnboardingChecklist.query.filter_by(employee_id=user_id).all()
    return jsonify([c.serialize() for c in checklists]), 200

@api.route('/onboarding', methods=['POST'])
@jwt_required()
@handle_errors
def create_onboarding():
    data = request.json
    checklist = OnboardingChecklist(
        company_id=data['company_id'],
        employee_id=data['employee_id'],
        title=data.get('title', 'New Employee Onboarding'),
        state=data.get('state', '')
    )
    db.session.add(checklist)
    db.session.flush()

    STATE_TEMPLATES = {
        'MA': [
            {"title": "Sign Employment Contract", "category": "paperwork", "due_days": 1},
            {"title": "Complete I-9 Verification", "category": "compliance", "due_days": 1},
            {"title": "Submit MA Cannabis Handler Permit", "category": "compliance", "due_days": 3},
            {"title": "Complete CORI Background Check", "category": "compliance", "due_days": 3},
            {"title": "Review MA Cannabis Control Commission Rules", "category": "training", "due_days": 5},
            {"title": "Setup Direct Deposit", "category": "paperwork", "due_days": 3},
            {"title": "Complete Sexual Harassment Training", "category": "training", "due_days": 7},
            {"title": "Receive Employee Handbook", "category": "paperwork", "due_days": 1},
            {"title": "Setup POS System Access", "category": "equipment", "due_days": 2},
            {"title": "Complete Seed-to-Sale Training", "category": "training", "due_days": 7},
        ],
        'CA': [
            {"title": "Sign Employment Contract", "category": "paperwork", "due_days": 1},
            {"title": "Complete I-9 Verification", "category": "compliance", "due_days": 1},
            {"title": "Submit CA Cannabis Worker Permit", "category": "compliance", "due_days": 3},
            {"title": "Complete Live Scan Background Check", "category": "compliance", "due_days": 3},
            {"title": "Review DCC Regulations", "category": "training", "due_days": 5},
            {"title": "Setup Direct Deposit", "category": "paperwork", "due_days": 3},
            {"title": "Complete Responsible Vendor Training", "category": "training", "due_days": 7},
            {"title": "Receive Employee Handbook", "category": "paperwork", "due_days": 1},
            {"title": "Setup Metrc System Access", "category": "equipment", "due_days": 2},
        ],
        'CO': [
            {"title": "Sign Employment Contract", "category": "paperwork", "due_days": 1},
            {"title": "Complete I-9 Verification", "category": "compliance", "due_days": 1},
            {"title": "Submit MED Badge Application", "category": "compliance", "due_days": 3},
            {"title": "Complete Background Check", "category": "compliance", "due_days": 3},
            {"title": "Review MED Rules and Regulations", "category": "training", "due_days": 5},
            {"title": "Setup Direct Deposit", "category": "paperwork", "due_days": 3},
            {"title": "Complete Cannabis Training", "category": "training", "due_days": 7},
            {"title": "Receive Employee Handbook", "category": "paperwork", "due_days": 1},
        ],
        'DEFAULT': [
            {"title": "Sign Employment Contract", "category": "paperwork", "due_days": 1},
            {"title": "Complete I-9 Verification", "category": "compliance", "due_days": 1},
            {"title": "Submit State Cannabis Worker Permit", "category": "compliance", "due_days": 3},
            {"title": "Complete Background Check", "category": "compliance", "due_days": 3},
            {"title": "Review State Cannabis Regulations", "category": "training", "due_days": 5},
            {"title": "Setup Direct Deposit", "category": "paperwork", "due_days": 3},
            {"title": "Complete Cannabis Compliance Training", "category": "training", "due_days": 7},
            {"title": "Receive Employee Handbook", "category": "paperwork", "due_days": 1},
            {"title": "Setup System Access", "category": "equipment", "due_days": 2},
        ]
    }

    state = data.get('state', 'DEFAULT').upper()
    template = STATE_TEMPLATES.get(state, STATE_TEMPLATES['DEFAULT'])
    custom_tasks = data.get('tasks', [])
    all_tasks = template + custom_tasks

    for task_data in all_tasks:
        task = OnboardingTask(
            checklist_id=checklist.id,
            title=task_data['title'],
            category=task_data.get('category', 'general'),
            due_days=task_data.get('due_days', 3),
            required=task_data.get('required', True),
        )
        db.session.add(task)

    db.session.commit()
    return jsonify(checklist.serialize()), 201

@api.route('/onboarding/<int:id>', methods=['GET'])
@jwt_required()
@handle_errors
def get_onboarding_detail(id):
    checklist = OnboardingChecklist.query.get_or_404(id)
    return jsonify(checklist.serialize()), 200

@api.route('/onboarding/tasks/<int:task_id>/complete', methods=['PUT'])
@jwt_required()
@handle_errors
def complete_onboarding_task(task_id):
    task = OnboardingTask.query.get_or_404(task_id)
    task.completed = not task.completed
    task.completed_at = datetime.utcnow() if task.completed else None
    checklist = OnboardingChecklist.query.get(task.checklist_id)
    if checklist and all(t.completed for t in checklist.tasks if t.required):
        checklist.status = 'completed'
        checklist.completed_at = datetime.utcnow()
    db.session.commit()
    return jsonify(task.serialize()), 200

# --- PERFORMANCE REVIEW ROUTES ---
@api.route('/performance-reviews', methods=['GET'])
@jwt_required()
@handle_errors
def get_performance_reviews():
    user_id = get_jwt_identity()
    company_id = request.args.get('company_id', type=int)
    employee_id = request.args.get('employee_id', type=int)
    query = PerformanceReview.query
    if company_id:
        query = query.filter_by(company_id=company_id)
    if employee_id:
        query = query.filter_by(employee_id=employee_id)
    reviews = query.order_by(PerformanceReview.created_at.desc()).all()
    return jsonify([r.serialize() for r in reviews]), 200

@api.route('/performance-reviews', methods=['POST'])
@jwt_required()
@handle_errors
def create_performance_review():
    user_id = get_jwt_identity()
    data = request.json
    training_count = EmployeeTraining.query.filter_by(
        user_id=data.get('employee_id')
    ).filter(EmployeeTraining.completion_date.isnot(None)).count()
    ratings = [data.get(k) for k in ['attendance_rating','performance_rating','teamwork_rating','knowledge_rating','customer_service_rating'] if data.get(k)]
    overall = round(sum(ratings) / len(ratings), 1) if ratings else None
    review = PerformanceReview(
        employee_id=data['employee_id'],
        reviewer_id=user_id,
        company_id=data['company_id'],
        review_period=data.get('review_period', ''),
        overall_rating=overall,
        attendance_rating=data.get('attendance_rating'),
        performance_rating=data.get('performance_rating'),
        teamwork_rating=data.get('teamwork_rating'),
        knowledge_rating=data.get('knowledge_rating'),
        customer_service_rating=data.get('customer_service_rating'),
        strengths=data.get('strengths', ''),
        improvements=data.get('improvements', ''),
        goals=data.get('goals', ''),
        manager_comments=data.get('manager_comments', ''),
        training_completed=training_count,
        status='submitted'
    )
    db.session.add(review)
    db.session.commit()
    return jsonify(review.serialize()), 201

@api.route('/performance-reviews/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_performance_review(id):
    review = PerformanceReview.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        if hasattr(review, key):
            setattr(review, key, value)
    db.session.commit()
    return jsonify(review.serialize()), 200

@api.route('/performance-reviews/<int:id>/acknowledge', methods=['PUT'])
@jwt_required()
@handle_errors
def acknowledge_review(id):
    review = PerformanceReview.query.get_or_404(id)
    review.status = 'acknowledged'
    review.employee_comments = request.json.get('employee_comments', '')
    db.session.commit()
    return jsonify(review.serialize()), 200
'''
    content += new_routes
    with open('src/api/routes.py', 'w') as f:
        f.write(content)
    print("✓ LeafBridge routes added")
else:
    print("  Routes already exist")

# Fix imports in routes.py
with open('src/api/routes.py', 'r') as f:
    content = f.read()
if 'Resume' not in content.split('from api.models import')[1].split('\n')[0] if 'from api.models import' in content else True:
    content = content.replace(
        'from api.models import db, User, Product, Customer, Order, OrderItem, Invoice, Role',
        'from api.models import db, User, Product, Customer, Order, OrderItem, Invoice, Role, Resume, OnboardingChecklist, OnboardingTask, PerformanceReview, SavedJob, EmployeeTraining'
    )
    with open('src/api/routes.py', 'w') as f:
        f.write(content)
    print("✓ Imports updated")
PYEOF

# ============================================================
# 3. BUILD FRONTEND PAGES
# ============================================================

# Resume Builder Page
cat > src/front/js/pages/ResumeBuilder.js << 'EOF'
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ROLES = ["Budtender","Store Manager","Assistant Manager","Delivery Driver","Extraction Tech","Cultivation Tech","Compliance Officer","Security","Receptionist","Inventory Manager"];
const SKILLS = ["Customer Service","POS Systems","Inventory Management","Cannabis Knowledge","Compliance","Cash Handling","Team Leadership","Seed-to-Sale","Metrc","COVA"];
const CERTS = ["MA Cannabis Handler Permit","CA Responsible Vendor","CO MED Badge","OSHA Safety","Food Handler Card","ServSafe","Responsible Vendor Training"];

const ResumeBuilder = () => {
    const navigate = useNavigate();
    const [resume, setResume] = useState({
        full_name:"", email:"", phone:"", location:"", summary:"",
        experience_years:0, cannabis_experience:false, desired_role:"",
        desired_salary:"", linkedin_url:"", certifications:[], skills:[], is_visible:true
    });
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/resumes/me`, { headers })
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setResume(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const toggleItem = (field, item) => {
        const current = resume[field] || [];
        setResume({...resume, [field]: current.includes(item) ? current.filter(i=>i!==item) : [...current, item]});
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/resumes`, { method:"POST", headers, body:JSON.stringify(resume) });
            if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
        } catch(e) { console.error(e); } finally { setSaving(false); }
    };

    const handleFileUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const r = await fetch(`${process.env.BACKEND_URL}/api/resumes/upload`, {
                method:"POST", headers:{ Authorization:`Bearer ${token}` }, body:formData
            });
            if (r.ok) { const data = await r.json(); setResume({...resume, resume_url:data.resume_url}); }
        } catch(e) { console.error(e); } finally { setUploading(false); }
    };

    const u = (field, value) => setResume({...resume, [field]:value});

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>📄 My Resume</h2><p>Build your cannabis industry profile</p></div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-light" onClick={() => navigate("/job-board")}>Browse Jobs</button>
                    <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                        {saving ? <span className="spinner-border spinner-border-sm"/> : saved ? "✓ Saved!" : "Save Resume"}
                    </button>
                </div>
            </div>

            <div className="row g-4">
                {/* Personal Info */}
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Personal Information</h5>
                        <div className="row g-3">
                            <div className="col-12"><label className="form-label">Full Name *</label><input className="form-control" value={resume.full_name} onChange={e=>u("full_name",e.target.value)} /></div>
                            <div className="col-6"><label className="form-label">Email *</label><input className="form-control" type="email" value={resume.email} onChange={e=>u("email",e.target.value)} /></div>
                            <div className="col-6"><label className="form-label">Phone</label><input className="form-control" value={resume.phone} onChange={e=>u("phone",e.target.value)} /></div>
                            <div className="col-6"><label className="form-label">Location</label><input className="form-control" placeholder="Boston, MA" value={resume.location} onChange={e=>u("location",e.target.value)} /></div>
                            <div className="col-6"><label className="form-label">LinkedIn</label><input className="form-control" placeholder="linkedin.com/in/..." value={resume.linkedin_url} onChange={e=>u("linkedin_url",e.target.value)} /></div>
                            <div className="col-12"><label className="form-label">Professional Summary</label><textarea className="form-control" rows="3" value={resume.summary} onChange={e=>u("summary",e.target.value)} placeholder="Brief overview of your experience..." /></div>
                        </div>
                    </div>
                </div>

                {/* Job Preferences */}
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Job Preferences</h5>
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label">Desired Role</label>
                                <select className="form-select" value={resume.desired_role} onChange={e=>u("desired_role",e.target.value)}>
                                    <option value="">Select role...</option>
                                    {ROLES.map(r=><option key={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="col-6"><label className="form-label">Years Experience</label><input className="form-control" type="number" min="0" value={resume.experience_years} onChange={e=>u("experience_years",parseInt(e.target.value))} /></div>
                            <div className="col-6"><label className="form-label">Desired Salary</label><input className="form-control" placeholder="$18/hr or $45,000/yr" value={resume.desired_salary} onChange={e=>u("desired_salary",e.target.value)} /></div>
                            <div className="col-12">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" checked={resume.cannabis_experience} onChange={e=>u("cannabis_experience",e.target.checked)} />
                                    <label className="form-check-label">I have cannabis industry experience</label>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" checked={resume.is_visible} onChange={e=>u("is_visible",e.target.checked)} />
                                    <label className="form-check-label">Visible to dispensaries searching resumes</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upload Resume File */}
                    <div className="glass-panel mt-3">
                        <h5 className="mb-3">Upload Resume File</h5>
                        {resume.resume_url && <div className="mb-2"><a href={resume.resume_url} target="_blank" rel="noreferrer" className="btn btn-outline-info btn-sm">📄 View Current Resume</a></div>}
                        <input className="form-control mb-2" type="file" accept=".pdf,.doc,.docx" onChange={e=>setFile(e.target.files[0])} />
                        <button className="btn btn-outline-light btn-sm w-100" onClick={handleFileUpload} disabled={!file||uploading}>
                            {uploading ? <span className="spinner-border spinner-border-sm"/> : "Upload PDF/DOC"}
                        </button>
                    </div>
                </div>

                {/* Skills */}
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Skills</h5>
                        <div className="d-flex flex-wrap gap-2">
                            {SKILLS.map(s => (
                                <span key={s} className={`badge ${(resume.skills||[]).includes(s)?"bg-success":"bg-secondary"}`}
                                    style={{cursor:"pointer",fontSize:"0.85rem",padding:"8px 12px"}}
                                    onClick={() => toggleItem("skills", s)}>{s}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Certifications */}
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Certifications</h5>
                        <div className="d-flex flex-wrap gap-2">
                            {CERTS.map(c => (
                                <span key={c} className={`badge ${(resume.certifications||[]).includes(c)?"bg-success":"bg-secondary"}`}
                                    style={{cursor:"pointer",fontSize:"0.85rem",padding:"8px 12px"}}
                                    onClick={() => toggleItem("certifications", c)}>{c}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ResumeBuilder;
EOF
echo "✓ ResumeBuilder.js"

# Resume Search (for dispensaries)
cat > src/front/js/pages/ResumeSearch.js << 'EOF'
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ResumeSearch = () => {
    const navigate = useNavigate();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ desired_role:"", location:"", cannabis_experience:"", min_years:"" });
    const token = localStorage.getItem("token");

    const search = () => {
        setLoading(true);
        const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v])=>v)));
        fetch(`${process.env.BACKEND_URL}/api/resumes?${params}`, { headers:{ Authorization:`Bearer ${token}` } })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setResumes(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { search(); }, []);

    const ROLES = ["Budtender","Store Manager","Assistant Manager","Delivery Driver","Extraction Tech","Compliance Officer"];

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>🔍 Resume Database</h2><p>Find qualified cannabis professionals</p></div>

            {/* Search Filters */}
            <div className="glass-panel mb-4">
                <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                        <label className="form-label">Role</label>
                        <select className="form-select" value={filters.desired_role} onChange={e=>setFilters({...filters,desired_role:e.target.value})}>
                            <option value="">All Roles</option>
                            {ROLES.map(r=><option key={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Location</label>
                        <input className="form-control" placeholder="Boston, MA" value={filters.location} onChange={e=>setFilters({...filters,location:e.target.value})} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label">Min Years</label>
                        <input className="form-control" type="number" min="0" value={filters.min_years} onChange={e=>setFilters({...filters,min_years:e.target.value})} />
                    </div>
                    <div className="col-md-2">
                        <div className="form-check mt-4">
                            <input className="form-check-input" type="checkbox" checked={filters.cannabis_experience==="true"}
                                onChange={e=>setFilters({...filters,cannabis_experience:e.target.checked?"true":""})} />
                            <label className="form-check-label">Cannabis Exp Only</label>
                        </div>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-success w-100" onClick={search}>Search</button>
                    </div>
                </div>
            </div>

            {/* Results */}
            {loading ? <div className="text-center py-4"><div className="spinner-border text-light"/></div>
            : resumes.length === 0 ? (
                <div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                    <div style={{fontSize:"3rem"}}>📄</div><h5>No resumes found</h5><p>Try adjusting your filters</p>
                </div>
            ) : (
                <div className="row g-3">
                    {resumes.map(r => (
                        <div key={r.id} className="col-md-6 col-lg-4">
                            <div className="glass-panel h-100">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h5 className="mb-0">{r.full_name}</h5>
                                    {r.cannabis_experience && <span className="badge bg-success">🌿 Cannabis Exp</span>}
                                </div>
                                <p style={{color:"rgba(255,255,255,0.6)",fontSize:"0.9rem",margin:"0 0 0.5rem"}}>{r.desired_role || "Open to opportunities"}</p>
                                <p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem",margin:"0 0 0.75rem"}}>📍 {r.location || "Location not specified"} · {r.experience_years} yrs exp</p>
                                {r.summary && <p style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.7)",margin:"0 0 0.75rem"}}>{r.summary.slice(0,120)}{r.summary.length>120?"...":""}</p>}
                                <div className="d-flex flex-wrap gap-1 mb-3">
                                    {(r.skills||[]).slice(0,4).map(s=><span key={s} className="badge bg-secondary" style={{fontSize:"0.75rem"}}>{s}</span>)}
                                </div>
                                <div className="d-flex gap-2">
                                    {r.resume_url && <a href={r.resume_url} target="_blank" rel="noreferrer" className="btn btn-outline-info btn-sm">📄 Resume</a>}
                                    <a href={`mailto:${r.email}`} className="btn btn-success btn-sm flex-grow-1">Contact</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default ResumeSearch;
EOF
echo "✓ ResumeSearch.js"

# Onboarding Page
cat > src/front/js/pages/Onboarding.js << 'EOF'
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CATEGORY_ICONS = { paperwork:"📝", compliance:"⚖️", training:"📚", equipment:"💻", general:"✅" };
const CATEGORY_COLORS = { paperwork:"#11cdef", compliance:"#f5365c", training:"#2dce89", equipment:"#ffd600", general:"#fb6340" };

const Onboarding = () => {
    const navigate = useNavigate();
    const [checklists, setChecklists] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNew, setShowNew] = useState(false);
    const [form, setForm] = useState({ company_id:"", employee_id:"", state:"MA", title:"New Employee Onboarding" });
    const [creating, setCreating] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/onboarding`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setChecklists(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/onboarding`, { method:"POST", headers, body:JSON.stringify(form) });
            if (r.ok) {
                const data = await r.json();
                setChecklists(prev => [...prev, data]);
                setSelected(data);
                setShowNew(false);
            }
        } catch(e) { console.error(e); } finally { setCreating(false); }
    };

    const handleComplete = async (taskId) => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/onboarding/tasks/${taskId}/complete`, { method:"PUT", headers });
            if (r.ok) {
                const updatedTask = await r.json();
                setSelected(prev => ({
                    ...prev,
                    tasks: prev.tasks.map(t => t.id === taskId ? updatedTask : t),
                    progress: Math.round(prev.tasks.filter(t => t.id === taskId ? updatedTask.completed : t.completed).length / prev.tasks.length * 100)
                }));
                setChecklists(prev => prev.map(c => c.id === selected.id ? {...c, tasks: c.tasks.map(t => t.id === taskId ? updatedTask : t)} : c));
            }
        } catch(e) { console.error(e); }
    };

    const groupedTasks = (tasks) => {
        const groups = {};
        (tasks||[]).forEach(t => {
            const cat = t.category || 'general';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(t);
        });
        return groups;
    };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>📋 Employee Onboarding</h2><p>State-specific new hire checklists</p></div>
                <button className="btn btn-success" onClick={() => setShowNew(!showNew)}>+ New Onboarding</button>
            </div>

            {showNew && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">Create Onboarding Checklist</h5>
                    <form onSubmit={handleCreate}>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">State *</label>
                                <select className="form-select" value={form.state} onChange={e=>setForm({...form,state:e.target.value})}>
                                    {["MA","CA","CO","IL","NY","NV","OR","WA","AZ","MI"].map(s=><option key={s}>{s}</option>)}
                                    <option value="DEFAULT">Other State</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Employee ID</label>
                                <input className="form-control" type="number" value={form.employee_id} onChange={e=>setForm({...form,employee_id:e.target.value})} placeholder="User ID" />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Company ID</label>
                                <input className="form-control" type="number" value={form.company_id} onChange={e=>setForm({...form,company_id:e.target.value})} placeholder="Company ID" />
                            </div>
                            <div className="col-12 d-flex gap-2">
                                <button type="button" className="btn btn-outline-light" onClick={()=>setShowNew(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1" disabled={creating}>
                                    {creating?<span className="spinner-border spinner-border-sm"/>:"Create with State Template"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="row g-3">
                {/* Checklist List */}
                <div className="col-md-4">
                    <div className="glass-panel">
                        <h5 className="mb-3">Checklists ({checklists.length})</h5>
                        {checklists.length === 0 ? (
                            <p style={{color:"rgba(255,255,255,0.5)"}}>No checklists yet</p>
                        ) : checklists.map(c => (
                            <div key={c.id} className="mb-2 p-3 rounded" style={{background:selected?.id===c.id?"rgba(45,206,137,0.15)":"rgba(255,255,255,0.06)",border:`1px solid ${selected?.id===c.id?"rgba(45,206,137,0.4)":"rgba(255,255,255,0.1)"}`,cursor:"pointer"}}
                                onClick={() => setSelected(c)}>
                                <div style={{fontWeight:600,fontSize:"0.9rem"}}>{c.title}</div>
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>State: {c.state} · {c.tasks?.length||0} tasks</div>
                                <div className="progress mt-2" style={{height:"4px",background:"rgba(255,255,255,0.1)"}}>
                                    <div className="progress-bar bg-success" style={{width:`${c.progress||0}%`}} />
                                </div>
                                <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.4)",marginTop:"4px"}}>{c.progress||0}% complete</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Task Detail */}
                <div className="col-md-8">
                    {!selected ? (
                        <div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                            <div style={{fontSize:"3rem"}}>📋</div>
                            <h5>Select a checklist to view tasks</h5>
                        </div>
                    ) : (
                        <div className="glass-panel">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h5 className="mb-0">{selected.title}</h5>
                                    <small style={{color:"rgba(255,255,255,0.5)"}}>State: {selected.state} · {selected.progress||0}% complete</small>
                                </div>
                                <span className={`badge bg-${selected.status==="completed"?"success":"warning text-dark"}`}>{selected.status}</span>
                            </div>
                            <div className="progress mb-4" style={{height:"8px",background:"rgba(255,255,255,0.1)"}}>
                                <div className="progress-bar bg-success" style={{width:`${selected.progress||0}%`,transition:"width 0.5s"}} />
                            </div>
                            {Object.entries(groupedTasks(selected.tasks)).map(([category, tasks]) => (
                                <div key={category} className="mb-4">
                                    <h6 style={{color:CATEGORY_COLORS[category]||"#fff",marginBottom:"0.75rem"}}>
                                        {CATEGORY_ICONS[category]||"✅"} {category.charAt(0).toUpperCase()+category.slice(1)}
                                    </h6>
                                    {tasks.map(task => (
                                        <div key={task.id} className="d-flex align-items-start gap-3 mb-2 p-2 rounded"
                                            style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
                                            <input type="checkbox" className="form-check-input mt-1" checked={task.completed}
                                                onChange={() => handleComplete(task.id)} style={{cursor:"pointer"}} />
                                            <div className="flex-grow-1">
                                                <div style={{fontWeight:500,textDecoration:task.completed?"line-through":"none",color:task.completed?"rgba(255,255,255,0.4)":"white"}}>{task.title}</div>
                                                {task.description && <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)"}}>{task.description}</div>}
                                                <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.35)"}}>Due within {task.due_days} day{task.due_days!==1?"s":""} {task.required?"· Required":""}</div>
                                            </div>
                                            {task.completed && <span className="badge bg-success">Done</span>}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Onboarding;
EOF
echo "✓ Onboarding.js"

# Performance Review Page
cat > src/front/js/pages/PerformanceReviews.js << 'EOF'
import React, { useState, useEffect } from "react";

const RATING_LABELS = { 1:"Poor", 2:"Below Average", 3:"Meets Expectations", 4:"Exceeds Expectations", 5:"Outstanding" };

const StarRating = ({ value, onChange, readOnly }) => (
    <div className="d-flex gap-1">
        {[1,2,3,4,5].map(star => (
            <span key={star} style={{fontSize:"1.5rem",cursor:readOnly?"default":"pointer",color:star<=value?"#ffd600":"rgba(255,255,255,0.2)"}}
                onClick={() => !readOnly && onChange(star)}>★</span>
        ))}
        {value > 0 && <span style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)",alignSelf:"center",marginLeft:"4px"}}>{RATING_LABELS[value]}</span>}
    </div>
);

const PerformanceReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({
        employee_id:"", company_id:"", review_period:"",
        attendance_rating:0, performance_rating:0, teamwork_rating:0,
        knowledge_rating:0, customer_service_rating:0,
        strengths:"", improvements:"", goals:"", manager_comments:""
    });
    const [saving, setSaving] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/performance-reviews`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setReviews(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/performance-reviews`, { method:"POST", headers, body:JSON.stringify(form) });
            if (r.ok) {
                const data = await r.json();
                setReviews(prev => [data, ...prev]);
                setShowForm(false);
                setForm({ employee_id:"", company_id:"", review_period:"", attendance_rating:0, performance_rating:0, teamwork_rating:0, knowledge_rating:0, customer_service_rating:0, strengths:"", improvements:"", goals:"", manager_comments:"" });
            }
        } catch(e) { console.error(e); } finally { setSaving(false); }
    };

    const handleAcknowledge = async (id) => {
        const comments = window.prompt("Add your comments (optional):");
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/performance-reviews/${id}/acknowledge`, {
                method:"PUT", headers, body:JSON.stringify({ employee_comments: comments||"" })
            });
            if (r.ok) { const data = await r.json(); setReviews(prev => prev.map(rv => rv.id===id ? data : rv)); setSelected(data); }
        } catch(e) { console.error(e); }
    };

    const ratingColor = (r) => r >= 4 ? "#2dce89" : r >= 3 ? "#ffd600" : "#f5365c";

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>⭐ Performance Reviews</h2><p>{reviews.length} reviews on record</p></div>
                <button className="btn btn-success" onClick={() => setShowForm(!showForm)}>+ New Review</button>
            </div>

            {showForm && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-4">New Performance Review</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-4"><label className="form-label">Employee ID *</label><input className="form-control" required value={form.employee_id} onChange={e=>setForm({...form,employee_id:e.target.value})} /></div>
                            <div className="col-md-4"><label className="form-label">Company ID *</label><input className="form-control" required value={form.company_id} onChange={e=>setForm({...form,company_id:e.target.value})} /></div>
                            <div className="col-md-4"><label className="form-label">Review Period</label><input className="form-control" placeholder="Q1 2025 / Annual 2024" value={form.review_period} onChange={e=>setForm({...form,review_period:e.target.value})} /></div>

                            <div className="col-12"><hr style={{borderColor:"rgba(255,255,255,0.1)"}}/><h6 className="mb-3">Ratings</h6></div>
                            {[
                                {k:"attendance_rating",l:"Attendance & Punctuality"},
                                {k:"performance_rating",l:"Job Performance"},
                                {k:"teamwork_rating",l:"Teamwork & Collaboration"},
                                {k:"knowledge_rating",l:"Cannabis Knowledge"},
                                {k:"customer_service_rating",l:"Customer Service"},
                            ].map(field => (
                                <div key={field.k} className="col-md-6">
                                    <label className="form-label">{field.l}</label>
                                    <StarRating value={form[field.k]} onChange={v => setForm({...form,[field.k]:v})} />
                                </div>
                            ))}

                            <div className="col-12"><hr style={{borderColor:"rgba(255,255,255,0.1)"}}/></div>
                            <div className="col-md-4"><label className="form-label">Strengths</label><textarea className="form-control" rows="3" value={form.strengths} onChange={e=>setForm({...form,strengths:e.target.value})} placeholder="What does this employee do well?" /></div>
                            <div className="col-md-4"><label className="form-label">Areas for Improvement</label><textarea className="form-control" rows="3" value={form.improvements} onChange={e=>setForm({...form,improvements:e.target.value})} placeholder="What could be better?" /></div>
                            <div className="col-md-4"><label className="form-label">Goals for Next Period</label><textarea className="form-control" rows="3" value={form.goals} onChange={e=>setForm({...form,goals:e.target.value})} placeholder="Set targets for next review" /></div>
                            <div className="col-12"><label className="form-label">Manager Comments</label><textarea className="form-control" rows="2" value={form.manager_comments} onChange={e=>setForm({...form,manager_comments:e.target.value})} /></div>

                            <div className="col-12 d-flex gap-2">
                                <button type="button" className="btn btn-outline-light" onClick={()=>setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>{saving?<span className="spinner-border spinner-border-sm"/>:"Submit Review"}</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="row g-3">
                <div className="col-md-4">
                    <div className="glass-panel">
                        <h5 className="mb-3">Reviews</h5>
                        {reviews.length===0 ? <p style={{color:"rgba(255,255,255,0.5)"}}>No reviews yet</p>
                        : reviews.map(r => (
                            <div key={r.id} className="mb-2 p-3 rounded" style={{background:selected?.id===r.id?"rgba(45,206,137,0.15)":"rgba(255,255,255,0.06)",border:`1px solid ${selected?.id===r.id?"rgba(45,206,137,0.4)":"rgba(255,255,255,0.1)"}`,cursor:"pointer"}}
                                onClick={() => setSelected(r)}>
                                <div className="d-flex justify-content-between">
                                    <div style={{fontWeight:600,fontSize:"0.9rem"}}>Employee #{r.employee_id}</div>
                                    {r.overall_rating && <span style={{color:ratingColor(r.overall_rating),fontWeight:700}}>★ {r.overall_rating}</span>}
                                </div>
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>{r.review_period}</div>
                                <span className={`badge mt-1 bg-${r.status==="acknowledged"?"success":r.status==="submitted"?"info":"secondary"}`}>{r.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-md-8">
                    {!selected ? (
                        <div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}><div style={{fontSize:"3rem"}}>⭐</div><h5>Select a review to view details</h5></div>
                    ) : (
                        <div className="glass-panel">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h5 className="mb-0">Employee #{selected.employee_id} · {selected.review_period}</h5>
                                    <small style={{color:"rgba(255,255,255,0.5)"}}>Reviewed by #{selected.reviewer_id} · {selected.training_completed} trainings completed</small>
                                </div>
                                {selected.overall_rating && <div className="text-center"><div style={{fontSize:"2.5rem",fontWeight:800,color:ratingColor(selected.overall_rating)}}>★ {selected.overall_rating}</div><div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)"}}>Overall</div></div>}
                            </div>

                            <div className="row g-3 mb-4">
                                {[
                                    {k:"attendance_rating",l:"Attendance"},
                                    {k:"performance_rating",l:"Performance"},
                                    {k:"teamwork_rating",l:"Teamwork"},
                                    {k:"knowledge_rating",l:"Knowledge"},
                                    {k:"customer_service_rating",l:"Customer Service"},
                                ].map(f => selected[f.k] && (
                                    <div key={f.k} className="col-6 col-md-4">
                                        <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>{f.l}</div>
                                        <StarRating value={selected[f.k]} readOnly />
                                    </div>
                                ))}
                            </div>

                            <div className="row g-3 mb-3">
                                {selected.strengths && <div className="col-md-4"><div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>STRENGTHS</div><p style={{fontSize:"0.9rem"}}>{selected.strengths}</p></div>}
                                {selected.improvements && <div className="col-md-4"><div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>IMPROVEMENTS</div><p style={{fontSize:"0.9rem"}}>{selected.improvements}</p></div>}
                                {selected.goals && <div className="col-md-4"><div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>GOALS</div><p style={{fontSize:"0.9rem"}}>{selected.goals}</p></div>}
                            </div>

                            {selected.manager_comments && <div className="mb-3"><div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>MANAGER COMMENTS</div><p style={{fontSize:"0.9rem"}}>{selected.manager_comments}</p></div>}
                            {selected.employee_comments && <div className="mb-3 p-3 rounded" style={{background:"rgba(45,206,137,0.1)",border:"1px solid rgba(45,206,137,0.3)"}}><div style={{fontSize:"0.75rem",color:"#2dce89"}}>EMPLOYEE RESPONSE</div><p style={{fontSize:"0.9rem",margin:0}}>{selected.employee_comments}</p></div>}

                            {selected.status === "submitted" && (
                                <button className="btn btn-success w-100 mt-2" onClick={() => handleAcknowledge(selected.id)}>
                                    ✓ Acknowledge Review
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default PerformanceReviews;
EOF
echo "✓ PerformanceReviews.js"

# ============================================================
# 4. UPDATE LAYOUT + SIDEBAR
# ============================================================
python3 << 'PYEOF'
with open('src/front/js/layout.js', 'r') as f:
    content = f.read()

changed = False

if 'ResumeBuilder' not in content:
    content = content.replace(
        'import JobBoard from "./pages/JobBoard";',
        'import JobBoard from "./pages/JobBoard";\nimport ResumeBuilder from "./pages/ResumeBuilder";\nimport ResumeSearch from "./pages/ResumeSearch";\nimport Onboarding from "./pages/Onboarding";\nimport PerformanceReviews from "./pages/PerformanceReviews";'
    )
    content = content.replace(
        '<Route path="/job-board"',
        '<Route path="/resume-builder" element={<RequireAuth><ResumeBuilder /></RequireAuth>} />\n                            <Route path="/resume-search" element={<RequireAuth><ResumeSearch /></RequireAuth>} />\n                            <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />\n                            <Route path="/performance-reviews" element={<RequireAuth><PerformanceReviews /></RequireAuth>} />\n                            <Route path="/job-board"'
    )
    changed = True
    print("✓ layout.js updated")

if changed:
    with open('src/front/js/layout.js', 'w') as f:
        f.write(content)

# Update sidebar
with open('src/front/js/component/Sidebar.js', 'r') as f:
    sidebar = f.read()

if 'resume-builder' not in sidebar:
    sidebar = sidebar.replace(
        '{ name: "Job Board", path: "/job-board" }',
        '{ name: "Job Board", path: "/job-board" },\n            { name: "My Resume", path: "/resume-builder" },\n            { name: "Resume Search", path: "/resume-search" },\n            { name: "Onboarding", path: "/onboarding" },\n            { name: "Performance Reviews", path: "/performance-reviews" }'
    )
    with open('src/front/js/component/Sidebar.js', 'w') as f:
        f.write(sidebar)
    print("✓ Sidebar updated")
PYEOF

# ============================================================
# 5. RUN MIGRATIONS
# ============================================================
echo "Running migrations..."
cd src && pipenv run flask db migrate -m "leafbridge resume onboarding performance reviews" 2>&1 | tail -3
pipenv run flask db upgrade 2>&1 | tail -3
cd ..

echo ""
echo "============================================================"
echo "✅ LEAFBRIDGE CONNECT FEATURES COMPLETE"
echo "============================================================"
echo ""
echo "New pages:"
echo "  ✓ /resume-builder   — Job seekers build their profile"
echo "  ✓ /resume-search    — Dispensaries find candidates"
echo "  ✓ /onboarding       — State-specific new hire checklists"
echo "  ✓ /performance-reviews — Manager rates employees"
echo ""
echo "New backend routes:"
echo "  ✓ GET/POST /api/resumes"
echo "  ✓ GET /api/resumes/me"
echo "  ✓ PUT /api/resumes/:id"
echo "  ✓ POST /api/resumes/upload"
echo "  ✓ GET/POST /api/saved-jobs"
echo "  ✓ GET/POST /api/onboarding"
echo "  ✓ PUT /api/onboarding/tasks/:id/complete"
echo "  ✓ GET/POST /api/performance-reviews"
echo "  ✓ PUT /api/performance-reviews/:id/acknowledge"
echo ""
echo "New models:"
echo "  ✓ Resume"
echo "  ✓ OnboardingChecklist"
echo "  ✓ OnboardingTask"
echo "  ✓ PerformanceReview"
echo "  ✓ SavedJob"
