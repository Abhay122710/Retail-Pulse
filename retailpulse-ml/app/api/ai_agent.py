from fastapi import APIRouter, HTTPException, Depends
from app.schemas.ai_schemas import ChatRequest, ChatResponse
from app.services.ai_agent import PulseAIAgent

router = APIRouter(prefix="/api/ai", tags=["PulseAI Intelligence Assistant"])

def get_agent() -> PulseAIAgent:
    return PulseAIAgent()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    agent: PulseAIAgent = Depends(get_agent)
):
    """
    Executes bounded, auditable investigation and synthesizes evidence-backed response.
    Guarantees zero hallucinated numbers, full citation trace, and strict safety.
    """
    try:
        response = agent.answer_query(request)
        return response
    except Exception as e:
        import logging
        logging.error(f"[PulseAI API] Investigation error: {e}")
        from app.config import settings
        err_msg = str(e) if settings.ENV != "production" else "Internal error during analytical investigation."
        raise HTTPException(
            status_code=500,
            detail=f"Error executing PulseAI investigation: {err_msg}"
        )
