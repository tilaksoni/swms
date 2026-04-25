// CCTVMonitor.jsx — matches your exact backend:
//   Flask  port 5001  →  /cctv/start  /cctv/stop  /video_feed
//   Node   port 5000  →  GET /api/attendance/today  (add this route, see below)

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  CCard, CCardBody, CCardHeader,
  CBadge, CButton, CSpinner, CAlert,
  CTable, CTableHead, CTableBody, CTableRow,
  CTableHeaderCell, CTableDataCell,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilMediaPlay, cilMediaStop, cilReload, cilWarning,
} from "@coreui/icons";

const FLASK = "http://localhost:5001";
const NODE  = "http://localhost:5000";

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

// ─────────────────────────────────────────────────────────────
const CCTVMonitor = () => {
  const [cameraOn,   setCameraOn]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [imgError,   setImgError]   = useState(false);
  const [attendance, setAttendance] = useState([]);
  const pollRef = useRef(null);
  const imgRef  = useRef(null);

  // ── Fetch today's attendance from Node.js ─────────────────
  const fetchAttendance = useCallback(async () => {
    try {
      const res  = await fetch(`${NODE}/api/attendance/today`);
      const data = await res.json();
      // Handle both array response and {records:[]} shape
      setAttendance(Array.isArray(data) ? data : (data.records ?? []));
    } catch {
      /* server may not be ready yet */
    }
  }, []);

  // Check camera state on mount
  useEffect(() => {
    fetch(`${FLASK}/cctv/status`)
      .then((r) => r.json())
      .then((d) => setCameraOn(d.active))
      .catch(() => {});
    fetchAttendance();
  }, [fetchAttendance]);

  // Poll attendance every 5 s while camera is running
  useEffect(() => {
    if (cameraOn) {
      pollRef.current = setInterval(fetchAttendance, 5000);
    } else {
      clearInterval(pollRef.current);
    }
    return () => clearInterval(pollRef.current);
  }, [cameraOn, fetchAttendance]);

  // ── Start camera ──────────────────────────────────────────
  const handleStart = async () => {
    setLoading(true);
    setError(null);
    setImgError(false);
    try {
      const res  = await fetch(`${FLASK}/cctv/start`, { method: "POST" });
      const data = await res.json();
      if (data.status === "started" || data.status === "already_running") {
        setCameraOn(true);
        // Give Flask ~800 ms to emit the first frame before loading <img>
        setTimeout(() => {
          if (imgRef.current) {
            imgRef.current.src = `${FLASK}/video_feed?t=${Date.now()}`;
          }
        }, 800);
      }
    } catch {
      setError("Cannot reach Flask on port 5001. Make sure cctv_flask.py is running.");
    } finally {
      setLoading(false);
    }
  };

  // ── Stop camera ───────────────────────────────────────────
  const handleStop = async () => {
    setLoading(true);
    try {
      await fetch(`${FLASK}/cctv/stop`, { method: "POST" });
      setCameraOn(false);
    } catch {
      setError("Failed to stop camera.");
    } finally {
      setLoading(false);
    }
  };

  // ── Stats ─────────────────────────────────────────────────
  const total   = attendance.length;
  const present = attendance.filter(
    (r) => (r.status ?? "").toLowerCase() === "present"
  ).length;

  // ── Render ────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 360px",
        gap: 20,
        padding: 20,
        alignItems: "start",
      }}
    >
      {/* ── Left column ──────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Camera card */}
        <CCard>
          <CCardHeader className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <strong style={{ fontSize: 15 }}>AI CCTV System</strong>
              <CBadge color={cameraOn ? "success" : "secondary"}>
                {cameraOn ? "● LIVE" : "○ OFFLINE"}
              </CBadge>
            </div>
            <div className="d-flex gap-2">
              <CButton
                color="success"
                size="sm"
                disabled={cameraOn || loading}
                onClick={handleStart}
              >
                {loading && !cameraOn
                  ? <CSpinner size="sm" className="me-1" />
                  : <CIcon icon={cilMediaPlay} className="me-1" />}
                Start
              </CButton>
              <CButton
                color="danger"
                variant="outline"
                size="sm"
                disabled={!cameraOn || loading}
                onClick={handleStop}
              >
                {loading && cameraOn
                  ? <CSpinner size="sm" className="me-1" />
                  : <CIcon icon={cilMediaStop} className="me-1" />}
                Stop
              </CButton>
            </div>
          </CCardHeader>

          <CCardBody
            style={{
              padding: 0,
              background: "#0d0d0d",
              borderRadius: "0 0 6px 6px",
              minHeight: 380,
            }}
          >
            {error && (
              <CAlert color="danger" className="m-3">
                <CIcon icon={cilWarning} className="me-2" />
                {error}
              </CAlert>
            )}

            {cameraOn && !imgError ? (
              /*
                Browser natively streams MJPEG via a plain <img> tag.
                Flask sends multipart/x-mixed-replace and the browser
                updates the image element automatically — no JS needed.
              */
              <img
                ref={imgRef}
                src={`${FLASK}/video_feed`}
                alt="CCTV Feed"
                onError={() => setImgError(true)}
                style={{
                  width: "100%",
                  display: "block",
                  borderRadius: "0 0 6px 6px",
                  minHeight: 380,
                  objectFit: "contain",
                  background: "#0d0d0d",
                }}
              />
            ) : (
              <div
                style={{
                  minHeight: 380,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#555",
                  gap: 14,
                }}
              >
                {/* Camera icon */}
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
                  stroke="#333" strokeWidth="1" strokeLinecap="round">
                  <path d="M23 7l-7 5 7 5V7z"/>
                  <rect x="1" y="5" width="15" height="14" rx="2"/>
                </svg>
                <span style={{ fontSize: 13 }}>
                  {imgError
                    ? "Stream error — try restarting the camera"
                    : "Camera offline — press Start"}
                </span>
                {imgError && (
                  <CButton size="sm" color="secondary" variant="outline"
                    onClick={handleStart}>
                    <CIcon icon={cilReload} className="me-1" /> Retry
                  </CButton>
                )}
              </div>
            )}
          </CCardBody>
        </CCard>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { label: "Total Today",  value: total,           color: "#321fdb" },
            { label: "Present",      value: present,         color: "#2eb85c" },
            { label: "Unique Workers", value: new Set(attendance.map(r => r.worker_id)).size, color: "#f9a825" },
          ].map(({ label, value, color }) => (
            <CCard key={label}>
              <CCardBody style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 12, color: "var(--cui-secondary-color)", marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
              </CCardBody>
            </CCard>
          ))}
        </div>
      </div>

      {/* ── Right column: Attendance log ─────────────────── */}
      <CCard style={{ height: "fit-content" }}>
        <CCardHeader className="d-flex align-items-center justify-content-between">
          <strong style={{ fontSize: 15 }}>Attendance Log</strong>
          <CButton size="sm" color="secondary" variant="ghost"
            onClick={fetchAttendance} style={{ padding: "2px 8px" }}>
            <CIcon icon={cilReload} size="sm" />
          </CButton>
        </CCardHeader>

        <CCardBody style={{ padding: 0, maxHeight: 560, overflowY: "auto" }}>
          {attendance.length === 0 ? (
            <div style={{
              padding: 32, textAlign: "center",
              color: "var(--cui-secondary-color)", fontSize: 13,
            }}>
              No attendance records yet today.
            </div>
          ) : (
            <CTable small hover style={{ marginBottom: 0 }}>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ paddingLeft: 16, fontSize: 12 }}>
                    Worker ID
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ fontSize: 12 }}>Time</CTableHeaderCell>
                  <CTableHeaderCell style={{ fontSize: 12 }}>Status</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {attendance.map((rec, i) => (
                  <CTableRow key={rec.id ?? i}>
                    <CTableDataCell style={{ paddingLeft: 16, fontWeight: 600, fontSize: 14 }}>
                      #{rec.name ?? `Worker #${rec.worker_id}`}
                    </CTableDataCell>
                    <CTableDataCell style={{ fontSize: 12, color: "var(--cui-secondary-color)" }}>
                      rec.date ? new Date(rec.date).toLocaleDateString() : "—"
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge
                        color={
                          (rec.status ?? "").toLowerCase() === "present"
                            ? "success"
                            : "danger"
                        }
                        style={{ fontSize: 11 }}
                      >
                        {rec.status ?? "Present"}
                      </CBadge>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </div>
  );
};

export default CCTVMonitor;
