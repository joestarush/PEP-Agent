from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import db
from models import EmailModel, PromptConfigModel
from services.llm_service import LLMService
from datetime import datetime
from bson import ObjectId
import json
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm_service = LLMService()

def fix_id(doc):
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc

@app.post("/inbox/load_mock")
async def load_mock_data():
    await db.emails.delete_many({})
    await db.prompt_configs.delete_many({})

    now = datetime.now()
    try:
        with open("mock_data.json", "r") as f:
            raw_emails = json.load(f)
            
        # 3. Add dynamic timestamps (so they look new every time you load)
        mock_emails = []
        for email in raw_emails:
            email_doc = {
                "sender": email["sender"],
                "subject": email["subject"],
                "body": email["body"],
                "timestamp": datetime.now(), # Stamp with current time
                "is_processed": False,
                "analysis": None
            }
            mock_emails.append(email_doc)



        default_prompt = {
            "type": "categorization",
            "template_text": "Analyze the following email. Categorize it into 'Work', 'Personal', 'Newsletter', or 'Spam'. Provide a one sentence summary and list any action items."
        }

        await db.emails.insert_many(mock_emails)
        await db.prompt_configs.insert_one(default_prompt)
        return {"message": "Mock data loaded"}

    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="mock_data.json file not found in backend folder")

@app.get("/emails")
async def get_emails():
    emails = await db.emails.find().sort("timestamp", -1).to_list(100)
    return [fix_id(e) for e in emails]

@app.post("/emails/process")
async def process_emails():
    prompt_cfg = await db.prompt_configs.find_one({"type": "categorization"})
    if not prompt_cfg:
        raise HTTPException(status_code=404, detail="Categorization prompt not configured")

    pending = await db.emails.find({"is_processed": False}).to_list(100)

    count = 0
    for email in pending:
        analysis = await llm_service.process_email(email["body"], prompt_cfg["template_text"])
        await db.emails.update_one({"_id": email["_id"]}, {"$set": {"analysis": analysis, "is_processed": True}})
        count += 1

    return {"message": f"Processed {count} emails"}

@app.get("/config/prompts")
async def get_prompts():
    prompts = await db.prompt_configs.find().to_list(100)
    return [fix_id(p) for p in prompts]

@app.post("/config/prompts")
async def update_prompt(config: PromptConfigModel):
    result = await db.prompt_configs.update_one(
        {"type": config.type},
        {"$set": {"template_text": config.template_text}},
        upsert=True
    )
    return {"message": "Prompt updated"}
