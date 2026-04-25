import os
import faiss
import numpy as np
import pdfplumber
from flask import Blueprint, request, jsonify
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from db import get_connection

load_dotenv()

chatbot_bp = Blueprint('chatbot', __name__)

from groq import Groq
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Embedding model for PDF RAG
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# In-memory PDF vector store
pdf_chunks    = []
pdf_index     = None
pdf_filenames = []


def chunk_text(text, chunk_size=500, overlap=50):
    words  = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks


def add_pdf_to_index(text, filename):
    global pdf_index, pdf_chunks, pdf_filenames
    chunks = chunk_text(text)
    if not chunks:
        return
    embeddings = embedder.encode(chunks, convert_to_numpy=True).astype("float32")
    faiss.normalize_L2(embeddings)
    if pdf_index is None:
        pdf_index = faiss.IndexFlatIP(embeddings.shape[1])
    pdf_index.add(embeddings)
    pdf_chunks.extend(chunks)
    pdf_filenames.append(filename)


def search_pdf(query, top_k=4):
    if pdf_index is None or not pdf_chunks:
        return []
    q_emb = embedder.encode([query], convert_to_numpy=True).astype("float32")
    faiss.normalize_L2(q_emb)
    _, indices = pdf_index.search(q_emb, top_k)
    return [pdf_chunks[i] for i in indices[0] if i < len(pdf_chunks)]


def db_query(sql, params=None):
    """Run a query using psycopg2 and return rows as list of dicts."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(sql, params or [])
        cols = [desc[0] for desc in cur.description]
        rows = [dict(zip(cols, row)) for row in cur.fetchall()]
        return rows
    except Exception as e:
        print("DB query error:", e)
        return []
    finally:
        conn.close()


def get_db_context(question, user_role, worker_id=None):
    question_lower = question.lower()
    context_parts  = []

    # Attendance queries
    if any(w in question_lower for w in ["attendance", "present", "absent", "today", "marked", "come", "missing", "not present"]):
        if user_role == "manager":
            # Present workers
            present_rows = db_query("""
                SELECT w.name, a.status, a.date
                FROM attendance a
                JOIN workers w ON w.id = a.worker_id
                WHERE a.date = CURRENT_DATE
                ORDER BY a.date DESC
            """)
            if present_rows:
                context_parts.append("Workers present today:\n" +
                    "\n".join([f"- {r['name']}: {r['status']}" for r in present_rows]))
            else:
                context_parts.append("No attendance records for today.")

            # Absent workers
            absent_rows = db_query("""
                SELECT w.name, w.id
                FROM workers w
                WHERE w.role = 'worker'
                AND w.id NOT IN (
                    SELECT a.worker_id FROM attendance a
                    WHERE a.date = CURRENT_DATE
                )
            """)
            if absent_rows:
                context_parts.append("Workers absent today:\n" +
                    "\n".join([f"- {r['name']} (ID:{r['id']})" for r in absent_rows]))
            else:
                context_parts.append("All workers are present today!")
        else:
            rows = db_query("""
                SELECT status, date FROM attendance
                WHERE worker_id = %s
                ORDER BY date DESC LIMIT 30
            """, [worker_id])
            if rows:
                context_parts.append("Your recent attendance:\n" +
                    "\n".join([f"- {r['status']} on {r['date']}" for r in rows]))

    # Worker queries
    if any(w in question_lower for w in ["worker", "employee", "staff", "team", "how many", "total"]):
        if user_role == "manager":
            rows = db_query("""
                SELECT id, name, email, status FROM workers WHERE role = 'worker'
            """)
            context_parts.append(f"Total workers: {len(rows)}\n" +
                "\n".join([f"- {r['name']} (ID:{r['id']}, {r['status']})" for r in rows]))

    # Salary queries
    if any(w in question_lower for w in ["salary", "pay", "wage", "payment", "earning", "money"]):
        if user_role == "manager":
            rows = db_query("""
                SELECT w.name, s.final_salary, s.status, s.month, s.year
                FROM salary s
                JOIN workers w ON w.id = s.worker_id
                ORDER BY s.year DESC, s.month DESC LIMIT 20
            """)
            if rows:
                context_parts.append("Recent salary records:\n" +
                    "\n".join([f"- {r['name']}: Rs.{r['final_salary']} ({r['month']}/{r['year']}) - {r['status']}" for r in rows]))
        else:
            rows = db_query("""
                SELECT final_salary, status, month, year
                FROM salary WHERE worker_id = %s
                ORDER BY year DESC, month DESC LIMIT 6
            """, [worker_id])
            if rows:
                context_parts.append("Your salary records:\n" +
                    "\n".join([f"- Rs.{r['final_salary']} ({r['month']}/{r['year']}) - {r['status']}" for r in rows]))

    return "\n\n".join(context_parts)


# Routes

@chatbot_bp.route("/chat", methods=["POST"])
def chat():
    data      = request.json
    question  = data.get("question", "").strip()
    user_role = data.get("role", "worker")
    worker_id = data.get("worker_id")
    use_pdf   = data.get("use_pdf", False)

    if not question:
        return jsonify({"error": "No question provided"}), 400

    context_parts = []

    # 1. Database context
    db_context = get_db_context(question, user_role, worker_id)
    if db_context:
        context_parts.append(f"DATABASE INFO:\n{db_context}")

    # 2. PDF context
    if use_pdf and pdf_index is not None:
        pdf_results = search_pdf(question)
        if pdf_results:
            context_parts.append("DOCUMENT INFO:\n" + "\n\n".join(pdf_results))

    # 3. Build prompt
    role_instruction = (
        "You are an AI assistant for a Labour Management System. "
        "You are talking to a MANAGER who can see all worker data. "
        if user_role == "manager"
        else
        "You are an AI assistant for a Labour Management System. "
        "You are talking to a WORKER who can only see their own data. "
        "Never reveal other workers data."
    )

    if context_parts:
        prompt = f"""{role_instruction}

Use the following information to answer the question accurately.
If the information is not in the context, say you don't have that data.

{chr(10).join(context_parts)}

Question: {question}
Answer:"""
    else:
        prompt = f"""{role_instruction}
Answer this general question about labour management:
Question: {question}
Answer:"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024,
        )
        answer = response.choices[0].message.content.strip()
        return jsonify({"answer": answer})
    except Exception as e:
        print("Groq error:", e)
        return jsonify({"error": "AI service error"}), 500


@chatbot_bp.route("/chat/upload-pdf", methods=["POST"])
def upload_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files["file"]
    if not file.filename.endswith(".pdf"):
        return jsonify({"error": "Only PDF files allowed"}), 400
    try:
        text = ""
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        if not text.strip():
            return jsonify({"error": "Could not extract text from PDF"}), 400
        add_pdf_to_index(text, file.filename)
        return jsonify({
            "message": f"PDF uploaded successfully",
            "filename": file.filename
        })
    except Exception as e:
        print("PDF upload error:", e)
        return jsonify({"error": "Failed to process PDF"}), 500


@chatbot_bp.route("/chat/pdfs", methods=["GET"])
def list_pdfs():
    return jsonify({"pdfs": pdf_filenames})
