// AIChatbot.jsx
// Floating AI chatbot — place in src/components/AIChatbot.jsx
// Add <AIChatbot /> in App.js or AppLayout so it appears on every page

import React, { useState, useRef, useEffect } from "react";
import {
    CButton, CSpinner, CBadge,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
    cilSend, cilX, cilCloudUpload, cilTrash,
} from "@coreui/icons";

const FLASK = "http://localhost:5001";

// ── Markdown-lite renderer (bold, newlines) ───────────────────
const renderAnswer = (text) => {
    return text.split("\n").map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
            <p key={i} style={{ margin: "4px 0", lineHeight: 1.6 }}>
                {parts.map((p, j) =>
                    j % 2 === 1
                        ? <strong key={j}>{p}</strong>
                        : p
                )}
            </p>
        );
    });
};

const AIChatbot = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "bot", text: "Hi! I'm your Smart Workforce Assistant. Ask me anything about attendance, workers, salary, or upload a PDF document." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [pdfs, setPdfs] = useState([]);
    const [usePdf, setUsePdf] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [mode, setMode] = useState("chat"); // "chat" | "pdf"
    const bottomRef = useRef(null);
    const fileRef = useRef(null);

    // Get user info from localStorage (adjust key to match your auth)
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user.role || "worker";
    const worker_id = user.id || null;

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    useEffect(() => {
        if (open) fetchPdfs();
    }, [open]);

    const fetchPdfs = async () => {
        try {
            const res = await fetch(`${FLASK}/chat/pdfs`);
            const data = await res.json();
            setPdfs(data.pdfs || []);
        } catch { }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const question = input.trim();
        setInput("");
        setMessages(m => [...m, { role: "user", text: question }]);
        setLoading(true);

        try {
            const res = await fetch(`${FLASK}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question,
                    role,
                    worker_id,
                    use_pdf: usePdf && pdfs.length > 0,
                }),
            });
            const data = await res.json();
            setMessages(m => [...m, {
                role: "bot",
                text: data.answer || data.error || "Sorry, I couldn't get a response."
            }]);
        } catch {
            setMessages(m => [...m, { role: "bot", text: "Connection error. Make sure Flask is running." }]);
        } finally {
            setLoading(false);
        }
    };

    const uploadPdf = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const form = new FormData();
        form.append("file", file);
        try {
            const res = await fetch(`${FLASK}/chat/upload-pdf`, {
                method: "POST",
                body: form,
            });
            const data = await res.json();
            if (data.filename) {
                setPdfs(p => [...p, data.filename]);
                setUsePdf(true);
                setMessages(m => [...m, {
                    role: "bot",
                    text: `PDF "${data.filename}" uploaded! I can now answer questions from it. Toggle "Use PDF" to enable.`
                }]);
            } else {
                setMessages(m => [...m, { role: "bot", text: data.error || "Upload failed." }]);
            }
        } catch {
            setMessages(m => [...m, { role: "bot", text: "Upload failed. Try again." }]);
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    return (
        <>
            {/* ── Floating button ─────────────────────────────── */}
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    position: "fixed",
                    bottom: 24,
                    right: 24,
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "#321fdb",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                    boxShadow: "0 4px 16px rgba(50,31,219,0.35)",
                    transition: "transform 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
                {open
                    ? <CIcon icon={cilX} style={{ color: "#fff", width: 20, height: 20 }} />
                    : <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                            fill="#fff" opacity=".9" />
                    </svg>
                }
            </button>

            {/* ── Chat panel ──────────────────────────────────── */}
            {open && (
                <div style={{
                    position: "fixed",
                    bottom: 88,
                    right: 24,
                    width: 380,
                    height: 560,
                    background: "var(--cui-body-bg, #fff)",
                    border: "0.5px solid var(--cui-border-color)",
                    borderRadius: 16,
                    display: "flex",
                    flexDirection: "column",
                    zIndex: 9998,
                    overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                }}>

                    {/* Header */}
                    <div style={{
                        background: "#321fdb",
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: "rgba(255,255,255,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                                    fill="#fff" />
                            </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Smart Workforce Assistant</div>
                            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
                                {role === "manager" ? "Manager mode — full access" : "Worker mode — your data only"}
                            </div>
                        </div>
                        {/* Mode tabs */}
                        <div style={{ display: "flex", gap: 6 }}>
                            {["chat", "pdf"].map(m => (
                                <button key={m} onClick={() => setMode(m)} style={{
                                    padding: "3px 10px",
                                    borderRadius: 20,
                                    border: "none",
                                    fontSize: 11,
                                    cursor: "pointer",
                                    background: mode === m ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)",
                                    color: mode === m ? "#321fdb" : "#fff",
                                    fontWeight: mode === m ? 600 : 400,
                                }}>
                                    {m === "chat" ? "Chat" : "PDFs"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── PDF management panel ───────────────────── */}
                    {mode === "pdf" ? (
                        <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
                            <div style={{ fontSize: 13, color: "var(--cui-secondary-color)", marginBottom: 12 }}>
                                Upload PDF documents (HR policy, labor laws, company rules) and the AI will answer questions from them.
                            </div>

                            <input ref={fileRef} type="file" accept=".pdf"
                                onChange={uploadPdf} style={{ display: "none" }} />

                            {role === "manager" && (
                                <CButton color="primary" size="sm"
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploading}
                                    style={{ width: "100%", marginBottom: 12 }}>
                                    {uploading
                                        ? <><CSpinner size="sm" className="me-2" />Uploading...</>
                                        : <><CIcon icon={cilCloudUpload} className="me-2" />Upload PDF</>}
                                </CButton>
                            )}
                            {role !== "manager" && (
                                <div style={{
                                    fontSize: 12, color: "var(--cui-secondary-color)",
                                    textAlign: "center", padding: "8px 0"
                                }}>
                                    Only managers can upload documents.
                                </div>
                            )}

                            {pdfs.length === 0 ? (
                                <div style={{
                                    textAlign: "center", padding: 32,
                                    color: "var(--cui-secondary-color)", fontSize: 13,
                                }}>
                                    No PDFs uploaded yet
                                </div>
                            ) : (
                                <>
                                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
                                        Uploaded documents:
                                    </div>
                                    {pdfs.map((pdf, i) => (
                                        <div key={i} style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            padding: "8px 12px",
                                            background: "var(--cui-tertiary-bg, #f8f9fa)",
                                            borderRadius: 8,
                                            marginBottom: 6,
                                            fontSize: 13,
                                        }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                stroke="#e55353" strokeWidth="2" strokeLinecap="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {pdf}
                                            </span>
                                            <CBadge color="success" style={{ fontSize: 10 }}>Ready</CBadge>
                                        </div>
                                    ))}

                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 8,
                                        marginTop: 12, padding: "8px 12px",
                                        background: usePdf ? "#eaf3de" : "var(--cui-tertiary-bg)",
                                        borderRadius: 8, cursor: "pointer",
                                    }} onClick={() => setUsePdf(u => !u)}>
                                        <input type="checkbox" checked={usePdf} onChange={() => { }}
                                            style={{ cursor: "pointer" }} />
                                        <span style={{ fontSize: 13 }}>Use PDF knowledge in chat</span>
                                    </div>
                                </>
                            )}
                        </div>

                    ) : (
                        /* ── Chat panel ───────────────────────────── */
                        <>
                            <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
                                {messages.map((msg, i) => (
                                    <div key={i} style={{
                                        display: "flex",
                                        justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                                        marginBottom: 10,
                                    }}>
                                        <div style={{
                                            maxWidth: "80%",
                                            padding: "9px 13px",
                                            borderRadius: msg.role === "user"
                                                ? "16px 16px 4px 16px"
                                                : "16px 16px 16px 4px",
                                            background: msg.role === "user"
                                                ? "#321fdb"
                                                : "var(--cui-tertiary-bg, #f0f0f0)",
                                            color: msg.role === "user"
                                                ? "#fff"
                                                : "var(--cui-body-color)",
                                            fontSize: 13,
                                        }}>
                                            {msg.role === "bot"
                                                ? renderAnswer(msg.text)
                                                : msg.text}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div style={{ display: "flex", gap: 5, padding: "8px 4px" }}>
                                        {[0, 1, 2].map(i => (
                                            <div key={i} style={{
                                                width: 8, height: 8, borderRadius: "50%",
                                                background: "#321fdb", opacity: 0.4,
                                                animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                                            }} />
                                        ))}
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* PDF indicator */}
                            {usePdf && pdfs.length > 0 && (
                                <div style={{
                                    padding: "4px 14px",
                                    fontSize: 11,
                                    color: "#2eb85c",
                                    background: "#eaf3de",
                                    borderTop: "0.5px solid #c0dd97",
                                }}>
                                    Using PDF knowledge ({pdfs.length} document{pdfs.length > 1 ? "s" : ""})
                                </div>
                            )}

                            {/* Suggested questions */}
                            {messages.length === 1 && (
                                <div style={{ padding: "0 12px 8px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {(role === "manager"
                                        ? ["Who is present today?", "Show salary summary", "How many workers?"]
                                        : ["My attendance this month", "My salary status", "Am I present today?"]
                                    ).map(q => (
                                        <button key={q} onClick={() => { setInput(q); }}
                                            style={{
                                                padding: "4px 10px",
                                                borderRadius: 20,
                                                border: "0.5px solid var(--cui-border-color)",
                                                background: "transparent",
                                                fontSize: 11,
                                                cursor: "pointer",
                                                color: "var(--cui-secondary-color)",
                                            }}>
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Input */}
                            <div style={{
                                padding: "10px 12px",
                                borderTop: "0.5px solid var(--cui-border-color)",
                                display: "flex",
                                gap: 8,
                                alignItems: "flex-end",
                            }}>
                                <textarea
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    placeholder="Ask anything..."
                                    rows={1}
                                    style={{
                                        flex: 1,
                                        resize: "none",
                                        border: "0.5px solid var(--cui-border-color)",
                                        borderRadius: 10,
                                        padding: "8px 12px",
                                        fontSize: 13,
                                        outline: "none",
                                        background: "var(--cui-body-bg)",
                                        color: "var(--cui-body-color)",
                                        fontFamily: "inherit",
                                    }}
                                />
                                <CButton
                                    color="primary"
                                    size="sm"
                                    disabled={!input.trim() || loading}
                                    onClick={sendMessage}
                                    style={{ borderRadius: 10, padding: "8px 12px", flexShrink: 0 }}
                                >
                                    {loading
                                        ? <CSpinner size="sm" />
                                        : <CIcon icon={cilSend} size="sm" />}
                                </CButton>
                            </div>
                        </>
                    )}
                </div>
            )}

            <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
        </>
    );
};

export default AIChatbot;
