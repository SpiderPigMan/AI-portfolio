import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# Herramientas de IA (LangChain)
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# 1. Cargamos el .env
load_dotenv()
app = FastAPI(title="Asistente Virtual RAG - Jesús Mora")

# 2. Inicializamos los Embeddings locales (igual que en la ingesta)
embeddings = HuggingFaceEmbeddings(model_name="paraphrase-multilingual-MiniLM-L12-v2")

# 3. Cargamos la base de datos que ya creamos en la carpeta 'chroma_db'
vector_db = Chroma(
    persist_directory="./chroma_db", 
    embedding_function=embeddings
)

template = """
Eres el asistente virtual inteligente de Jesús Alberto Mora, un Desarrollador Senior con experiencia en sectores como Telco, Banca y Administración Pública.
Tu objetivo es responder preguntas de reclutadores o interesados basándote EXCLUSIVAMENTE en el contexto proporcionado.

Contexto de la experiencia de Jesús:
{context}

Pregunta del usuario: {question}

Instrucciones de respuesta:
1. Responde de forma profesional, proactiva y cercana.
2. Si la información no está en el contexto, di amablemente que no tienes ese dato específico pero invita a contactar con Jesús directamente.
3. Resalta logros cuantificables (como la reducción del 60% de tiempo en Orange) siempre que sea posible.

Respuesta:"""

PROMPT = PromptTemplate(
    template=template, 
    input_variables=["context", "question"]
)

# 4. Configuramos el modelo de lenguaje (OpenAI)
llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)

# 5. Creamos la cadena de consulta (RetrievalQA)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_db.as_retriever(search_kwargs={"k": 3}),
    chain_type_kwargs={"prompt": PROMPT}
)


# --- LÓGICA DE SEGURIDAD Y AHORRO ---

class Question(BaseModel):
    text: str

def es_pregunta_relevante(query: str, threshold: float = 0.1): 
    """
    Verifica si la pregunta tiene relación semántica con tu CV.
    threshold: 0.0 (nada parecido) a 1.0 (exacto).
    """
    # Buscamos los trozos más parecidos y su puntuación de relevancia
    results = vector_db.similarity_search_with_relevance_scores(query, k=2)
    
    if not results:
        return False, 0
    
    # Tomamos el mejor score
    best_score = results[0][1]
    
    # Imprimimos en consola para tu control personal
    print(f"DEBUG: Pregunta: {query} | Score: {best_score}")
    
    if best_score < threshold:
        return False, best_score
    
    return True, best_score

@app.post("/ask")
async def ask_question(question: Question):
    # PASO 1: Validar relevancia localmente (Gratis)
    es_valida, score = es_pregunta_relevante(question.text)
    
    if not es_valida:
        return {
            "answer": "Como asistente de Jesús Mora, estoy especializado en su carrera profesional. No puedo ayudarte con temas ajenos, pero ¿te gustaría saber sobre sus proyectos en Orange o la Comunidad de Madrid?",
            "status": "blocked_by_guardrail",
            "relevance_score": float(score)
        }

    # PASO 2: Procesar con OpenAI (Solo si es relevante)
    try:
        response = qa_chain.invoke({"query": question.text})
        return {
            "answer": response["result"],
            "status": "success",
            "relevance_score": float(score)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))