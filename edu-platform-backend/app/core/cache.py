import time
from typing import Any, Callable

_store: dict[str, tuple[float, Any]] = {}


def cached(key: str, ttl_seconds: float, fetch: Callable[[], Any]) -> Any:
    """Simple in-memory TTL cache for read-heavy, rarely-changing data
    (catalog/pricing lookups) shared across all requests in this process.

    Not distributed and not invalidated on write — deliberately short TTLs
    only, so an admin edit shows up within `ttl_seconds` instead of needing
    explicit cache-busting on every write path.
    """
    now = time.monotonic()
    hit = _store.get(key)
    if hit is not None and hit[0] > now:
        return hit[1]
    value = fetch()
    _store[key] = (now + ttl_seconds, value)
    return value
