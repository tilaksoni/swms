import React, { useRef, useState, useEffect } from "react";
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

const FaceRegister = () => {
  const webcamRef = useRef(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const workerId = localStorage.getItem("workerId");

  // ── Check if face already registered ──────────────────────────
  useEffect(() => {
    axios
      .get(`http://localhost:5001/check-face/${workerId}`)
      .then((res) => {
        setIsRegistered(res.data.registered);
        setChecking(false);
      })
      .catch((err) => {
        console.error(err);
        setChecking(false);
      });
  }, []);

  // ── Capture and Register Face ──────────────────────────────────
  const registerFace = async () => {
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
    try {
      const res = await axios.post("http://localhost:5001/register-face", {
        worker_id: workerId,
        image: imageSrc,
      });

      if (res.data.success) {
        toast.success("Face registered successfully!");
        setIsRegistered(true);
      } else {
        toast.error(res.data.message || "Failed to register face!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to face recognition server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">

      {/* ── Page Header ── */}
      <div className="mb-4">
        <h4 className="fw-bold mb-0">Face Registration</h4>
        <small className="text-medium-emphasis">
          Register your face for attendance marking
        </small>
      </div>

      <CRow className="justify-content-center">
        <CCol md={6}>
          <CCard className="shadow-sm">
            <CCardHeader className="d-flex align-items-center justify-content-between">
              <span className="fw-semibold">Camera</span>
              {!checking && (
                <CBadge color={isRegistered ? "success" : "warning"}>
                  {isRegistered ? "✓ Face Registered" : "Not Registered"}
                </CBadge>
              )}
            </CCardHeader>

            <CCardBody className="text-center">

              {/* Webcam */}
              <div style={{
                borderRadius: "12px",
                overflow: "hidden",
                marginBottom: "20px",
                border: "3px solid",
                borderColor: isRegistered ? "#198754" : "#ffc107"
              }}>
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  videoConstraints={{
                    width: 400,
                    height: 300,
                    facingMode: "user"
                  }}
                />
              </div>

              {/* Instructions */}
              <div className="mb-4 p-3 rounded"
                style={{ background: "rgba(13,110,253,0.05)", border: "1px solid rgba(13,110,253,0.2)" }}>
                <small className="text-medium-emphasis">
                  📷 Position your face in the center of the camera<br />
                  💡 Make sure you have good lighting<br />
                  👤 Keep a neutral expression
                </small>
              </div>

              {/* Register Button */}
              <CButton
                color={isRegistered ? "warning" : "primary"}
                size="lg"
                className="w-100"
                onClick={registerFace}
                disabled={loading}
              >
                {loading ? "Registering..." :
                  isRegistered ? "Update Face Registration" : "Register My Face"}
              </CButton>

              {isRegistered && (
                <div className="mt-3 text-success small">
                  ✅ Your face is registered! You can now use face attendance.
                </div>
              )}

            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default FaceRegister;
