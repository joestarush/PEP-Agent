from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from models import AnalysisResult
import os

class LLMService:
    def __init__(self) -> None:
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite",
            temperature=0,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        self.parser = JsonOutputParser(pydantic_object=AnalysisResult)

    async def process_email(self, email_body: str, prompt_template_str: str) -> dict:
        try:
            format_instr = self.parser.get_format_instructions()

            template = (
                "You are an intelligent email agent. Follow these rules strictly:\n"
                "{prompt_rules}\n\n"
                "--- EMAIL CONTENT ---\n"
                "{email_content}\n"
                "---------------------\n"
                "Return the result in this valid JSON format:\n"
                "{format_instructions}"
            )

            prompt = ChatPromptTemplate.from_template(template)
            chain = prompt | self.llm | self.parser

            result = await chain.ainvoke({
                "prompt_rules": prompt_template_str,
                "email_content": email_body,
                "format_instructions": format_instr
            })

            return result

        except Exception as exc:
            print(f"LLMService error: {exc}")
            return {
                "category": "Error",
                "summary": "Could not process email due to AI error.",
                "action_items": []
            }
