from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import db
from models import EmailModel, PromptConfigModel
from services.llm_service import LLMService
from datetime import datetime
from bson import ObjectId
import json  # <--- NEW IMPORT

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
    try:
        # 1. Clear existing data
        await db.emails.delete_many({})
        await db.prompt_configs.delete_many({})

        # 2. Read from JSON file
        try:
            with open("mock.json", "r") as f:
                raw_emails = json.load(f)
        except FileNotFoundError:
            raise HTTPException(status_code=500, detail="mock_data.json file not found in backend folder")
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="mock_data.json contains invalid JSON")
            
        # 3. Add dynamic timestamps (so they look new every time you load)
        mock_emails = []
        for email in raw_emails:
            email_doc = {
                "sender": email.get("sender", "Unknown"),
                "subject": email.get("subject", "No Subject"),
                "body": email.get("body", ""),
                "timestamp": datetime.now(), # Stamp with current time
                "is_processed": False,
                "analysis": None
            }
            mock_emails.append(email_doc)

        # 4. Insert into MongoDB
        if mock_emails:
            await db.emails.insert_many(mock_emails)
        
        # 5. Reset the Prompt to Default
        default_prompt = {
            "type": "categorization",
            "template_text": "Analyze the following email. Categorize it into 'Work', 'Personal', 'Newsletter', or 'Spam'. Provide a one sentence summary and list any action items with deadlines."
        }
        await db.prompt_configs.insert_one(default_prompt)
        
        return {"message": "Mock data loaded from JSON file"}

    except Exception as e:
        # Catch database connection errors or other runtime issues
        print(f"Error loading mock data: {e}")
        raise HTTPException(status_code=500, detail=f"System Error: {str(e)}")

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