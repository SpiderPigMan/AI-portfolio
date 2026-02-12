import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# 1. Pydantic V2 (Estándar para TODO: FastAPI y LangChain)
from pydantic import BaseModel, Field

# 2. Imports de LangChain (LCEL Moderno)
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# --- INICIO APP ---
load_dotenv()
app = FastAPI(title="Asistente Virtual RAG - Jesús Mora")

# --- CORS ---
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- IA CORE ---
# Inicializamos embeddings y base de datos
embeddings = HuggingFaceEmbeddings(model_name="paraphrase-multilingual-MiniLM-L12-v2")
vector_db = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)
llm_engine = ChatOpenAI(temperature=0.7, model_name="gpt-4o")
retriever = vector_db.as_retriever(search_kwargs={"k": 3})

# ==========================================
#  MODULO 1: CHAT GENERAL (Versión LCEL)
# ==========================================

class ChatInput(BaseModel):
    question: str

# Prompt del chat
chat_template = """
ERES: El Asistente Virtual Profesional de Jesús Mora.
CONTEXTO RECUPERADO DEL CV:
{context}

PREGUNTA: {question}

INSTRUCCIONES:
Responde de forma concisa y profesional basándote SOLO en el contexto.
Si no tienes la respuesta en el contexto, indícalo amablemente.
"""
chat_prompt = PromptTemplate(template=chat_template, input_variables=["context", "question"])

# Función auxiliar para formatear documentos a texto
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# CADENA LCEL: Retriever -> Formato -> Prompt -> LLM -> String
qa_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | chat_prompt
    | llm_engine
    | StrOutputParser()
)

@app.post("/chat")
async def chat_endpoint(input: ChatInput):
    try:
        # Invocamos la cadena directamente con el texto de la pregunta
        response = qa_chain.invoke(input.question)
        return {"answer": response, "source": "RAG-CV"}
    except Exception as e:
        print(f"Error chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
#  MODULO 2: ANALIZADOR (Versión LCEL)
# ==========================================

# Modelos de Salida (Usamos Pydantic v2 directamente)
class GapDetail(BaseModel):
    missing_skill: str = Field(description="Habilidad faltante en el CV")
    mitigation: str = Field(description="Estrategia para suplir la falta")

class MatchAnalysis(BaseModel):
    match_percentage: int = Field(description="Porcentaje de compatibilidad (0-100)")
    strengths: list[str] = Field(description="Puntos fuertes coincidentes")
    gaps: list[GapDetail] = Field(description="Lista de carencias y mitigaciones")
    recommendation: str = Field(description="Veredicto final")

# Modelo de Entrada (FastAPI)
class JobOffer(BaseModel):
    text: str

# Parser configurado con Pydantic v2
match_parser = JsonOutputParser(pydantic_object=MatchAnalysis)

match_template = """
ERES: Un Headhunter Senior.
OBJETIVO: Analizar compatibilidad entre el CV de Jesús y esta oferta.

CONTEXTO CV:
{context}

OFERTA:
{job_text}

INSTRUCCIONES:
1. Detecta Strengths.
2. Analiza Gaps y propón mitigación.
3. Calcula % Match.

FORMATO JSON:
{format_instructions}
"""

match_prompt = PromptTemplate(
    template=match_template,
    input_variables=["context", "job_text"],
    partial_variables={"format_instructions": match_parser.get_format_instructions()}
)

# Cadena Analizador
analyze_chain = match_prompt | llm_engine | match_parser

@app.post("/analyze")
async def analyze_offer_endpoint(offer: JobOffer):
    try:
        # 1. Búsqueda manual de contexto relevante para la oferta
        docs = vector_db.similarity_search(offer.text, k=4)
        cv_context = format_docs(docs)
        
        # 2. Ejecución de la cadena
        result = analyze_chain.invoke({
            "context": cv_context,
            "job_text": offer.text
        })
        return result
    except Exception as e:
        print(f"Error analyze: {e}")
        raise HTTPException(status_code=500, detail="Error analizando la oferta")