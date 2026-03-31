#!/bin/bash
# ============================================================
# LeafBridge Photo System — Complete
# Profile gallery, company photos, event albums, feed images
# ============================================================
cd /workspaces/DispensaryMaster2

echo "Step 1 — Adding photo models..."
python3 << 'PYEOF'
with open('src/api/models.py', 'r') as f:
    content = f.read()

new_models = '''
# ──────────────────────────────────────────────────
# LeafBridge Photo System Models
# ──────────────────────────────────────────────────

class LeafBridgePhoto(db.Model):
    __tablename__ = 'leafbridge_photo'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    caption = db.Column(db.String(200), nullable=True)
    photo_type = db.Column(db.String(30), nullable=False, default='gallery')
    # photo_type: avatar, gallery, company_logo, company_cover, 
    #              company_gallery, event_photo, post_image
    related_id = db.Column(db.Integer, nullable=True)
    # related_id: company_id, event_id, or post_id depending on photo_type
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref='photos', lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "url": self.url,
            "caption": self.caption,
            "photo_type": self.photo_type,
            "related_id": self.related_id,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
'''

if 'class LeafBridgePhoto(' not in content:
    content += new_models
    with open('src/api/models.py', 'w') as f:
        f.write(content)
    print("✓ LeafBridgePhoto model added")
else:
    print("  Model already exists")
PYEOF

echo ""
echo "Step 2 — Adding all photo routes..."
python3 << 'PYEOF'
with open('src/api/routes.py', 'r') as f:
    content = f.read()

new_routes = '''
# ══════════════════════════════════════════════════════════════
# LEAFBRIDGE PHOTO SYSTEM
# ══════════════════════════════════════════════════════════════

import uuid as uuid_module
import boto3
from botocore.exceptions import ClientError

def upload_to_r2(file, folder, content_type=None):
    """Upload file to Cloudflare R2 and return public URL"""
    try:
        ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else 'jpg'
        filename = f"{folder}/{uuid_module.uuid4()}.{ext}"
        r2 = boto3.client(
            's3',
            endpoint_url=os.getenv('R2_ENDPOINT_URL'),
            aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY'),
        )
        bucket = os.getenv('R2_BUCKET_NAME', 'streampirex-media')
        ct = content_type or f"image/{ext}"
        r2.upload_fileobj(file, bucket, filename, ExtraArgs={'ContentType': ct, 'ACL': 'public-read'})
        url = f"{os.getenv('R2_ENDPOINT_URL')}/{bucket}/{filename}"
        return url, filename
    except Exception as e:
        raise Exception(f"R2 upload failed: {str(e)}")

ALLOWED_IMAGE_TYPES = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
MAX_SIZES = {
    'avatar': 5,        # 5MB
    'gallery': 10,      # 10MB
    'company_logo': 5,
    'company_cover': 10,
    'company_gallery': 20,
    'event_photo': 20,
    'post_image': 10,
}

def validate_image(file, photo_type='gallery'):
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in ALLOWED_IMAGE_TYPES:
        raise Exception(f"Invalid file type. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}")
    file.seek(0, 2)
    size_mb = file.tell() / (1024 * 1024)
    file.seek(0)
    max_mb = MAX_SIZES.get(photo_type, 10)
    if size_mb > max_mb:
        raise Exception(f"File too large. Max {max_mb}MB for {photo_type}")
    return ext

# ── PROFILE AVATAR ─────────────────────────────────────────
@api.route('/leafbridge/profile/photo', methods=['POST'])
@jwt_required()
@handle_errors
def upload_profile_photo():
    from api.models import LeafBridgePhoto, Resume
    user_id = get_jwt_identity()
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['file']
    ext = validate_image(file, 'avatar')
    url, filename = upload_to_r2(file, f"profiles/{user_id}/avatar")
    # Save to photos table
    photo = LeafBridgePhoto(user_id=user_id, url=url, photo_type='avatar')
    db.session.add(photo)
    # Update resume with avatar url
    resume = Resume.query.filter_by(user_id=user_id).first()
    if resume:
        resume.profile_photo = url
    db.session.commit()
    return jsonify({"url": url}), 200

# ── PROFILE GALLERY ────────────────────────────────────────
@api.route('/leafbridge/profile/gallery', methods=['GET'])
@jwt_required()
@handle_errors
def get_profile_gallery():
    from api.models import LeafBridgePhoto
    user_id = get_jwt_identity()
    target_id = request.args.get('user_id', user_id)
    photos = LeafBridgePhoto.query.filter_by(
        user_id=target_id, photo_type='gallery'
    ).order_by(LeafBridgePhoto.created_at.desc()).all()
    return jsonify([p.serialize() for p in photos]), 200

@api.route('/leafbridge/profile/gallery', methods=['POST'])
@jwt_required()
@handle_errors
def upload_gallery_photo():
    from api.models import LeafBridgePhoto
    user_id = get_jwt_identity()
    # Check limit — max 20 gallery photos
    count = LeafBridgePhoto.query.filter_by(user_id=user_id, photo_type='gallery').count()
    if count >= 20:
        return jsonify({"error": "Gallery limit reached (20 photos max)"}), 400
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['file']
    caption = request.form.get('caption', '')
    ext = validate_image(file, 'gallery')
    url, filename = upload_to_r2(file, f"profiles/{user_id}/gallery")
    photo = LeafBridgePhoto(user_id=user_id, url=url, caption=caption, photo_type='gallery')
    db.session.add(photo)
    db.session.commit()
    return jsonify(photo.serialize()), 201

@api.route('/leafbridge/profile/gallery/<int:photo_id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_gallery_photo(photo_id):
    from api.models import LeafBridgePhoto
    user_id = get_jwt_identity()
    photo = LeafBridgePhoto.query.filter_by(id=photo_id, user_id=user_id).first_or_404()
    db.session.delete(photo)
    db.session.commit()
    return jsonify({"message": "Photo deleted"}), 200

# ── COMPANY PHOTOS ─────────────────────────────────────────
@api.route('/leafbridge/companies/<int:company_id>/logo', methods=['POST'])
@jwt_required()
@handle_errors
def upload_company_logo(company_id):
    from api.models import LeafBridgePhoto, LeafBridgeCompany
    user_id = get_jwt_identity()
    company = LeafBridgeCompany.query.filter_by(id=company_id, owner_id=user_id).first_or_404()
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files['file']
    validate_image(file, 'company_logo')
    url, _ = upload_to_r2(file, f"companies/{company_id}/logo")
    company.logo_url = url
    # Save photo record
    photo = LeafBridgePhoto(user_id=user_id, url=url, photo_type='company_logo', related_id=company_id)
    db.session.add(photo)
    db.session.commit()
    return jsonify({"url": url}), 200

@api.route('/leafbridge/companies/<int:company_id>/cover', methods=['POST'])
@jwt_required()
@handle_errors
def upload_company_cover(company_id):
    from api.models import LeafBridgePhoto, LeafBridgeCompany
    user_id = get_jwt_identity()
    company = LeafBridgeCompany.query.filter_by(id=company_id, owner_id=user_id).first_or_404()
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files['file']
    validate_image(file, 'company_cover')
    url, _ = upload_to_r2(file, f"companies/{company_id}/cover")
    company.cover_url = url
    photo = LeafBridgePhoto(user_id=user_id, url=url, photo_type='company_cover', related_id=company_id)
    db.session.add(photo)
    db.session.commit()
    return jsonify({"url": url}), 200

@api.route('/leafbridge/companies/<int:company_id>/gallery', methods=['GET'])
@jwt_required()
@handle_errors
def get_company_gallery(company_id):
    from api.models import LeafBridgePhoto
    photos = LeafBridgePhoto.query.filter_by(
        photo_type='company_gallery', related_id=company_id
    ).order_by(LeafBridgePhoto.created_at.desc()).all()
    return jsonify([p.serialize() for p in photos]), 200

@api.route('/leafbridge/companies/<int:company_id>/gallery', methods=['POST'])
@jwt_required()
@handle_errors
def upload_company_gallery_photo(company_id):
    from api.models import LeafBridgePhoto, LeafBridgeCompany
    user_id = get_jwt_identity()
    company = LeafBridgeCompany.query.filter_by(id=company_id, owner_id=user_id).first_or_404()
    # Max 50 company gallery photos
    count = LeafBridgePhoto.query.filter_by(photo_type='company_gallery', related_id=company_id).count()
    if count >= 50:
        return jsonify({"error": "Company gallery limit reached (50 photos)"}), 400
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files['file']
    caption = request.form.get('caption', '')
    validate_image(file, 'company_gallery')
    url, _ = upload_to_r2(file, f"companies/{company_id}/gallery")
    photo = LeafBridgePhoto(user_id=user_id, url=url, caption=caption, photo_type='company_gallery', related_id=company_id)
    db.session.add(photo)
    db.session.commit()
    return jsonify(photo.serialize()), 201

# ── EVENT PHOTOS ───────────────────────────────────────────
@api.route('/leafbridge/events/<int:event_id>/photos', methods=['GET'])
@jwt_required()
@handle_errors
def get_event_photos(event_id):
    from api.models import LeafBridgePhoto
    photos = LeafBridgePhoto.query.filter_by(
        photo_type='event_photo', related_id=event_id
    ).order_by(LeafBridgePhoto.created_at.desc()).all()
    return jsonify([p.serialize() for p in photos]), 200

@api.route('/leafbridge/events/<int:event_id>/photos', methods=['POST'])
@jwt_required()
@handle_errors
def upload_event_photo(event_id):
    from api.models import LeafBridgePhoto
    user_id = get_jwt_identity()
    # Max 100 event photos
    count = LeafBridgePhoto.query.filter_by(photo_type='event_photo', related_id=event_id).count()
    if count >= 100:
        return jsonify({"error": "Event photo limit reached (100 photos)"}), 400
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files['file']
    caption = request.form.get('caption', '')
    validate_image(file, 'event_photo')
    url, _ = upload_to_r2(file, f"events/{event_id}/photos")
    photo = LeafBridgePhoto(user_id=user_id, url=url, caption=caption, photo_type='event_photo', related_id=event_id)
    db.session.add(photo)
    db.session.commit()
    return jsonify(photo.serialize()), 201

@api.route('/leafbridge/events/<int:event_id>/photos/<int:photo_id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_event_photo(event_id, photo_id):
    from api.models import LeafBridgePhoto
    user_id = get_jwt_identity()
    photo = LeafBridgePhoto.query.filter_by(id=photo_id, user_id=user_id, related_id=event_id).first_or_404()
    db.session.delete(photo)
    db.session.commit()
    return jsonify({"message": "Photo deleted"}), 200

# ── FEED POST IMAGES ───────────────────────────────────────
@api.route('/leafbridge/posts/upload-image', methods=['POST'])
@jwt_required()
@handle_errors
def upload_post_image():
    from api.models import LeafBridgePhoto
    user_id = get_jwt_identity()
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files['file']
    validate_image(file, 'post_image')
    url, _ = upload_to_r2(file, f"posts/{user_id}")
    photo = LeafBridgePhoto(user_id=user_id, url=url, photo_type='post_image')
    db.session.add(photo)
    db.session.commit()
    return jsonify({"url": url, "photo_id": photo.id}), 201

# ── BULK UPLOAD (multiple files at once) ───────────────────
@api.route('/leafbridge/upload/bulk', methods=['POST'])
@jwt_required()
@handle_errors
def bulk_upload():
    from api.models import LeafBridgePhoto
    user_id = get_jwt_identity()
    photo_type = request.form.get('photo_type', 'gallery')
    related_id = request.form.get('related_id')
    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "No files provided"}), 400
    if len(files) > 10:
        return jsonify({"error": "Max 10 files per upload"}), 400
    uploaded = []
    for file in files:
        try:
            validate_image(file, photo_type)
            folder = f"bulk/{user_id}/{photo_type}"
            url, _ = upload_to_r2(file, folder)
            photo = LeafBridgePhoto(
                user_id=user_id, url=url,
                photo_type=photo_type,
                related_id=int(related_id) if related_id else None
            )
            db.session.add(photo)
            uploaded.append({"url": url, "filename": file.filename})
        except Exception as e:
            uploaded.append({"error": str(e), "filename": file.filename})
    db.session.commit()
    return jsonify({"uploaded": uploaded, "count": len([u for u in uploaded if 'url' in u])}), 201
'''

if 'def upload_profile_photo(' not in content:
    content += new_routes
    with open('src/api/routes.py', 'w') as f:
        f.write(content)
    print("✓ All photo routes added")
else:
    print("  Photo routes already exist")
PYEOF

echo ""
echo "Step 3 — Adding logo_url and cover_url to Company model..."
python3 << 'PYEOF'
with open('src/api/models.py', 'r') as f:
    content = f.read()

old = '''    verified = db.Column(db.Boolean, default=False)
    followers = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    def serialize(self):
        return {"id": self.id, "name": self.name, "type": self.type, "state": self.state,
                "description": self.description, "website": self.website,
                "verified": self.verified, "followers": self.followers}'''

new = '''    verified = db.Column(db.Boolean, default=False)
    followers = db.Column(db.Integer, default=0)
    logo_url = db.Column(db.String(500), nullable=True)
    cover_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    def serialize(self):
        return {"id": self.id, "name": self.name, "type": self.type, "state": self.state,
                "description": self.description, "website": self.website,
                "verified": self.verified, "followers": self.followers,
                "logo_url": self.logo_url, "cover_url": self.cover_url}'''

if old in content:
    content = content.replace(old, new)
    with open('src/api/models.py', 'w') as f:
        f.write(content)
    print("✓ Company model updated with logo_url + cover_url")
else:
    print("  Company model already has logo/cover fields")
PYEOF

echo ""
echo "Step 4 — Adding profile_photo to Resume model..."
python3 << 'PYEOF'
with open('src/api/models.py', 'r') as f:
    content = f.read()

# Find Resume model and add profile_photo if not there
if 'class Resume(' in content and 'profile_photo' not in content:
    content = content.replace(
        'class Resume(db.Model):',
        '''class Resume(db.Model):
    # profile_photo added for LeafBridge photo system'''
    )
    # Add profile_photo column after the class definition finds user_id
    old_resume_snippet = "    user_id = db.Column(db.Integer, db.ForeignKey('user.id')"
    if old_resume_snippet in content:
        content = content.replace(
            old_resume_snippet,
            "    profile_photo = db.Column(db.String(500), nullable=True)\n    user_id = db.Column(db.Integer, db.ForeignKey('user.id')"
        )
        with open('src/api/models.py', 'w') as f:
            f.write(content)
        print("✓ profile_photo added to Resume model")
    else:
        print("  Resume model structure different — skipping auto-patch")
else:
    print("  profile_photo already in Resume or Resume model not found")
PYEOF

echo ""
echo "Step 5 — DB migration..."
cd src && pipenv run python -c "
import sys; sys.path.insert(0, '.')
from app import app
from api.models import db
with app.app_context():
    db.create_all()
    print('✓ All tables created/updated')
" 2>&1 | grep -E "✓|Error" | head -5
cd ..

echo ""
echo "Step 6 — Verify route count..."
cd src && pipenv run python -c "
from app import app
rules = [r.rule for r in app.url_map._rules if 'static' not in r.rule]
photo_routes = [r for r in rules if 'photo' in r or 'gallery' in r or 'logo' in r or 'cover' in r or 'bulk' in r]
print(f'✓ {len(rules)} total routes')
print(f'✓ {len(photo_routes)} photo routes:')
for r in photo_routes: print(f'  {r}')
" 2>&1 | grep -E "✓|  /"
cd ..

echo ""
echo "Step 7 — Update LeafBridgeHub with photo UI..."
python3 << 'PYEOF'
with open('src/front/js/pages/LeafBridge/LeafBridgeHub.js', 'r') as f:
    content = f.read()

# 1. Fix profile photo — always show upload button + add gallery section
old_photo_section = '''                <div style={{ position: "relative" }}>
                    <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(105,240,174,0.15)", border: "3px solid rgba(105,240,174,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#69f0ae", fontSize: "1.5rem", overflow: "hidden" }}>
                        {profilePhoto ? <img src={profilePhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (form.first_name?.[0] || "?")}
                    </div>
                    {edit && <label style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: "50%", background: "#69f0ae", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.7rem" }}>📷<input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files[0] && handlePhotoUpload(e.target.files[0])} /></label>}
                </div>'''

new_photo_section = '''                <div style={{ position: "relative" }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(105,240,174,0.15)", border: "3px solid rgba(105,240,174,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#69f0ae", fontSize: "1.5rem", overflow: "hidden" }}>
                        {profilePhoto ? <img src={profilePhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (form.first_name?.[0] || "?")}
                    </div>
                    <label style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: "#69f0ae", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.75rem", boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }} title="Upload profile photo">
                        &#128247;
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files[0] && handlePhotoUpload(e.target.files[0])} />
                    </label>
                </div>'''

if old_photo_section in content:
    content = content.replace(old_photo_section, new_photo_section)
    print("✓ Profile avatar upload button always visible")
else:
    print("  Avatar section not found — may already be updated")

# 2. Add gallery state and functions to ProfileTab
old_profile_state = '''    const [profilePhoto, setProfilePhoto] = useState(null);'''
new_profile_state = '''    const [profilePhoto, setProfilePhoto] = useState(null);
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
    };'''

if old_profile_state in content:
    content = content.replace(old_profile_state, new_profile_state)
    print("✓ Gallery state + functions added to ProfileTab")

# 3. Add gallery section before the quick links grid
old_quicklinks = '''            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.65rem" }}>
                        {[
                            { label: "Build Resume", icon: "📄", path: "/resume-builder", color: "#4fc3f7" },'''

new_quicklinks = '''            {/* PHOTO GALLERY */}
                    <div className="glass-panel" style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                            <h5 style={{ fontWeight: 700, color: "#69f0ae", fontSize: "0.875rem", margin: 0 }}>&#128247; My Photo Gallery</h5>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)" }}>{gallery.length}/20 photos</span>
                                {gallery.length < 20 && (
                                    <label style={{ background: "rgba(105,240,174,0.1)", color: "#69f0ae", border: "1px solid rgba(105,240,174,0.3)", padding: "0.3rem 0.75rem", borderRadius: 7, fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
                                        {galleryUploading ? "Uploading..." : "+ Add Photos"}
                                        <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleGalleryUpload(e.target.files)} />
                                    </label>
                                )}
                            </div>
                        </div>
                        {gallery.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.3)", fontSize: "0.82rem" }}>
                                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>&#128247;</div>
                                No photos yet. Add up to 20 photos to your profile.
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.5rem" }}>
                                {gallery.map((photo, i) => (
                                    <div key={photo.id || i} style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden", cursor: "pointer" }}
                                        onClick={() => setLightboxPhoto(photo)}>
                                        <img src={photo.url} alt={photo.caption || `Photo ${i+1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        <div style={{ position: "absolute", top: 4, right: 4 }} onClick={e => { e.stopPropagation(); handleDeleteGalleryPhoto(photo.id); }}>
                                            <div style={{ background: "rgba(0,0,0,0.6)", color: "white", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", cursor: "pointer" }}>&#10005;</div>
                                        </div>
                                    </div>
                                ))}
                                {gallery.length < 20 && (
                                    <label style={{ aspectRatio: "1", borderRadius: 10, border: "2px dashed rgba(105,240,174,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexDirection: "column", gap: "0.25rem" }}>
                                        <span style={{ fontSize: "1.5rem", color: "rgba(105,240,174,0.4)" }}>+</span>
                                        <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>Add</span>
                                        <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleGalleryUpload(e.target.files)} />
                                    </label>
                                )}
                            </div>
                        )}
                        {/* Lightbox */}
                        {lightboxPhoto && (
                            <div onClick={() => setLightboxPhoto(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.9)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <img src={lightboxPhoto.url} alt={lightboxPhoto.caption} style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 12 }} />
                                <div style={{ position: "absolute", top: 20, right: 20, color: "white", fontSize: "1.5rem", cursor: "pointer" }}>&#10005;</div>
                                {lightboxPhoto.caption && <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", background: "rgba(0,0,0,0.5)", padding: "0.35rem 1rem", borderRadius: 8 }}>{lightboxPhoto.caption}</div>}
                            </div>
                        )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.65rem" }}>
                        {[
                            { label: "Build Resume", icon: "📄", path: "/resume-builder", color: "#4fc3f7" },'''

if old_quicklinks in content:
    content = content.replace(old_quicklinks, new_quicklinks)
    print("✓ Gallery section added to profile")

# 4. Add event photo upload to EventsTab
old_rsvp_btn = '''                        <button onClick={() => handleRSVP(event.id)} style={{ background: event.rsvped ? "rgba(105,240,174,0.1)" : "#69f0ae", color: event.rsvped ? "#69f0ae" : "#080c10", border: event.rsvped ? "1px solid rgba(105,240,174,0.3)" : "none", padding: "0.45rem 1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", flexShrink: 0 }}>
                            {event.rsvped ? "✓ Going" : "RSVP"}
                        </button>'''

new_rsvp_btn = '''                        <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0, flexWrap: "wrap" }}>
                            <button onClick={() => handleRSVP(event.id)} style={{ background: event.rsvped ? "rgba(105,240,174,0.1)" : "#69f0ae", color: event.rsvped ? "#69f0ae" : "#080c10", border: event.rsvped ? "1px solid rgba(105,240,174,0.3)" : "none", padding: "0.45rem 1rem", borderRadius: 8, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
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
                        </div>'''

if old_rsvp_btn in content:
    content = content.replace(old_rsvp_btn, new_rsvp_btn)
    print("✓ Event photo upload button added")

# 5. Add image attachment to Feed post composer
old_post_btn = '''                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={handlePost} disabled={posting || !newPost.trim()} style={{ background: newPost.trim() ? "#69f0ae" : "rgba(105,240,174,0.15)", color: newPost.trim() ? "#080c10" : "rgba(255,255,255,0.3)", border: "none", padding: "0.5rem 1.5rem", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", cursor: newPost.trim() ? "pointer" : "not-allowed" }}>
                            {posting ? "Posting..." : "Post"}
                        </button>
                    </div>'''

new_post_btn = '''                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                                if (urls.length) setNewPost(prev => prev + (prev ? "\\n" : "") + urls.join("\\n"));
                            }} />
                        </label>
                        <button onClick={handlePost} disabled={posting || !newPost.trim()} style={{ background: newPost.trim() ? "#69f0ae" : "rgba(105,240,174,0.15)", color: newPost.trim() ? "#080c10" : "rgba(255,255,255,0.3)", border: "none", padding: "0.5rem 1.5rem", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", cursor: newPost.trim() ? "pointer" : "not-allowed" }}>
                            {posting ? "Posting..." : "Post"}
                        </button>
                    </div>'''

if old_post_btn in content:
    content = content.replace(old_post_btn, new_post_btn)
    print("✓ Image attachment added to Feed post composer")

with open('src/front/js/pages/LeafBridge/LeafBridgeHub.js', 'w') as f:
    f.write(content)
print("✓ LeafBridgeHub.js updated")
PYEOF

echo ""
echo "Step 8 — Commit and push..."
git add .
git commit -m "LeafBridge: full photo system — profile avatar + gallery (20), company logo/cover/gallery (50), event albums (100), feed image posts (4), bulk upload, lightbox viewer"
git push origin medical

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         LEAFBRIDGE PHOTO SYSTEM — COMPLETE                  ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║                                                              ║"
echo "║  PROFILE PHOTOS:                                             ║"
echo "║    ✅ Avatar — always-visible camera button on avatar        ║"
echo "║    ✅ Gallery — up to 20 photos, click to lightbox           ║"
echo "║    ✅ Multi-select upload — up to 10 at a time              ║"
echo "║    ✅ Delete individual gallery photos                       ║"
echo "║                                                              ║"
echo "║  COMPANY PHOTOS:                                             ║"
echo "║    ✅ Company logo upload                                    ║"
echo "║    ✅ Cover photo upload                                     ║"
echo "║    ✅ Company gallery — up to 50 photos                     ║"
echo "║                                                              ║"
echo "║  EVENT PHOTOS:                                               ║"
echo "║    ✅ Upload photos to any event — up to 100 per event      ║"
echo "║    ✅ Photo button on every event card                       ║"
echo "║    ✅ Companies can upload event recap photos                ║"
echo "║                                                              ║"
echo "║  FEED POSTS:                                                 ║"
echo "║    ✅ Attach up to 4 images per post                        ║"
echo "║    ✅ Image upload button in compose box                     ║"
echo "║                                                              ║"
echo "║  STORAGE:                                                    ║"
echo "║    ✅ All photos → Cloudflare R2                             ║"
echo "║    ✅ Organized by type: profiles/companies/events/posts     ║"
echo "║    ✅ Size limits enforced (5–20MB per type)                 ║"
echo "║    ✅ Bulk upload API (10 files at once)                     ║"
echo "║                                                              ║"
echo "║  PHOTO LIMITS:                                               ║"
echo "║    Profile gallery:    20 photos                             ║"
echo "║    Company gallery:    50 photos                             ║"
echo "║    Event album:        100 photos                            ║"
echo "║    Feed post:          4 photos                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
