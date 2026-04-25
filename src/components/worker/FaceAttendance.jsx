import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { toast } from "react-toastify";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CRow,
  CCol,
  CBadge,
} from "@coreui/react";

const FaceAttendance = () => {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const markAttendance = async () => {
    if (!webcamRef.current) {
      toast.error("Camera not ready!");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) {
      toast.error("Could not capture image!");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const recognizeRes = await axios.post(
        "http://localhost:5001/recognize-face",
        { image: imageSrc }
      );

      if (!recognizeRes.data.success) {
        toast.error(recognizeRes.data.message || "Face not recognized!");
        setResult({ success: false, message: recognizeRes.data.message });
        return;
      }

      const recognizedWorkerId = recognizeRes.data.worker_id;
      const confidence = recognizeRes.data.confidence;

      await axios.post("http://localhost:5000/api/attendance", {
        worker_id: recognizedWorkerId,
        status: "Present",
      });

      toast.success(`Attendance marked! Confidence: ${confidence}%`);
      setResult({
        success: true,
        worker_id: recognizedWorkerId,
        confidence: confidence,
        message: "Attendance marked successfully!"
      });

    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Failed to mark attendance!";
      toast.error(message);
      setResult({ success: false, message: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h4 className="fw-bold mb-0">Face Attendance</h4>
        <small className="text-medium-emphasis">
          Mark your attendance using face recognition
        </small>
      </div>

      <CRow className="justify-content-center">
        <CCol md={6}>
          <CCard className="shadow-sm">
            <CCardHeader className="d-flex align-items-center justify-content-between">
              <span className="fw-semibold">Camera</span>
              <CBadge color="primary">
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit", month: "short", year: "numeric"
                })}
              </CBadge>
            </CCardHeader>

            <CCardBody className="text-center">
              <div style={{
                borderRadius: "12px",
                overflow: "hidden",
                marginBottom: "20px",
                border: "3px solid",
                borderColor: result
                  ? result.success ? "#198754" : "#dc3545"
                  : "#0d6efd"
              }}>
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  mirrored={true}
                  videoConstraints={{ facingMode: "user" }}
                />
              </div>

              {result && (
                <div className="mb-4 p-3 rounded"
                  style={{
                    background: result.success ? "rgba(25,135,84,0.08)" : "rgba(220,53,69,0.08)",
                    border: `1px solid ${result.success ? "#198754" : "#dc3545"}`
                  }}>
                  {result.success ? (
                    <>
                      <div className="fw-bold text-success fs-5">✅ Attendance Marked!</div>
                      <small className="text-medium-emphasis">
                        Worker ID: #{result.worker_id} | Confidence: {result.confidence}%
                      </small>
                    </>
                  ) : (
                    <div className="fw-bold text-danger">❌ {result.message}</div>
                  )}
                </div>
              )}

              <div className="mb-4 p-3 rounded"
                style={{
                  background: "rgba(13,110,253,0.05)",
                  border: "1px solid rgba(13,110,253,0.2)"
                }}>
                <small className="text-medium-emphasis">
                  📷 Position your face in the center<br />
                  💡 Make sure you have good lighting<br />
                  👤 Look directly at the camera
                </small>
              </div>

              <CButton
                color="success"
                size="lg"
                className="w-100"
                onClick={markAttendance}
                disabled={loading}
              >
                {loading ? "Processing..." : "Mark My Attendance"}
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default FaceAttendance;
