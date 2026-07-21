import logging
import time
from collections import defaultdict

logger = logging.getLogger(__name__)


class RateLimiter:
    """Simple in-memory sliding-window rate limiter.

    Tracks request counts per key (typically IP + endpoint) and rejects
    when the count exceeds `max_attempts` within `window_seconds`.
    """

    def __init__(self) -> None:
        self._attempts: dict[str, list[float]] = defaultdict(list)

    def check(self, key: str, max_attempts: int = 5, window_seconds: int = 60) -> bool:
        now = time.time()
        cutoff = now - window_seconds
        self._attempts[key] = [t for t in self._attempts[key] if t > cutoff]

        if len(self._attempts[key]) >= max_attempts:
            logger.warning("Rate limit hit for key=%s (%d in %ds)", key, len(self._attempts[key]), window_seconds)
            return False

        self._attempts[key].append(now)
        return True


rate_limiter = RateLimiter()
