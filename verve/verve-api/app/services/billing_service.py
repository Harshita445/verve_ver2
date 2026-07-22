import logging
from dataclasses import dataclass

import stripe

from app.core.config import get_settings
from app.models.user import User

logger = logging.getLogger(__name__)
settings = get_settings()


def _get_stripe():
    if settings.stripe_secret_key:
        stripe.api_key = settings.stripe_secret_key
    return stripe


def create_checkout_session(user: User) -> str:
    s = _get_stripe()
    customer_id = user.stripe_customer_id
    if not customer_id:
        customer = s.Customer.create(email=user.email, metadata={"user_id": str(user.id)})
        customer_id = customer.id
        from app.db.session import SessionLocal
        db = SessionLocal()
        try:
            db_user = db.get(User, user.id)
            if db_user:
                db_user.stripe_customer_id = customer_id
                db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()

    session = s.checkout.Session.create(
        customer=customer_id,
        mode="subscription",
        line_items=[{"price": settings.stripe_price_id_pro, "quantity": 1}],
        success_url=f"{settings.frontend_url}/dashboard?billing=success",
        cancel_url=f"{settings.frontend_url}/dashboard?billing=cancel",
    )
    return session.url


def create_billing_portal_session(user: User) -> str:
    s = _get_stripe()
    customer_id = user.stripe_customer_id
    if not customer_id:
        raise ValueError("User has no Stripe customer ID")
    session = s.billing_portal.Session.create(
        customer=customer_id,
        return_url=f"{settings.frontend_url}/dashboard",
    )
    return session.url
