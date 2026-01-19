from fastapi import APIRouter
from app.services.ai.mock import MockAIService
from app.services.ai.langchain import LangChainAIService
from app.core.config import settings

router=APIRouter(prefix="/ai")

ai=LangChainAIService() if settings.AI_ENABLED else MockAIService()
@router.post("/summarize")
async def summarize(text: str):
    return await ai.summarize(text)