import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CBadge,
  CProgress,
  CProgressBar,
  CButton,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilUser,
  cilEnvelopeClosed,
  cilBadge,
  cilClock,
  cilCheckCircle,
  cilStar,
} from "@coreui/icons";

const WorkerProfile = () => {
  const [worker, setWorker] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const workerId = parseInt(localStorage.getItem("workerId"));
  
  const [passwordData, setPasswordData] = useState({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});
const [passwordMode, setPasswordMode] = useState(false);




  useEffect(() => {
    axios.get(`http://localhost:5000/api/workers/${workerId}`)
      .then((res) => {
        setWorker(res.data);
        // fill form with current data
        setFormData({
          name: res.data.name,
          email: res.data.email
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSave = async () => {

     // ADD VALIDATION
  if (!formData.name) {
    toast.warning("Please enter your name!");
    return;
  }
  if (!formData.email) {
    toast.warning("Please enter your email!");
    return;
  }
  // email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    toast.warning("Please enter a valid email!");
    return;
  }

  try {
    console.log("Saving...", formData); // ADD
    const res = await axios.put(
      `http://localhost:5000/api/workers/${workerId}`,
      formData
    );
    console.log("Response:", res.data); // ADD
    setWorker(res.data);
    setFormData({
      name: res.data.name,
      email: res.data.email
    });
    setEditMode(false);
    toast.success("Profile updated successfully!");
  } catch (err) {
    console.error("Error:", err); // ADD
    toast.error("Failed to update profile!");
  }
};

const handlePasswordChange = (e) => {
  setPasswordData({
    ...passwordData,
    [e.target.name]: e.target.value
  });
};

const handleChangePassword = async () => {
  // validation
  if (!passwordData.currentPassword) {
    toast.warning("Please enter current password!");
    return;
  }
  if (!passwordData.newPassword) {
    toast.warning("Please enter new password!");
    return;
  }
  if (passwordData.newPassword.length < 6) {
    toast.warning("Password must be at least 6 characters!");
    return;
  }
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    toast.warning("Passwords do not match!");
    return;
  }

  try {
    await axios.put(
      "http://localhost:5000/api/auth/change-password",
      {
        workerId,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }
    );
    toast.success("Password changed successfully!");
    setPasswordMode(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to change password!");
  }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getProductivityLabel = (score) => {
    if (!score) return { label: "N/A", color: "secondary" };
    if (score >= 85) return { label: "Excellent", color: "success" };
    if (score >= 60) return { label: "Good", color: "info" };
    if (score >= 35) return { label: "Average", color: "warning" };
    return { label: "Needs Work", color: "danger" };
  };

  if (!worker) {
    return (
      <div className="text-center py-5 text-medium-emphasis">
        Loading profile...
      </div>
    );
  }

  const { label: prodLabel, color: prodColor } = getProductivityLabel(
    worker.productivity
  );

  
  return (
    <div className="p-4">

      {/* ── Page Header ── */}
      <div className="mb-4">
        <h4 className="fw-bold mb-0">My Profile</h4>
        <small className="text-medium-emphasis">
          View and manage your personal information
        </small>
      </div>

      <CRow className="g-4">

        {/* ── Left Column — Avatar Card ── */}
        <CCol md={4}>
          <CCard className="border-0 shadow-sm h-100">
            <CCardBody className="text-center py-5">

              {/* Avatar Circle */}
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0d6efd, #0dcaf0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontSize: "2.5rem",
                  color: "white",
                  fontWeight: "bold",
                  boxShadow: "0 4px 15px rgba(13, 110, 253, 0.3)",
                }}
              >
                {worker.name.charAt(0).toUpperCase()}
              </div>

              {/* Name */}
              <h4 className="fw-bold mb-1">{worker.name}</h4>

              {/* Role Badge */}
              <CBadge
                color="primary"
                shape="rounded-pill"
                className="px-3 py-2 mb-3"
                style={{ fontSize: "0.8rem" }}
              >
                {worker.role.charAt(0).toUpperCase() + worker.role.slice(1)}
              </CBadge>


              <div className="mt-3">
                {editMode ? (
                  <>
                    <CButton
                      color="success"
                      size="sm"
                      className="me-2"
                      onClick={handleSave}
                    >
                      Save Changes
                    </CButton>
                    <CButton
                      color="secondary"
                      size="sm"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </CButton>
                  </>
                ) : (
                  <CButton
                    color="primary"
                    size="sm"
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </CButton>
                )}
              </div>


              {/* Verified Status */}
              <div className="mt-2">
                {worker.is_verified ? (
                  <span className="text-success small">
                    <CIcon icon={cilCheckCircle} className="me-1" />
                    Verified Account
                  </span>
                ) : (
                  <span className="text-danger small">Not Verified</span>
                )}
              </div>

              {/* Divider */}
              <hr className="my-4" />

              {/* Worker ID */}
              <div className="text-medium-emphasis small">
                <strong>Worker ID</strong>
                <div
                  className="mt-1 fw-bold fs-5"
                  style={{ color: "#0d6efd" }}
                >
                  #{worker.id}
                </div>
              </div>

            </CCardBody>
          </CCard>
        </CCol>

        {/* ── Right Column ── */}
        <CCol md={8}>
          <CRow className="g-4">

            {/* Personal Info Card */}
            <CCol xs={12}>
              <CCard className="border-0 shadow-sm">
                <CCardBody>
                  <h6 className="fw-bold text-uppercase text-medium-emphasis mb-4"
                    style={{ letterSpacing: "0.05em" }}>
                    Personal Information
                  </h6>

                  <CRow className="g-3">

                    <CCol md={6}>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background: "rgba(13, 110, 253, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <CIcon icon={cilUser} style={{ color: "#0d6efd" }} />
                        </div>
                        <div>
                          <div className="text-medium-emphasis" style={{ fontSize: "0.75rem" }}>
                            Full Name
                          </div>
                          {editMode ? (
                            <input
                              className="form-control form-control-sm mt-1"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                            />
                          ) : (
                            <div className="fw-semibold">{worker.name}</div>
                          )}
                        </div>
                      </div>
                    </CCol>

                    <CCol md={6}>
                      <div>
                        <div className="text-medium-emphasis" style={{ fontSize: "0.75rem" }}>
                          Email Address
                        </div>
                        {editMode ? (
                          <input
                            className="form-control form-control-sm mt-1"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        ) : (
                          <div className="fw-semibold">{worker.email}</div>
                        )}
                      </div>
                    </CCol>

                    <CCol md={6}>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background: "rgba(25, 135, 84, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <CIcon icon={cilBadge}
                            style={{ color: "#198754" }} />
                        </div>
                        <div>
                          <div className="text-medium-emphasis"
                            style={{ fontSize: "0.75rem" }}>
                            Role
                          </div>
                          <div className="fw-semibold">
                            {worker.role.charAt(0).toUpperCase() +
                              worker.role.slice(1)}
                          </div>
                        </div>
                      </div>
                    </CCol>

                    <CCol md={6}>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background: "rgba(255, 193, 7, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <CIcon icon={cilClock}
                            style={{ color: "#ffc107" }} />
                        </div>
                        <div>
                          <div className="text-medium-emphasis"
                            style={{ fontSize: "0.75rem" }}>
                            Last Active
                          </div>
                          <div className="fw-semibold">
                            {formatDate(worker.last_active)}
                          </div>
                        </div>
                      </div>
                    </CCol>

                  </CRow>
                </CCardBody>
              </CCard>
            </CCol>

            {/* Productivity Card */}
            <CCol xs={12}>
              <CCard className="border-0 shadow-sm">
                <CCardBody>
                  <h6
                    className="fw-bold text-uppercase text-medium-emphasis mb-4"
                    style={{ letterSpacing: "0.05em" }}
                  >
                    Performance
                  </h6>

                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <CIcon icon={cilStar} className="text-warning" />
                      <span className="fw-semibold">Productivity Score</span>
                    </div>
                    <CBadge color={prodColor} shape="rounded-pill">
                      {prodLabel}
                    </CBadge>
                  </div>

                  <CProgress
                    className="mb-2"
                    style={{ height: "12px", borderRadius: "8px" }}
                  >
                    <CProgressBar
                      value={worker.productivity || 0}
                      color={prodColor}
                      style={{ borderRadius: "8px" }}
                    />
                  </CProgress>

                  <small className="text-medium-emphasis">
                    {worker.productivity
                      ? `${worker.productivity}% productivity rate`
                      : "No productivity data yet"}
                  </small>

                </CCardBody>
              </CCard>
            </CCol>

            {/* Change Password Card */}
<CCol xs={12}>
  <CCard className="border-0 shadow-sm">
    <CCardBody>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="fw-bold text-uppercase text-medium-emphasis mb-0"
          style={{ letterSpacing: "0.05em" }}>
          Change Password
        </h6>
        <CButton
          color="warning"
          variant="outline"
          size="sm"
          onClick={() => setPasswordMode(!passwordMode)}
        >
          {passwordMode ? "Cancel" : "Change Password"}
        </CButton>
      </div>

      {passwordMode && (
        <>
          <div className="mb-3">
            <label className="form-label small fw-semibold">
              Current Password
            </label>
            <input
              type="password"
              className="form-control"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">
              New Password
            </label>
            <input
              type="password"
              className="form-control"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">
              Confirm New Password
            </label>
            <input
              type="password"
              className="form-control"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
            />
          </div>

          <CButton
            color="primary"
            className="w-100"
            onClick={handleChangePassword}
          >
            Save New Password
          </CButton>
        </>
      )}

    </CCardBody>
  </CCard>
</CCol>

          </CRow>
        </CCol>
      </CRow>
    </div>
  );
};

export default WorkerProfile;
