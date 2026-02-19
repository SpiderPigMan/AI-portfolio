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
# from langchain_huggingface import HuggingFaceEmbeddings -- No se usa en esta versión por falta de RAM en el servidor, se opta por OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
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

origins = ["http://localhost:3000", "http://127.0.0.1:3000", os.getenv("FRONTEND_URL")]

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
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
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

=== REGLAS DE ESTILO Y JERARQUÍA VISUAL (ESTRICTO) ===
1. **PÁRRAFOS NARRATIVOS:** Usa solo texto plano. No uses negritas en medio de frases explicativas.
   
2. **CATEGORÍAS DE LISTAS (ENCABEZADOS):**
   - Para separar secciones (Frontend, Backend, Herramientas), usa SIEMPRE encabezados Markdown de nivel 3 (`### Título`).
   - **PROHIBIDO:** NUNCA uses negritas (`**`) para los títulos de las categorías. Solo `###`.

3. **ELEMENTOS DE LA LISTA (ITEMS):**
   - Usa bullet points (*) para cada tecnología.
   - Usa negritas (`**`) **EXCLUSIVAMENTE** para el nombre de la tecnología al inicio de la línea.
   
   **FORMATO EXACTO REQUERIDO:**
   ### Categoría
   * **Tecnología:** Descripción breve...

4. **ESPACIADO:** Deja una línea en blanco antes de cada encabezado `###`.

=== INSTRUCCIONES DE COMPORTAMIENTO ===
1. Responde de forma concisa y profesional.
2. NO uses bloques de código (```) para texto normal.
3. Si no tienes información suficiente en el contexto, responde honestamente.

=== GESTIÓN DE CASOS ESPECIALES ===
   - **CASO A (Datos de Contacto/Privados):** Si preguntan por salario, teléfono, email o disponibilidad:
     Responde: "Ese dato específico no aparece en mi base de conocimientos pública, pero es algo que Jesús podría aclararte rápidamente." 
     **Y AÑADE AL FINAL LA ETIQUETA:** [CONTACT_INFO]

   - **CASO B (Irrelevante):** Si preguntan por temas random (cocina, política):
     Responde: "Como asistente técnico de Jesús, mi función se limita a su perfil profesional."

   - **CASO C (Falta de Info Técnica):** Si preguntan por una tecnología que no está en el CV:
     Responde: "No tengo información sobre experiencia específica en [tecnología] en el contexto del CV."

EJEMPLO DE RESPUESTA VISUAL CORRECTA:
"Jesús cuenta con la siguiente experiencia técnica:

### Frontend
* **Angular:** Experiencia avanzada desde versiones JS hasta la 14.
* **React:** Uso en proyectos de gran escala con Next.js.

### Backend
* **Java (J2EE):** Desarrollo de sistemas legacy y microservicios.

También ha trabajado con metodologías ágiles."

Responde basándote SOLO en el contexto proporcionado.
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

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "AI Portfolio Backend API",
        "version": "1.0.0"
    }

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
ERES: Un Senior Tech Recruiter y Coach de Carrera con ojo crítico y honesto.
OBJETIVO: Realizar un diagnóstico implacable de compatibilidad entre el perfil de Jesús Mora y una oferta de empleo.

CONTEXTO DEL CANDIDATO (CV):
{context}

OFERTA DE EMPLEO A ANALIZAR:
{job_text}

=== INSTRUCCIONES DE CALIBRACIÓN DEL PORCENTAJE (CRÍTICO) ===
Actúa como un reclutador real. Sé justo con los puntos.
1. **FILTRO DE SECTOR (STOP):** Si la oferta NO es del sector tecnológico (ej: hostelería, medicina, leyes, ventas al detalle) o no tiene relación con el desarrollo de software/IT, el `match_percentage` debe ser AUTOMÁTICAMENTE entre 0% y 5%.
2. **PENALIZACIÓN POR STACK:** Si la oferta pide un lenguaje de programación principal que Jesús NO domina (ej: Ruby, PHP, Rust) y no hay una base equivalente fuerte, resta 40 puntos.
3. **PUNTUACIÓN POR ROLES:**
   - 85-100%: Match casi perfecto. Domina el stack core y tiene la experiencia requerida.
   - 60-84%: Perfil interesante. Tiene las bases pero faltan herramientas secundarias.
   - 30-59%: Perfil "trasplantable". Gran brecha técnica pero con habilidades transferibles.
   - 0-29%: Perfil no apto o sector no relacionado.

=== INSTRUCCIONES DE ANÁLISIS ESTRATÉGICO ===
1. **Strengths:** Detecta coincidencias exactas y tangibles.
2. **Gaps & Defensa (PERSUASIÓN):**
   - Para tecnologías faltantes en el CV: NO sugieras estudiar.
   - Busca una **Habilidad Puente**: Identifica una tecnología que Jesús sí domine y que comparta principios arquitectónicos con la solicitada.
   - Ejemplo: Si piden "Vue", usa su dominio de "React/Angular" para argumentar una curva de aprendizaje mínima de días.
   - Si piden "Bases de Datos SQL específicas" y él tiene "PostgreSQL", resalta su dominio del estándar SQL.
3. **Veredicto:** Sé breve, directo y profesional.

FORMATO DE SALIDA (JSON ESTRICTO):
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