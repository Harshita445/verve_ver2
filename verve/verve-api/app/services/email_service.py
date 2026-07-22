import logging
from dataclasses import dataclass

import resend

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@dataclass
class EmailParams:
    to: list[str]
    subject: str
    html: str
    from_: str = settings.email_from_address


def _send(params: EmailParams) -> None:
    if settings.resend_api_key is None:
        logger.warning("RESEND_API_KEY not set — skipping email to %s", params.to)
        return
    resend.api_key = settings.resend_api_key
    try:
        resend.Emails.send({
            "from": params.from_,
            "to": params.to,
            "subject": params.subject,
            "html": params.html,
        })
        logger.info("Email sent to %s: %s", params.to, params.subject)
    except Exception:
        logger.exception("Failed to send email to %s", params.to)


def send_password_reset_email(to_email: str, raw_token: str) -> None:
    url = f"{settings.frontend_url}/auth/reset-password?token={raw_token}"
    _send(EmailParams(
        to=[to_email],
        subject="Verve — Reset your password",
        html=(
            "<p>You requested a password reset.</p>"
            f'<p><a href="{url}">Click here to reset your password</a></p>'
            "<p>This link expires in 30 minutes. If you didn't request this, ignore this email.</p>"
        ),
    ))


def send_welcome_email(to_email: str, display_name: str) -> None:
    _send(EmailParams(
        to=[to_email],
        subject="Welcome to Verve",
        html=(
            f"<p>Hi {display_name},</p>"
            "<p>Welcome to Verve! Start your first practice session and begin improving your communication skills.</p>"
        ),
    ))


def send_feedback_ready_email(to_email: str, session_id: str) -> None:
    url = f"{settings.frontend_url}/training/feedback/{session_id}"
    _send(EmailParams(
        to=[to_email],
        subject="Verve — Your feedback is ready",
        html=(
            "<p>Your practice session has been analyzed.</p>"
            f'<p><a href="{url}">View your feedback</a></p>'
        ),
    ))
