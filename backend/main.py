import json
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from groq import Groq
from pydantic import BaseModel, Field
from pypdf import PdfReader
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

model = "openai/gpt-oss-20b"
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "http://localhost:5174",
                   "https://hiremeai-chi.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#parse resume
class MatchResult(BaseModel):
    score: float
    details: dict
class Experience(BaseModel):
    company: str | None=None
    role: str | None=None
    duration: str | None=None
    description: str | None=None
    skills_used: list[str] = Field(default_factory=list)
class Resume(BaseModel):
    name: str |  None=None
    email: str | None=None
    phone: str | None=None
    total_experience_years: float | None=None
    skills: list[str] = Field(default_factory=list)
    experiences: list[Experience] = Field(default_factory=list)
    education: list[str] = Field(default_factory=list)
    projects: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)

resume_schema = Resume.model_json_schema()


class ChatRequest(BaseModel):
    question: str

def ask_candidate(question: str, resume: Resume):
    system_prompt = f"""
    You are an AI assistant representing a job candidate.
    
    Below is everything you know about the candidate.
    
    {resume.model_dump_json(indent=2)}

    Rules:
    1. Answer only using this information.
    2. Never hallucinate.
    3. If information is unavailable, 
    say
    "I don't have enough information to answer that."
    4. Be professional.
    5. Answer as if HR is interviewing this candidate.
    """

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": question
            }
        ]
    )
    return response.choices[0].message.content

def parse_resume(resume_text):
    system_prompt = f"""
    You are an expert resume parser.

    Extract information from the resume.

    Return ONLY ONE JSON object.

    The JSON MUST contain exactly these fields:

    name
    email
    phone
    total_experience_years
    skills
    experiences
    education
    projects
    certifications

    For experiences, each item MUST contain:
    company
    role
    duration
    description
    skills_used

    Use null when a single value is unavailable.
    Use [] when a list has no information.

    Do not invent information.

    {resume_schema}

    Important rules:

    1. Do not invent information.
    2. If a value is not available, return null.
    3. If a list has no information, return an empty list.
    4. Include internships inside experiences.
    5. Extract skills mentioned across the entire resume.
    """
    user_prompt = f"""
    Parse the following resume:

    {resume_text}
    """

    message_system={
        "role" : "system",
        "content" : system_prompt
    }
    message_user={
        "role" : "user",
        "content" : user_prompt
    }
    messages=[message_system, message_user]
    response_format={
        "type":"json_object"
    }
    response=client.chat.completions.create(model=model, messages=messages, response_format=response_format)
    raw_output=response.choices[0].message.content
    data = json.loads(raw_output)
    resume = Resume(**data)
    return resume

#pdf extraction
def read_pdf(file_path):
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text
 
@app.get("/")
def home():
    resume_text=read_pdf(Path("resume (9).pdf"))
    resume=parse_resume(resume_text)
    print(resume.model_dump_json(indent=2))
    return {
        "message": "vinit is hiremeAI is running!"
    }
# chatgpt.com
# chatgpt.com/abcdefgh


@app.post("/chat")
def chat(request: ChatRequest):
    resume_text=read_pdf(Path("resume (9).pdf"))
    resume=parse_resume(resume_text)
    answer=ask_candidate(request.question, resume)
    return {
        "answer": answer
    }