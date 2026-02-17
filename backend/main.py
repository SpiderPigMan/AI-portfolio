import os
import sys
# Parche para usar pysqlite3 en lugar del sqlite3 antiguo del sistema
try:
    __import__('pysqlite3')
    sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')
except ImportError:
    pass

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# --- INICIO APP ---
load_dotenv()

# Validación de seguridad para el despliegue
if not os.getenv("OPENAI_API_KEY"):
    print("⚠️ ADVERTENCIA: OPENAI_API_KEY no encontrada en las variables de entorno.")

app = FastAPI(title="Asistente Virtual RAG - Jesús Mora")

# --- CORS ---
production_url = os.getenv("FRONTEND_URL")

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

if production_url:
    origins.append(production_url)
    clean_url = production_url.replace("https://", "").replace("http://", "")
    origins.append(f"https://{clean_url}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- IA CORE ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, "chroma_db")

# Inicializamos embeddings y base de datos
embeddings = HuggingFaceEmbeddings(model_name="paraphrase-multilingual-MiniLM-L12-v2")
vector_db = Chroma(persist_directory=db_path, embedding_function=embeddings)
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

INSTRUCCIONES DE COMPORTAMIENTO:
1. Responde de forma concisa y profesional.
2. Si la respuesta incluye un listado técnico (tecnologías, herramientas, etc.), NO lo sueltes como texto plano.
3. **FORMATO OBLIGATORIO PARA LISTAS:**
   - Agrúpalas por categorías lógicas (ej: Frontend, Backend, Herramientas).
   - Usa **negritas** para las tecnologías clave.
   - Usa listas con viñetas (bullet points) para facilitar la lectura.
   - Usa este formato exacto para cada categoría:
        **Categoría:**
        * Tecnologías...
4. **IMPORTANTE:** Deja siempre una línea en blanco antes y después de cada lista.
5. NO uses bloques de código (```) para texto normal.
6. Sé conciso pero estructurado.
7. **PROHIBIDO:** No uses listas para frases normales o narrativa. Usa párrafos estándar.
8. Si no tienes información suficiente en el contexto, responde honestamente: "No tengo esa información en el CV de Jesús."
   
EJEMPLO DE BUENA RESPUESTA:
"Jesús tiene experiencia en varias áreas clave:

* Angular (Versiones JS a 14)
* React y Next.js
* Arquitectura de Software"

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
#  MODULO 2: ANALIZADOR (Versión LCEL - Enfoque Venta)
# ==========================================

# Modelos de Salida
class GapDetail(BaseModel):
    missing_skill: str = Field(description="Habilidad técnica requerida que falta en el CV")
    mitigation: str = Field(description="Argumento persuasivo para el recruiter. NO sugerir cursos. Explicar qué habilidad similar tiene en su CV que compensa esta falta (Transferable Skills). Ej: 'No tiene AWS, pero su expertis en Azure le permite adaptarse de inmediato'.")

class MatchAnalysis(BaseModel):
    match_percentage: int = Field(description="Porcentaje de compatibilidad honesto (0-100)")
    strengths: list[str] = Field(description="Puntos fuertes coincidentes")
    gaps: list[GapDetail] = Field(description="Lista de carencias con su argumento de defensa")
    recommendation: str = Field(description="Veredicto final breve")

# Modelo de Entrada
class JobOffer(BaseModel):
    text: str

match_parser = JsonOutputParser(pydantic_object=MatchAnalysis)

match_template = """
ERES: Un Coach de Carrera Experto en Tecnología.
OBJETIVO: Preparar a Jesús Mora para una entrevista, armándolo con argumentos para defender su candidatura frente a esta oferta.

CONTEXTO DEL CANDIDATO (CV):
{context}

OFERTA DE EMPLEO:
{job_text}

INSTRUCCIONES DE ANÁLISIS ESTRATÉGICO:
1. **Strengths:** Detecta coincidencias exactas clave.
2. **Gaps & Defensa (CRÍTICO):**
   - Si falta una tecnología, NO digas "debe aprenderla".
   - GENERA UN ARGUMENTO DE VENTA: Busca en el contexto una tecnología equivalente o un principio base que Jesús ya domine.
   - EJEMPLO: Si piden "Angular" y él sabe "React", la mitigación debe ser: "Su dominio avanzado de React y gestión de estado le permitirá transicionar a Angular rápidamente."
   - Si la carencia es total y no hay defensa posible, sé honesto: "Requiere formación específica".

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
        # Búsqueda de contexto
        docs = vector_db.similarity_search(offer.text, k=4)
        cv_context = format_docs(docs)
        
        # Ejecución
        result = analyze_chain.invoke({
            "context": cv_context,
            "job_text": offer.text
        })
        return result
    except Exception as e:
        print(f"Error analyze: {e}")
        raise HTTPException(status_code=500, detail="Error analizando la oferta")
    
# --- ARRANQUE SEGURO ---
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Servidor arrancando en el puerto {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)