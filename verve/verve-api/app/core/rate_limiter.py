import logging
import time
from collections import defaultdict

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def _get_redis():
    try:
        import redis as redis_lib
        return redis_lib.Redis.from_url(settings.celery_broker_url, decode_responses=True)
    except ImportError:
        logger.warning("Redis package not installed — rate limiter using in-memory fallback")
        return None
    except Exception:
        logger.warning("Redis unavailable for rate limiter — failing open")
        return None


class RateLimiter:
    """Redis-backed sliding-window rate limiter.

    Falls back to in-memory (or simply allows the request) if Redis is
    unavailable, so a rate-limiter outage never takes down the API.
    """

    def __init__(self) -> None:
        self._fallback: dict[str, list[float]] = defaultdict(list)

    def check(self, key: str, max_attempts: int = 5, window_seconds: int = 60) -> bool:
        now = time.time()
        cutoff = now - window_seconds
        redis_key = f"rl:{key}"

        r = _get_redis()
        if r is None:
            # Fallback to in-memory sliding window
            self._fallback[key] = [t for t in self._fallback[key] if t > cutoff]
            if len(self._fallback[key]) >= max_attempts:
                logger.warning("Rate limit hit (in-memory fallback) for key=%s (%d in %ds)", key, len(self._fallback[key]), window_seconds)
                return False
            self._fallback[key].append(now)
            return True

        try:
            pipe = r.pipeline()
            pipe.zremrangebyscore(redis_key, 0, cutoff)
            pipe.zcard(redis_key)
            results = pipe.execute()
            count = results[1]

            if count >= max_attempts:
                logger.warning("Rate limit hit for key=%s (%d in %ds)", key, count, window_seconds)
                return False

            r.zadd(redis_key, {str(now): now})
            r.expire(redis_key, window_seconds)
            return True
        except Exception:
            logger.warning("Redis command failed in rate limiter — failing open for key=%s", key)
            return True
        finally:
            r.close()


rate_limiter = RateLimiter()
