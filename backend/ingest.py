import os
import shutil
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import CharacterTextSplitter
# IMPORTANTE: Nuevos imports para OpenAI
from langchain_openai import OpenAIEmbeddings
# from langchain_huggingface import HuggingFaceEmbeddings -- No se usa en esta versión por falta de RAM en el servidor, se opta por OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# 1. Cargar configuración
load_dotenv()

def create_vector_db():
    print("--- Iniciando proceso de INGESTA ---")
    
    # 2. Cargar documentos (.md) desde la carpeta 'data'
    loader = DirectoryLoader(
        './data', 
        glob="./*.md", 
        loader_cls=TextLoader,
        loader_kwargs={'encoding': 'utf-8'}
    )
    docs = loader.load()
    print(f"✅ Documentos encontrados: {len(docs)}")

    # 3. Fragmentación (Chunking)
    text_splitter = CharacterTextSplitter(chunk_size=4000, chunk_overlap=500)
    chunks = text_splitter.split_documents(docs)
    print(f"✅ Texto dividido en {len(chunks)} fragmentos.")

    # 4. CONFIGURACIÓN DE EMBEDDINGS (Toggle)
    # --- OPCIÓN A: OpenAI (Recomendado para Producción/Render) ---
    print("⏳ Generando vectores con OpenAI (Dimensión 1536)...")
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    # --- OPCIÓN B: HuggingFace (Local/Gratis - Dimensión 384) ---
    # Para volver a este modelo, comenta la línea de OpenAI arriba y descomenta estas:
    # print("⏳ Generando vectores localmente con HuggingFace (Dimensión 384)...")
    # embeddings = HuggingFaceEmbeddings(model_name="paraphrase-multilingual-MiniLM-L12-v2")
    
    # 5. Gestión de la base de datos (ChromaDB)
    persist_dir = "./chroma_db"
    
    # Limpieza automática para evitar errores de dimensión
    if os.path.exists(persist_dir):
        print(f"🧹 Eliminando base de datos antigua en {persist_dir} para evitar conflictos de dimensiones...")
        shutil.rmtree(persist_dir)

    vector_db = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=persist_dir,
        collection_metadata={"hnsw:space": "cosine"}
    )
    
    print("--- 🚀 ¡ÉXITO! Nueva base de datos lista con dimensiones de OpenAI ---")

if __name__ == "__main__":
    create_vector_db()