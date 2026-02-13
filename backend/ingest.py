import os
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# 1. Cargar configuración
load_dotenv()

def create_vector_db():
    print("--- Iniciando proceso de INGESTA LOCAL (Híbrida) ---")
    
    # 2. Cargar documentos (.md)
    # Buscamos en la carpeta 'data' que creamos con tus proyectos
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

    # 4. Embeddings LOCALES (Gratis y Privados)
    # La primera vez descargará el modelo (~80MB), luego será instantáneo
    print("⏳ Generando vectores localmente (esto no consume saldo de OpenAI)...")
    embeddings = HuggingFaceEmbeddings(model_name="paraphrase-multilingual-MiniLM-L12-v2")
    
    # 5. Guardar en Base de Datos Vectorial (ChromaDB)
    vector_db = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db",
    collection_metadata={"hnsw:space": "cosine"}  # <--- Configuración para similitud coseno en ChromaDB
)
    
    print("--- 🚀 ¡ÉXITO! Base de datos 'chroma_db' lista para usarse ---")

if __name__ == "__main__":
    create_vector_db()