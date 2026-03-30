import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(to_email, subject, body):
    """
    Send an email. Configure SMTP settings via environment variables.
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
    """
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")

    if not smtp_user or not smtp_password:
        print(f"[Email] Would send to {to_email}: {subject}")
        return {"success": True, "message": "Email logging only (SMTP not configured)"}

    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, to_email, msg.as_string())

        return {"success": True, "message": "Email sent"}
    except Exception as e:
        print(f"[Email Error] {str(e)}")
        return {"success": False, "error": str(e)}
