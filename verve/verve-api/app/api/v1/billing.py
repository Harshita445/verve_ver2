import logging

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.core.config import get_settings
from app.db.session import get_db
from app.models.user import User
from app.services.billing_service import (
    create_billing_portal_session,
    create_checkout_session,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/billing", tags=["billing"])
settings = get_settings()


@router.post("/checkout")
def checkout(current_user: User = Depends(get_current_user)) -> dict:
    try:
        url = create_checkout_session(current_user)
    except Exception as e:
        logger.exception("Failed to create checkout session")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
    return {"url": url}


@router.post("/portal")
def portal(current_user: User = Depends(get_current_user)) -> dict:
    try:
        url = create_billing_portal_session(current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.exception("Failed to create portal session")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
    return {"url": url}


@router.post("/webhook")
async def webhook(request: Request, db: Session = Depends(get_db)) -> dict:
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
    except (ValueError, stripe.SignatureVerificationError) as e:
        logger.warning("Invalid webhook signature: %s", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

    event_type = event.get("type")
    data = event.get("data", {}).get("object", {})

    if event_type == "checkout.session.completed":
        customer_id = data.get("customer")
        if customer_id:
            user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
            if user:
                user.plan = "pro"
                db.commit()
                logger.info("User %s upgraded to pro plan", user.id)

    elif event_type == "customer.subscription.deleted":
        customer_id = data.get("customer")
        if customer_id:
            user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
            if user:
                user.plan = "free"
                db.commit()
                logger.info("User %s downgraded to free plan", user.id)

    return {"status": "ok"}
