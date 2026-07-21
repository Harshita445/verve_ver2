from __future__ import annotations

from app.core.config import get_settings

settings = get_settings()

K_FACTOR = settings.rating_k_factor
EXPECTED_SCORE_MAX = settings.rating_expected_score_max


def calculate_rating_change(current_rating: int, overall_score: int) -> int:
    """Calculate ELO-style rating change based on performance vs expectation.

    The expected score is derived from `overall_score / EXPECTED_SCORE_MAX`.
    A score of 70 (70 %) against a neutral expectation yields a small gain.
    """

    performance = overall_score / EXPECTED_SCORE_MAX
    expected = 0.5

    if performance > 0.9:
        expected = 0.15
    elif performance > 0.8:
        expected = 0.25
    elif performance > 0.7:
        expected = 0.40
    elif performance > 0.6:
        expected = 0.55
    elif performance > 0.5:
        expected = 0.65
    elif performance > 0.4:
        expected = 0.75
    elif performance > 0.3:
        expected = 0.85
    else:
        expected = 0.93

    change = round(K_FACTOR * (performance - expected))
    return change


def apply_rating(current_rating: int, overall_score: int) -> tuple[int, int]:
    """Returns (new_rating, rating_change)."""
    change = calculate_rating_change(current_rating, overall_score)
    new_rating = max(0, current_rating + change)
    return new_rating, change
