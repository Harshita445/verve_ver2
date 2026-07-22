from __future__ import annotations

import json
import logging
from typing import Any

from app.core.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


class FeedbackEngineError(Exception):
    pass


FEEDBACK_PROMPT = """You are a communication coach with decades of experience. Analyze the following practice session transcript and return a JSON object with these exact keys:

- overall_score: integer 0-100
- structure_score: integer 0-100
- relevance_score: integer 0-100
- evidence_score: integer 0-100
- persuasion_score: integer 0-100
- confidence_score: integer 0-100
- examples_score: integer 0-100

- strongest_skill: string (one of: Structure, Relevance, Evidence, Persuasion, Confidence, Examples)
- weakest_skill: string
- next_focus: string (a warm, actionable one-sentence piece of advice)
- summary: string (2-3 sentence overall assessment, written as a coach would speak — encouraging, human, specific)

- skills: array of 8 objects, each with:
  - name: "Structure" | "Relevance" | "Evidence" | "Persuasion" | "Confidence" | "Examples" | "Transitions" | "Storytelling"
  - score: integer 0-100
  - description: string (2-sentence observation of how they performed)
  - improvement_tip: string (specific, actionable tip to improve this skill)

- timeline: array of 5-7 significant moments from the recording, each with:
  - timestamp_seconds: integer (when in the recording this moment occurred)
  - label: string (short label e.g. "Strong Opening", "Long Pause", "Good Example", "Weak Transition", "Strong Conclusion")
  - description: string (1-sentence observation)
  - type: "strong" | "weakness" | "improvement" | "neutral"

- transcript_annotations: array of 3-5 key passages from the transcript with coaching notes:
  - text: string (the exact passage, quoted directly from the transcript)
  - annotation: string (coaching note about this passage)
  - type: "strong" | "weakness" | "neutral"

- statistics:
  - duration_seconds: integer (total speaking time)
  - words_spoken: integer (estimated total words)
  - speaking_rate_wpm: float (words per minute, or null if cannot estimate)
  - longest_pause_seconds: float (or null)
  - filler_word_count: integer (estimated count of "um", "uh", "like", "you know", etc.)
  - vocabulary_diversity: float 0.0-1.0 (type-token ratio estimate, or null)
  - sentence_variety: float 0.0-1.0 (mix of short/medium/long sentences, or null)
  - avg_response_length_words: float (or null)

- next_challenge:
  - mode: "impromptu" | "debate" | "interview" | "storytelling"
  - difficulty: "beginner" | "intermediate" | "advanced"
  - reason: string (why this challenge is recommended for this user)

Session mode: {mode}
Prompt: {prompt}
Transcript:
{transcript}

IMPORTANT: Return ONLY valid JSON. Every field is required unless noted as optional.
"""


class FeedbackEngine:
    """Generates structured communication feedback via the OpenAI API."""

    def __init__(self) -> None:
        self.api_key = settings.openai_api_key
        self.model = settings.feedback_model or "gpt-4o-mini"

    def analyze(
        self, transcript: str, mode: str = "impromptu", prompt: str | None = None
    ) -> dict[str, Any]:
        if not self.api_key:
            raise FeedbackEngineError("OpenAI API key is not configured")

        try:
            from openai import OpenAI

            client = OpenAI(api_key=self.api_key)

            user_message = FEEDBACK_PROMPT.format(
                transcript=transcript, mode=mode, prompt=prompt or "N/A"
            )

            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a precise communication coach. Always respond with valid JSON only.",
                    },
                    {"role": "user", "content": user_message},
                ],
                temperature=0.3,
                response_format={"type": "json_object"},
            )

            content = response.choices[0].message.content
            if not content:
                raise FeedbackEngineError("Empty response from OpenAI")

            result: dict[str, Any] = json.loads(content)
            self._validate(result)
            logger.info("Feedback analysis complete for mode=%s", mode)
            return result

        except ImportError:
            raise FeedbackEngineError("openai package is not installed")
        except json.JSONDecodeError as exc:
            raise FeedbackEngineError(f"Failed to parse feedback JSON: {exc}") from exc
        except Exception as exc:
            logger.exception("Feedback engine failed")
            raise FeedbackEngineError(f"Feedback generation failed: {exc}") from exc

    def _validate(self, data: dict[str, Any]) -> None:
        required = [
            "overall_score",
            "structure_score",
            "relevance_score",
            "evidence_score",
            "persuasion_score",
            "confidence_score",
            "examples_score",
            "strongest_skill",
            "weakest_skill",
            "next_focus",
            "skills",
            "timeline",
            "transcript_annotations",
            "next_challenge",
        ]
        for key in required:
            if key not in data:
                raise FeedbackEngineError(f"Missing required field: {key}")
