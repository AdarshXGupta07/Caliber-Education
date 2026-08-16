from typing import Optional
from supabase import Client


def storage_path_from_url(url: str, bucket: str) -> Optional[str]:
    """Extracts the in-bucket path from a stored `/storage/v1/object/public/...`
    URL string. Submission/evaluation files are stored in the DB as this
    public-style URL for historical reasons, but that URL is never handed to
    a client directly anymore (see signed_url_for) — this just recovers the
    path so cleanup/purge/signing code can address the object."""
    if not url:
        return None
    marker = f"/storage/v1/object/public/{bucket}/"
    return url.split(marker, 1)[1] if marker in url else None


def signed_url_for(db: Client, bucket: str, stored_url: str, expires_in: int = 300) -> Optional[str]:
    """Turns a stored public-style URL into a short-lived signed URL, minted
    on demand. Submissions and evaluated papers are personal academic
    records (answer sheets, marks, mentor remarks) — a permanent,
    unauthenticated public URL would let anyone who ever sees the link
    (a forwarded email, browser history, a cache) access it forever. This
    keeps the DB storage format unchanged (still the public-style URL, so
    existing cleanup/purge code that parses it keeps working) but ensures
    only a caller who already passed this endpoint's own auth/ownership
    check ever receives a working link, and that link expires quickly.
    Works whether the bucket is Public or Private in Supabase."""
    path = storage_path_from_url(stored_url, bucket)
    if not path:
        return None
    try:
        result = db.storage.from_(bucket).create_signed_url(path, expires_in)
        return result.get("signedURL")
    except Exception as e:
        print(f"[STORAGE] Failed to sign URL for {bucket}/{path}: {e}")
        return None
