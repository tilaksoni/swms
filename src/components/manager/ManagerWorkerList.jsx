import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CBadge,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CFormInput,
  CProgress,
  CProgressBar,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilPeople,
  cilSearch,
  cilTrash,
  cilInfo,
  cilStar,
} from "@coreui/icons";

const ManagerWorkerList = () => {
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = () => {
    axios.get("http://localhost:5000/api/workers")
      .then(res => {
        setWorkers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  // ── Delete Worker ──────────────────────────────────────────────
  const deleteWorker = async (id) => {
    if (!window.confirm("Are you sure you want to delete this worker?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/workers/${id}`);
      fetchWorkers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete worker!");
    }
  };

  // ── View Worker Details ────────────────────────────────────────
  const viewWorker = (worker) => {
    setSelectedWorker(worker);
    setModalOpen(true);
  };

  // ── Search Filter ──────────────────────────────────────────────
  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── Productivity Label ─────────────────────────────────────────
  const getProductivityLabel = (score) => {
    if (!score) return { label: "N/A", color: "secondary" };
    if (score >= 85) return { label: "Excellent", color: "success" };
    if (score >= 60) return { label: "Good", color: "info" };
    if (score >= 35) return { label: "Average", color: "warning" };
    return { label: "Needs Work", color: "danger" };
  };

  return (
    <div className="p-4">

      {/* ── Page Header ── */}
      <div className="mb-4">
        <h4 className="fw-bold mb-0">Worker List</h4>
        <small className="text-medium-emphasis">
          Manage and view all workers in the system
        </small>
      </div>

      {/* ── Stats Row ── */}
      <CRow className="g-3 mb-4">
        <CCol xs={6} md={3}>
          <CCard className="border-top border-top-primary border-top-3 shadow-sm">
            <CCardBody className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-medium-emphasis fw-semibold text-uppercase mb-1"
                  style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                  Total Workers
                </div>
                <div className="fs-2 fw-bold">{workers.length}</div>
              </div>
              <CIcon icon={cilPeople} size="3xl" className="text-primary opacity-25" />
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={6} md={3}>
          <CCard className="border-top border-top-success border-top-3 shadow-sm">
            <CCardBody className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-medium-emphasis fw-semibold text-uppercase mb-1"
                  style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                  Active
                </div>
                <div className="fs-2 fw-bold">
                  {workers.filter(w => w.status === "Active" || !w.status).length}
                </div>
              </div>
              <CIcon icon={cilPeople} size="3xl" className="text-success opacity-25" />
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={6} md={3}>
          <CCard className="border-top border-top-warning border-top-3 shadow-sm">
            <CCardBody className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-medium-emphasis fw-semibold text-uppercase mb-1"
                  style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                  Verified
                </div>
                <div className="fs-2 fw-bold">
                  {workers.filter(w => w.is_verified).length}
                </div>
              </div>
              <CIcon icon={cilStar} size="3xl" className="text-warning opacity-25" />
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={6} md={3}>
          <CCard className="border-top border-top-info border-top-3 shadow-sm">
            <CCardBody className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-medium-emphasis fw-semibold text-uppercase mb-1"
                  style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                  Unverified
                </div>
                <div className="fs-2 fw-bold">
                  {workers.filter(w => !w.is_verified).length}
                </div>
              </div>
              <CIcon icon={cilPeople} size="3xl" className="text-info opacity-25" />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* ── Worker Table ── */}
      <CCard className="shadow-sm">
        <CCardHeader className="d-flex align-items-center justify-content-between">
          <span className="fw-semibold">All Workers</span>
          <div style={{ width: "250px" }}>
            <CFormInput
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="sm"
            />
          </div>
        </CCardHeader>

        <CCardBody className="p-0">
          {loading ? (
            <div className="text-center py-5 text-medium-emphasis">
              Loading workers...
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-5 text-medium-emphasis">
              No workers found.
            </div>
          ) : (
            <div className="table-responsive">
              <CTable hover align="middle" className="mb-0">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell style={{ width: "50px" }}>#</CTableHeaderCell>
                    <CTableHeaderCell>Worker</CTableHeaderCell>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>Role</CTableHeaderCell>
                    <CTableHeaderCell>Productivity</CTableHeaderCell>
                    <CTableHeaderCell>Verified</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {filteredWorkers.map((worker, index) => {
                    const { label, color } = getProductivityLabel(worker.productivity);
                    return (
                      <CTableRow key={worker.id}>

                        {/* # */}
                        <CTableDataCell className="text-medium-emphasis small">
                          {index + 1}
                        </CTableDataCell>

                        {/* Worker */}
                        <CTableDataCell>
                          <div className="d-flex align-items-center gap-2">
                            <div style={{
                              width: "36px", height: "36px", borderRadius: "50%",
                              background: "linear-gradient(135deg, #0d6efd, #0dcaf0)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "white", fontSize: "0.9rem", fontWeight: "bold", flexShrink: 0
                            }}>
                              {worker.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-semibold">{worker.name}</div>
                              <small className="text-medium-emphasis">ID: #{worker.id}</small>
                            </div>
                          </div>
                        </CTableDataCell>

                        {/* Email */}
                        <CTableDataCell className="text-medium-emphasis small">
                          {worker.email}
                        </CTableDataCell>

                        {/* Role */}
                        <CTableDataCell>
                          <CBadge color="primary" shape="rounded-pill">
                            {worker.role}
                          </CBadge>
                        </CTableDataCell>

                        {/* Productivity */}
                        <CTableDataCell style={{ minWidth: "140px" }}>
                          <div className="d-flex flex-column gap-1">
                            <div className="d-flex justify-content-between">
                              <small>{worker.productivity || 0}%</small>
                              <CBadge color={color} style={{ fontSize: "0.65rem" }}>
                                {label}
                              </CBadge>
                            </div>
                            <CProgress style={{ height: "6px", borderRadius: "8px" }}>
                              <CProgressBar
                                value={worker.productivity || 0}
                                color={color}
                                style={{ borderRadius: "8px" }}
                              />
                            </CProgress>
                          </div>
                        </CTableDataCell>

                        {/* Verified */}
                        <CTableDataCell>
                          {worker.is_verified ? (
                            <CBadge color="success" shape="rounded-pill">✓ Verified</CBadge>
                          ) : (
                            <CBadge color="danger" shape="rounded-pill">✗ Not Verified</CBadge>
                          )}
                        </CTableDataCell>

                        {/* Actions */}
                        <CTableDataCell>
                          <div className="d-flex gap-2">
                            <CButton
                              color="info"
                              variant="outline"
                              size="sm"
                              onClick={() => viewWorker(worker)}
                            >
                              <CIcon icon={cilInfo} size="sm" />
                            </CButton>
                            <CButton
                              color="danger"
                              variant="outline"
                              size="sm"
                              onClick={() => deleteWorker(worker.id)}
                            >
                              <CIcon icon={cilTrash} size="sm" />
                            </CButton>
                          </div>
                        </CTableDataCell>

                      </CTableRow>
                    );
                  })}
                </CTableBody>
              </CTable>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* ── Worker Detail Modal ── */}
      <CModal visible={modalOpen} onClose={() => setModalOpen(false)}>
        <CModalHeader>
          <CModalTitle>Worker Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedWorker && (
            <div>
              {/* Avatar */}
              <div className="text-center mb-4">
                <div style={{
                  width: "70px", height: "70px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #0d6efd, #0dcaf0)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 10px", fontSize: "2rem", color: "white", fontWeight: "bold"
                }}>
                  {selectedWorker.name.charAt(0).toUpperCase()}
                </div>
                <h5 className="fw-bold mb-1">{selectedWorker.name}</h5>
                <CBadge color="primary" shape="rounded-pill">{selectedWorker.role}</CBadge>
              </div>

              {/* Details */}
              <table className="table table-borderless table-sm">
                <tbody>
                  <tr>
                    <td className="text-medium-emphasis">Worker ID</td>
                    <td className="fw-semibold">#{selectedWorker.id}</td>
                  </tr>
                  <tr>
                    <td className="text-medium-emphasis">Email</td>
                    <td className="fw-semibold">{selectedWorker.email}</td>
                  </tr>
                  <tr>
                    <td className="text-medium-emphasis">Status</td>
                    <td>
                      <CBadge color="success">{selectedWorker.status || "Active"}</CBadge>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-medium-emphasis">Verified</td>
                    <td>
                      <CBadge color={selectedWorker.is_verified ? "success" : "danger"}>
                        {selectedWorker.is_verified ? "Yes" : "No"}
                      </CBadge>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-medium-emphasis">Productivity</td>
                    <td className="fw-semibold">{selectedWorker.productivity || 0}%</td>
                  </tr>
                  <tr>
                    <td className="text-medium-emphasis">Last Active</td>
                    <td className="fw-semibold">
                      {selectedWorker.last_active
                        ? new Date(selectedWorker.last_active).toLocaleDateString("en-IN")
                        : "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalOpen(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

    </div>
  );
};

export default ManagerWorkerList;
