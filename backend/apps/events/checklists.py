"""
Default Timeline milestones seeded automatically when a customer creates
a new event, so the Timeline tab isn't blank on day one. Kept generic
enough to make sense across most event types, with a couple of
type-specific extras for the most common categories.
"""

BASE_CHECKLIST = [
    "Set final guest list",
    "Confirm venue",
    "Book a planner",
    "Send invitations",
    "Finalize budget",
    "Day-of run-through",
]

TYPE_SPECIFIC = {
    "birthday": ["Order cake", "Arrange entertainment"],
    "surprise_birthday": ["Coordinate the surprise timing", "Order cake"],
    "anniversary": ["Book photographer", "Plan a toast/speech"],
    "baby_shower": ["Set up gift table", "Plan games/activities"],
    "proposal": ["Scout the exact spot", "Arrange photographer/videographer"],
    "housewarming": ["Plan house tour flow", "Arrange catering"],
    "graduation": ["Order cake", "Arrange photo backdrop"],
    "farewell": ["Collect memories/messages", "Plan a toast/speech"],
    "family_gathering": ["Confirm dietary needs", "Plan activities for kids"],
    "corporate_party": ["Confirm AV/presentation setup", "Arrange name badges"],
    "product_launch": ["Prepare press kit", "Confirm AV/presentation setup"],
    "team_celebration": ["Book venue with team-friendly seating"],
    "office_anniversary": ["Prepare recap presentation"],
    "employee_appreciation": ["Prepare awards/certificates"],
    "networking": ["Prepare name badges", "Set up registration table"],
    "custom": [],
}


def get_default_checklist(event_type: str) -> list[str]:
    return BASE_CHECKLIST + TYPE_SPECIFIC.get(event_type, [])
