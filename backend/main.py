from fastapi import FastAPI,UploadFile,File 
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from text_splitter import chunk_text
from pdf_loader import extract_text_from_pdf
from embeddings import create_vector_stores
from chatbot import generate_answer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

vectorstore = None

@app.get("/")
def home():
    return {"message": "Backend working"}


@app.post("/upload")
async def upload_pdf(file:UploadFile = File(...)):
    global vectorstore

    text = extract_text_from_pdf(file.file)

    chunks = chunk_text(text)

    vectorstore = create_vector_stores(chunks)

    print("Vector stores created")

    return{ 
        "message" : "PDF processed successfully",
        "chunks" : chunks[:3]
    }

class QueryRequest(BaseModel):
    question : str
    

@app.post("/ask")
async def ask_question(request : QueryRequest):
    global vectorstore

    if vectorstore is None:
        return {"error":"Upload a PDF first"}

    query = request.question

    docs = vectorstore.similarity_search(query,k=3)

    chunks = [doc.page_content for doc in docs]

    answer = generate_answer(query,chunks)

    return{
        "answer" : answer,
        "sources" : chunks
    }