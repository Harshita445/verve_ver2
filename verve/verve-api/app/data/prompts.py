from app.models.practice_session import SessionMode

FREESTYLE_ONE_WORD: list[dict] = [
    {"text": "Ambition", "format": "one_word"},
    {"text": "Failure", "format": "one_word"},
    {"text": "Trust", "format": "one_word"},
    {"text": "Resilience", "format": "one_word"},
    {"text": "Change", "format": "one_word"},
    {"text": "Perspective", "format": "one_word"},
    {"text": "Connection", "format": "one_word"},
    {"text": "Momentum", "format": "one_word"},
]

FREESTYLE_FULL: list[dict] = [
    {"text": "Describe a time you had to make a difficult decision with limited information.", "format": "full"},
    {"text": "What does effective leadership mean to you?", "format": "full"},
    {"text": "If you could solve one global problem, which would it be and why?", "format": "full"},
    {"text": "What is the most important lesson you've learned in the past year?", "format": "full"},
    {"text": "Describe a situation where you had to persuade someone who disagreed with you.", "format": "full"},
]

FREESTYLE_CREATIVE: list[dict] = [
    {"text": "Pitch an infomercial for a product that solves a problem nobody has.", "format": "absurd_pitch"},
    {"text": "You're an alien anthropologist explaining 'small talk' to your home planet.", "format": "outsider_pov"},
    {"text": "Narrate the room around you right now like a nature documentary host.", "format": "sensory_narration"},
    {"text": "Give a eulogy for a habit you're happy to have lost.", "format": "mock_ceremony"},
    {"text": "You have to explain your day using only questions.", "format": "constraint"},
    {"text": "Talk for 30 seconds without using the word 'I.'", "format": "constraint"},
    {"text": "Start with the word 'meanwhile' and build a story from there.", "format": "association_chain"},
    {"text": "Free-associate from the word 'static' for as long as you can, out loud.", "format": "association_chain"},
    {"text": "You're hosting a game show where the prize is mildly disappointing. Sell it anyway.", "format": "absurd_pitch"},
    {"text": "Describe color to someone who has never been able to see.", "format": "sensory_narration"},
    {"text": "Give a weather report for your own mood today.", "format": "mock_ceremony"},
    {"text": "You're narrating a silent film using only sound effects and tone, no real words allowed... except you have to use real words. Make it work.", "format": "constraint"},
    {"text": "Combine two random objects in this room into a single invented product and pitch it.", "format": "absurd_pitch"},
    {"text": "You're a time traveler from 200 years ago seeing a smartphone for the first time. React out loud.", "format": "outsider_pov"},
    {"text": "Deliver the safety announcement for a rollercoaster that doesn't actually exist yet.", "format": "mock_ceremony"},
]

DEBATE_PROMPTS: list[dict] = [
    {"text": "Artificial intelligence will create more jobs than it destroys. Defend or oppose.", "format": "debate"},
    {"text": "Remote work is better for productivity than office work. Defend or oppose.", "format": "debate"},
    {"text": "Social media does more harm than good. Defend or oppose.", "format": "debate"},
    {"text": "Universal basic income should be implemented globally. Defend or oppose.", "format": "debate"},
    {"text": "Standardized testing is an effective measure of student ability. Defend or oppose.", "format": "debate"},
    {"text": "Space exploration is a waste of resources that should be spent on Earth. Defend or oppose.", "format": "debate"},
    {"text": "The voting age should be lowered to 16. Defend or oppose.", "format": "debate"},
]

INTERVIEW_PROMPTS: list[dict] = [
    {"text": "Tell me about a time you led a team through a challenging project.", "format": "interview"},
    {"text": "Describe a situation where you had to adapt to a significant change at work.", "format": "interview"},
    {"text": "Tell me about a mistake you made and what you learned from it.", "format": "interview"},
    {"text": "Describe a time you went above and beyond what was expected of you.", "format": "interview"},
    {"text": "Tell me about a time you had to resolve a conflict within your team.", "format": "interview"},
    {"text": "Describe a situation where you had to influence a decision without direct authority.", "format": "interview"},
]

STORYTELLING_PROMPTS: list[dict] = [
    {"text": "Recall a moment when you felt completely out of your depth. What happened?", "format": "storytelling"},
    {"text": "Tell the story of a mentor who changed your perspective.", "format": "storytelling"},
    {"text": "Describe a journey — literal or metaphorical — that transformed you.", "format": "storytelling"},
    {"text": "Tell a story about a time things didn't go as planned, but worked out anyway.", "format": "storytelling"},
    {"text": "Recall a moment of unexpected kindness you witnessed or experienced.", "format": "storytelling"},
    {"text": "Tell the story of a small decision that had unexpectedly large consequences.", "format": "storytelling"},
]

PROMPT_BANK: dict[SessionMode, list[dict]] = {
    SessionMode.freestyle: FREESTYLE_ONE_WORD + FREESTYLE_FULL + FREESTYLE_CREATIVE,
    SessionMode.debate: DEBATE_PROMPTS,
    SessionMode.interview: INTERVIEW_PROMPTS,
    SessionMode.storytelling: STORYTELLING_PROMPTS,
}
