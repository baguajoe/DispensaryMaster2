from celery import Celery
from .models import Compliance, create_app, datetime, timedelta  # Example: Database models

celery = Celery('your_project')
celery.conf.update(
    broker_url='redis://localhost:6379/0',  # Update with your broker URL
    result_backend='redis://localhost:6379/0',
)

@celery.task
def generate_report():
    with create_app().app_context():
        compliance_data = Compliance.query.all()
        print(f"Generated report for {len(compliance_data)} compliance entries.")

@celery.task
def clear_expired_carts():
    with create_app().app_context():
        expiry_time = datetime.utcnow() - timedelta(hours=24)
        Cart.query.filter(Cart.last_updated < expiry_time).delete()
        db.session.commit()
