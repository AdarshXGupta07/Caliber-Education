"""Pluggable outbound-email sending.

Only SendGrid is implemented today, but every call site goes through
`send_email()` — swapping to Resend or another provider later means adding
one class here and changing `get_email_provider()`, not touching auth.py,
payments.py, admin.py, or contact.py.
"""
from typing import Protocol

import httpx

from app.core.config import get_settings


class EmailProvider(Protocol):
    async def send(self, to_email: str, subject: str, html_content: str) -> bool: ...


class SendGridProvider:
    async def send(self, to_email: str, subject: str, html_content: str) -> bool:
        settings = get_settings()
        if not settings.sendgrid_api_key:
            return False
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://api.sendgrid.com/v3/mail/send",
                    headers={"Authorization": f"Bearer {settings.sendgrid_api_key}"},
                    json={
                        "personalizations": [{"to": [{"email": to_email}]}],
                        "from": {"email": settings.sendgrid_from_email},
                        "subject": subject,
                        "content": [{"type": "text/html", "value": html_content}],
                    },
                )
                return res.status_code < 300
        except Exception as e:
            print(f"[EMAIL] SendGrid send failed to {to_email}: {e}")
            return False


class NullProvider:
    """Used when no provider is configured — logs instead of sending."""
    async def send(self, to_email: str, subject: str, html_content: str) -> bool:
        print(f"[EMAIL STUB] Would send to {to_email}: {subject}")
        return False


def get_email_provider() -> EmailProvider:
    settings = get_settings()
    if settings.sendgrid_api_key:
        return SendGridProvider()
    return NullProvider()


async def send_email(to_email: str, subject: str, html_content: str) -> bool:
    return await get_email_provider().send(to_email, subject, html_content)
