import logging

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.support_ticket import SupportTicket
from app.schemas.support import SupportTicketCreate, SupportTicketOut

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/support", tags=["support"])


@router.post("", response_model=SupportTicketOut, status_code=status.HTTP_201_CREATED)
def create_support_ticket(
    payload: SupportTicketCreate,
    db: Session = Depends(get_db),
) -> SupportTicket:
    ticket = SupportTicket(
        email=str(payload.email),
        subject=payload.subject,
        message=payload.message,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    logger.info("Support ticket #%d created from %s", ticket.id, ticket.email)
    return ticket
