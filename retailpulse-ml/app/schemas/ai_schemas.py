from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str = Field(..., max_length=2000)

class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000, description="Natural language question from user")
    source: Optional[str] = Field("ALL SOURCES", description="Store filter (ShopPulse, TechMart, or ALL SOURCES)")
    conversation_history: Optional[List[ChatMessage]] = Field(default_factory=list, max_length=30)

class ToolExecutionStep(BaseModel):
    step: int
    tool: str
    arguments: Dict[str, Any]
    status: Literal["SUCCESS", "FAILED", "SKIPPED"]
    duration_ms: float
    output_summary: str

class EvidenceItem(BaseModel):
    metric_name: str
    actual_value: str
    comparison_value: Optional[str] = None
    change_pct: Optional[str] = None
    source: str
    data_classification: Literal["OBSERVED", "ESTIMATED", "PREDICTED", "SIMULATED"]

class ChatResponse(BaseModel):
    query: str
    intent: str
    engine: str
    answer: str
    execution_steps: List[ToolExecutionStep]
    evidence: List[EvidenceItem]
    citations: List[str]
    caveats_and_limitations: List[str]
