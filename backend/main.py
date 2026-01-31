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
IDENTIDAD:
Eres el Agente de Carrera de Jesús Alberto Mora. Actúas como su representante digital ante reclutadores y directores técnicos.

MISIÓN:
Tu objetivo es demostrar el valor de Jesús como Desarrollador Senior y Analista, destacando su impacto en proyectos críticos (Telco, Banca, Sector Público).

ESTILO DE COMUNICACIÓN:
1. Tono ejecutivo: Directo, profesional y orientado a resultados.
2. Proactividad: No solo respondas, aporta contexto sobre por qué ese logro es relevante.
3. Formato: Usa listas (bullet points) para enumerar tecnologías o hitos para facilitar la lectura rápida.

---
CONTEXTO DE LA EXPERIENCIA (USA SOLO ESTA INFORMACIÓN):
{context}
---


RESTRICCIONES CRÍTICAS:
1. VERACIDAD: Si una habilidad, herramienta o tecnología NO aparece explícitamente en el contexto proporcionado, indica que Jesús no la tiene listada en su perfil actual, pero destaca sus habilidades transferibles más cercanas.
2. FUENTE ÚNICA: No uses conocimientos externos sobre Jesús; básate únicamente en los documentos de la base de datos.
3. NO INVENTAR LOGROS: Si se te pregunta por métricas, usa solo las que aparecen (ej. reducción del 60% en Orange). Si no hay datos numéricos, habla de impacto cualitativo.
4. IDIOMA: Responde en el mismo idioma en el que se te pregunte.

Pregunta del interesado: {question}

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
    
# --- NUEVAS FUNCIONALIDADES PARA ANÁLISIS DE OFERTAS DE EMPLEO ---
# 1. Nuevo modelo de datos para la oferta
class JobOffer(BaseModel):
    text: str

# 2. Prompt específico para extracción de Skills
extraction_template = """
Eres un experto en Selección de Talento IT. Tu tarea es analizar la siguiente oferta de empleo y extraer una lista estructurada de las habilidades clave requeridas.

OFERTA DE EMPLEO:
{job_text}

INSTRUCCIONES:
- Extrae únicamente Hard Skills (Lenguajes, Frameworks, Herramientas).
- Extrae Soft Skills relevantes.
- Devuelve la respuesta como una lista de puntos (bullet points).
- No añadidas introducciones ni conclusiones, solo la lista.

LISTA DE SKILLS:"""

extraction_prompt = PromptTemplate(
    template=extraction_template, 
    input_variables=["job_text"]
)

# 3. Nuevo Endpoint para analizar ofertas
@app.post("/analyze-offer")
async def analyze_offer(offer: JobOffer):
    try:
        # Aquí usamos el LLM directamente para analizar el texto
        # Creamos una cadena simple para esta tarea
        chain = extraction_prompt | llm
        
        response = chain.invoke({"job_text": offer.text})
        
        # Devolvemos las skills extraídas
        return {
            "status": "success",
            "extracted_skills": response.content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
### Prompt para Análisis de Compatibilidad entre CV y Oferta ##
# 1. Definición del Prompt de Análisis de Compatibilidad 
match_template = """
SISTEMA: Eres un Analista de Talento Senior especializado en IT. Tu misión es evaluar la idoneidad de Jesús Mora para una vacante específica.

REQUISITOS EXTRAÍDOS DE LA OFERTA:
{extracted_skills}

EVIDENCIAS ENCONTRADAS EN EL CV DE JESÚS:
{context}

TAREA: Realiza un análisis crítico y honesto comparando ambos bloques.

ESTRUCTURA DEL INFORME:
1. RESUMEN DE COMPATIBILIDAD: (Proporciona un % estimado de match técnica).
2. PUNTOS FUERTES: (Cita proyectos específicos de Orange, Banca o Sector Público que validen las skills pedidas).
3. ÁREAS DE MEJORA / GAPS: (Identifica qué tecnologías de la oferta NO aparecen en su CV).
4. RECOMENDACIÓN FINAL: (Un breve párrafo sobre por qué merece una entrevista).

INSTRUCCIONES: Sé preciso y no inventes experiencias. Si hay un gap, menciónalo profesionalmente.
"""

match_prompt = PromptTemplate(
    template=match_template, 
    input_variables=["context", "extracted_skills"]
)

# 2. Endpoint Unificado de Match (Tarea 3.1 y 3.2)
@app.post("/match-report")
async def get_match_report(offer: JobOffer):
    try:
        # PASO A: Extraemos las keywords de la oferta (Reusando Tarea 2)
        extraction_chain = extraction_prompt | llm
        skills_raw = extraction_chain.invoke({"job_text": offer.text})
        keywords = skills_raw.content

        # PASO B: Búsqueda por similitud con las keywords (Tarea 3.1)
        # Buscamos los 4 fragmentos más relevantes de tu CV para esas keywords
        docs = vector_db.similarity_search(keywords, k=4)
        cv_context = "\n\n".join([f"Fragmento CV: {doc.page_content}" for doc in docs])

        # PASO C: Generación del informe final (Tarea 3.2)
        match_chain = match_prompt | llm
        report = match_chain.invoke({
            "context": cv_context,
            "extracted_skills": keywords
        })

        return {
            "status": "success",
            "analysis": report.content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))