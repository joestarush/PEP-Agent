from pydantic import BaseModel, Field, BeforeValidator
from typing import List, Optional, Annotated
from datetime import datetime

PyObjectId = Annotated[str, BeforeValidator(str)]

class AnalysisResult(BaseModel):
    category: str = Field(description="The category of the email (e.g., Work, Newsletter, Spam)")
    summary: str = Field(description="A brief summary of the email content")
    action_items: List[str] = Field(description="List of action items extracted from the email")

class EmailModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    sender: str
    subject: str
    body: str
    timestamp: datetime = Field(default_factory=datetime.now)
    is_processed: bool = False
    analysis: Optional[AnalysisResult] = None

class PromptConfigModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    type: str
    template_text: str
