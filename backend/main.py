from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import db
from models import EmailModel, PromptConfigModel
from services.llm_service import LLMService
from datetime import datetime
from bson import ObjectId

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm_service = LLMService()

# --- Helpers ---
def fix_id(doc):
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc

# --- Endpoints ---

@app.post("/inbox/load_mock")
async def load_mock_data():
    await db.emails.delete_many({})
    await db.prompt_configs.delete_many({})

    mock_emails = [
        {"sender": "boss@company.com", "subject": "Q3 Report", "body": "Please send me the Q3 report by Friday. It's urgent.", "timestamp": datetime.now(), "is_processed": False, "analysis": None},
        {"sender": "newsletter@tech.com", "subject": "Weekly Tech Digest", "body": "Check out the latest AI trends...", "timestamp": datetime.now(), "is_processed": False, "analysis": None},
        {"sender": "recruiter@job.com", "subject": "Interview Follow-up", "body": "We would like to schedule a second round.", "timestamp": datetime.now(), "is_processed": False, "analysis": None},
        {"sender": "spam@offers.com", "subject": "You won a prize!", "body": "Click here to claim your $1000 gift card.", "timestamp": datetime.now(), "is_processed": False, "analysis": None},
        {"sender": "mom@family.com", "subject": "Dinner?", "body": "Are you coming over for dinner this Sunday?", "timestamp": datetime.now(), "is_processed": False, "analysis": None},
    ]
    
    default_prompt = {
        "type": "categorization",
        "template_text": "Analyze the following email. Categorize it into 'Work', 'Personal', 'Newsletter', or 'Spam'. Provide a one sentence summary and list any action items."
    }

    await db.emails.insert_many(mock_emails)
    await db.prompt_configs.insert_one(default_prompt)
    return {"message": "Mock data loaded"}

@app.get("/emails")
async def get_emails():
    emails = await db.emails.find().sort("timestamp", -1).to_list(100)
    return [fix_id(email) for email in emails]

@app.post("/emails/process")
async def process_emails():
    # 1. Get the prompt
    prompt_config = await db.prompt_configs.find_one({"type": "categorization"})
    if not prompt_config:
        raise HTTPException(status_code=404, detail="Categorization prompt not configured")
    
    # 2. Get unprocessed emails
    unprocessed = await db.emails.find({"is_processed": False}).to_list(100)
    
    processed_count = 0
    for email in unprocessed:
        # 3. Call LLM Service
        analysis = await llm_service.process_email(email['body'], prompt_config['template_text'])
        
        # 4. Update DB
        await db.emails.update_one(
            {"_id": email["_id"]},
            {"$set": {"analysis": analysis, "is_processed": True}}
        )
        processed_count += 1
        
    return {"message": f"Processed {processed_count} emails"}

@app.get("/config/prompts")
async def get_prompts():
    prompts = await db.prompt_configs.find().to_list(100)
    return [fix_id(p) for p in prompts]

@app.post("/config/prompts")
async def update_prompt(config: PromptConfigModel):
    # Upsert based on type
    result = await db.prompt_configs.update_one(
        {"type": config.type},
        {"$set": {"template_text": config.template_text}},
        upsert=True
    )
    return {"message": "Prompt updated"}