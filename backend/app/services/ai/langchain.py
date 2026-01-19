from .base import AIService

class LangChainAIService(AIService):
    async def summarize(self, text: str):
        return "LangChain not enabled yet"

    async def auto_tag(self, text: str):
        return []

    async def ask(self, notes, question: str):
        return "LangChain not enabled yet"
