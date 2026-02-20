# 🚀 Jesús Mora — Adaptive Talent AI
### *Portfolio Interactivo y Analizador de Candidaturas con Arquitectura RAG*

> [!NOTE]
> **Looking for the English version?** [Click here](./README.md).

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)]([https://nextjs.org/](https://nextjs.org/))
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-05998b?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai)](https://openai.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🌟 a. Descripción General del Proyecto

**Adaptive Talent AI** no es un portfolio convencional; es una **herramienta de evaluación de compatibilidad técnica y cultural** impulsada por Inteligencia Artificial, desarrollada como proyecto central del Máster de Desarrollo con IA.

Utiliza una arquitectura **RAG (Retrieval-Augmented Generation)** para actuar como un consultor técnico digital que "vive" dentro de mi perfil profesional. Su objetivo es superar el concepto de CV estático, permitiendo a los reclutadores interactuar con un "gemelo digital" capaz de razonar cómo mi trayectoria encaja en sus necesidades específicas.

### 🧠 El Corazón de la IA: RAG y Contexto Profesional
A diferencia de los chatbots genéricos, este sistema ancla sus respuestas a una **Base de Conocimiento Exclusiva** sobre mi trayectoria real:
- **Sistemas Críticos y Legacy:** Experiencia en mantenimiento y modernización (ej. arquitecturas en Java 6).
- **Sistemas de Gran Escala:** Unificación de ecosistemas corporativos complejos (+60 aplicaciones).
- **Desarrollo Moderno e IA:** Creación de interfaces avanzadas (Next.js 15) e integración de agentes de inteligencia artificial.

### 🛡️ Compromiso de IA Responsable y Privacidad
- **Privacidad Total:** Los datos de las ofertas introducidas por los usuarios se procesan de forma efímera. **Nunca** se utilizan para entrenar modelos públicos ni se almacenan con fines de rastreo.
- **Honestidad Técnica:** La IA está programada para ser un evaluador estricto. Cuando detecta un *gap* tecnológico, no inventa experiencia; en su lugar, pivota sobre principios arquitectónicos base para argumentar mi capacidad de adaptación.

---

## 🛠️ b. Stack Tecnológico Utilizado

El proyecto utiliza una arquitectura desacoplada orientada a la escalabilidad y al procesamiento eficiente de modelos de lenguaje:

| Capa | Tecnologías Clave |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | Python 3.10+, FastAPI, Uvicorn |
| **IA & RAG** | OpenAI SDK (GPT-4o), LangChain, Base de Datos Vectorial |
| **UI/UX** | Diseño Glassmorphism, Terminal UI, Lucide React (Iconografía dinámica) |

---

## ⚙️ c. Información sobre su Instalación y Ejecución

Para replicar el entorno de desarrollo y probar el sistema interactivo, sigue estos pasos:

### 1. Ingestión de Datos (Generación del Cerebro IA)
Antes de levantar la aplicación, es necesario procesar el conocimiento base.
```bash
cd backend
pip install -r requirements.txt
# Genera los embeddings vectoriales a partir de los documentos en /data
python ingest.py 
```

### 2. Ejecución del Entorno Local
Se requieren dos terminales separadas para el servidor y la interfaz:

**Terminal 1: Backend (FastAPI)**
```bash
cd backend
# Asegúrate de tener configurado tu archivo .env con OPENAI_API_KEY
uvicorn main:app --reload
```
*(El servidor se ejecutará en `http://localhost:8000`)*

**Terminal 2: Frontend (Next.js)**
```bash
cd frontend
npm install
# Asegúrate de configurar NEXT_PUBLIC_BACKEND_URL apuntando al puerto 8000
npm run dev
```
*(La aplicación estará disponible en `http://localhost:3000`)*

### 🚀 Despliegue en Producción (Render / Vercel)
Para el despliegue del backend, el **Build Command** debe asegurar la creación de la base de datos vectorial antes de arrancar el servidor:
```bash
pip install -r requirements.txt && python ingest.py
```

---

## 📂 d. Estructura del Proyecto

La organización del repositorio separa claramente la lógica de negocio (IA) de la interfaz de usuario:

```text
├── backend/
│   ├── data/               # Documentación y CV origen (Fuente de verdad)
│   ├── vector_db/          # Base de datos vectorial persistente (Autogenerada)
│   ├── ingest.py           # Script de procesamiento y chunking (RAG)
│   ├── main.py             # API y lógica de orquestación de prompts
│   └── .env                # Variables de entorno (Claves API)
├── frontend/
│   ├── src/app/            # Vistas: Analizador, Experiencia, Home (Chat)
│   ├── src/components/     # UI Reutilizable: ChatWidget, Navbar
│   ├── src/services/       # Capa de llamadas a la API (chatService.ts)
│   └── src/context/        # Gestión del estado global y preventivo
└── README.md               # Documentación principal
```

---

## 📊 e. Funcionalidades Principales

### 1. AI Offer Analyzer (Perfil Reclutador Senior)
Sube una oferta de empleo y recibe un diagnóstico técnico riguroso.
* **Filtros Preventivos:** Detecta textos no relacionados con el sector IT o de longitud insuficiente antes de enviar la petición (ahorro de tokens).
* **Cálculo de Fit Realista:** Sistema que penaliza activamente la ausencia de *core skills*.
* **Defensa Estratégica:** Identifica equivalencias arquitectónicas para sugerir argumentos de venta frente a herramientas no dominadas.

### 2. Agente Conversacional (Chat Inteligente)
Interfaz inspirada en una terminal de comandos que permite consultar dudas técnicas o de *soft skills* directamente contra mi perfil. Implementa *Guardrails* que bloquean peticiones de información sensible, redirigiendo al usuario a vías de contacto oficiales (LinkedIn).

### 3. Visual Showcase (Bento Grid)
Sección de experiencia diseñada con una UI moderna que permite explorar rápidamente mis hitos más destacados en sectores exigentes como **Banca, Telecomunicaciones y Administración Pública**.

## 🧭 f. Roadmap y Evolución Futura

El estado actual del proyecto representa un **Producto Mínimo Viable (MVP) completamente funcional** y desplegable, diseñado para cumplir con los objetivos del Máster. Sin embargo, la arquitectura ha sido concebida para escalar, teniendo previstas las siguientes mejoras para la Fase 2:

### Evolución Técnica (IA y Backend)
* **Soporte Multiformato (Analizador de PDFs):** Integración de capacidades de extracción de texto para permitir a los usuarios subir descripciones de ofertas directamente en formato `.pdf` o `.docx`.
* **Sistema de Observabilidad (Logs):** Implementación de un panel de analítica en el servidor para monitorizar el rendimiento de los prompts, medir el consumo de tokens y analizar los temas más consultados.
* **Streaming de Respuestas:** Actualización de los endpoints de FastAPI para devolver los datos mediante *Server-Sent Events* (SSE), mejorando la percepción de velocidad en la interfaz visual.

### Accesibilidad y Experiencia de Usuario (UX)
* **Internacionalización (i18n):** Implementación de soporte multi-idioma (Inglés/Español) en el frontend para adaptar dinámicamente tanto la interfaz como el idioma de respuesta del agente IA, ampliando el alcance a reclutadores internacionales.
* **Gestión de Temas (Light/Dark Mode):** Refactorización del diseño actual mediante variables dinámicas de Tailwind CSS para permitir a los usuarios alternar entre un tema claro y el diseño actual de terminal oscura, priorizando la accesibilidad visual.