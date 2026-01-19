from .base import AIService

class MockAIService(AIService):
    async def summarize(self, text: str):
        return text[:120] + "..."

    async def auto_tag(self, text: str):
        return ["note", "mock"]

    async def ask(self, notes, question: str):
        return "AI is disabled (mock response)"
