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
  CFormSelect,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilCalendar,
  cilCheckCircle,
  cilXCircle,
  cilPeople,
  cilTrash,
} from "@coreui/icons";

const ManagerAttendance = () => {
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Present");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get("http://localhost:5000/api/workers")
      .then(res => setWorkers(res.data));

    axios.get("http://localhost:5000/api/attendance")
      .then(res => setAttendance(res.data));
  };

  // ── Mark Attendance ────────────────────────────────────────────
  const markAttendance = async (e) => {
    e.preventDefault();
    if (!selectedWorker) {
      toast.warning("Please select a worker!");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/attendance", {
        worker_id: selectedWorker,
        status: selectedStatus,
      });
      toast.success("Attendance marked successfully!");
      fetchData();
      setSelectedWorker("");
      setSelectedStatus("Present");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark attendance!");
    } finally {
      setLoading(false);
    }
  };

  // ── Delete Attendance ──────────────────────────────────────────
  // ✅ Fix — change parameter name and URL
const deleteAttendance = async (id) => {
  if (!window.confirm("Delete this attendance record?")) return;
  try {
    await axios.delete(`http://localhost:5000/api/attendance/record/${id}`);
    fetchData();
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete attendance!");
  }
};

  // ── Derived Stats ──────────────────────────────────────────────
  const totalRecords  = attendance.length;
  const presentCount  = attendance.filter(a => a.status === "Present").length;
  const absentCount   = attendance.filter(a => a.status === "Absent").length;
  const todayRecords  = attendance.filter(a => {
    const today = new Date().toISOString().split("T")[0];
    return a.date === today || (a.date && a.date.startsWith(today));
  }).length;

  // ── Helpers ────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    });
  };

  return (
    <div className="p-4">

      {/* ── Page Header ── */}
      <div className="mb-4">
        <h4 className="fw-bold mb-0">Attendance Management</h4>
        <small className="text-medium-emphasis">
          Mark and manage worker attendance
        </small>
      </div>

      {/* ── Stat Cards ── */}
      <CRow className="g-3 mb-4">
        {[
          { title: "Total Records", value: totalRecords,  icon: cilCalendar,     color: "primary"  },
          { title: "Present",       value: presentCount,  icon: cilCheckCircle,  color: "success"  },
          { title: "Absent",        value: absentCount,   icon: cilXCircle,      color: "danger"   },
          { title: "Today",         value: todayRecords,  icon: cilPeople,       color: "info"     },
        ].map((stat, i) => (
          <CCol xs={6} md={3} key={i}>
            <CCard className={`border-top border-top-${stat.color} border-top-3 shadow-sm`}>
              <CCardBody className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-medium-emphasis fw-semibold text-uppercase mb-1"
                    style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                    {stat.title}
                  </div>
                  <div className="fs-2 fw-bold">{stat.value}</div>
                </div>
                <CIcon icon={stat.icon} size="3xl" className={`text-${stat.color} opacity-25`} />
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <CRow className="g-4">

        {/* ── Mark Attendance Form ── */}
        <CCol md={4}>
          <CCard className="shadow-sm">
            <CCardHeader className="fw-semibold">Mark Attendance</CCardHeader>
            <CCardBody>
              <form onSubmit={markAttendance}>

                {/* Today's Date */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Date</label>
                  <div className="p-2 rounded"
                    style={{ background: "rgba(13,110,253,0.05)", border: "1px solid rgba(13,110,253,0.2)" }}>
                    <CIcon icon={cilCalendar} className="me-2 text-primary" size="sm" />
                    <span className="small fw-semibold">
                      {new Date().toLocaleDateString("en-IN", {
                        weekday: "long", day: "numeric", month: "long", year: "numeric"
                      })}
                    </span>
                  </div>
                </div>

                {/* Worker Select */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Select Worker</label>
                  <CFormSelect
                    value={selectedWorker}
                    onChange={e => setSelectedWorker(e.target.value)}
                    required
                  >
                    <option value="">Choose worker...</option>
                    {workers.map(worker => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name}
                      </option>
                    ))}
                  </CFormSelect>
                </div>

                {/* Status Select */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold">Status</label>
                  <CFormSelect
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </CFormSelect>
                </div>

                <CButton
                  type="submit"
                  color={selectedStatus === "Present" ? "success" : "danger"}
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? "Marking..." : `Mark ${selectedStatus}`}
                </CButton>

              </form>
            </CCardBody>
          </CCard>
        </CCol>

        {/* ── Attendance Table ── */}
        <CCol md={8}>
          <CCard className="shadow-sm">
            <CCardHeader className="d-flex align-items-center justify-content-between">
              <span className="fw-semibold">Attendance Records</span>
              <CBadge color="primary" shape="rounded-pill">{totalRecords} records</CBadge>
            </CCardHeader>

            <CCardBody className="p-0">
              {attendance.length === 0 ? (
                <div className="text-center py-5 text-medium-emphasis">
                  No attendance records found.
                </div>
              ) : (
                <div className="table-responsive">
                  <CTable hover align="middle" className="mb-0">
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>Worker</CTableHeaderCell>
                        <CTableHeaderCell>Date</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Action</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>

                    <CTableBody>
                      {attendance.map((record, index) => (
                        <CTableRow
                          key={record.id}
                          className={record.status === "Absent" ? "table-danger" : ""}
                        >

                          <CTableDataCell className="text-medium-emphasis small">
                            {index + 1}
                          </CTableDataCell>

                          {/* Worker */}
                          <CTableDataCell>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{
                                width: "32px", height: "32px", borderRadius: "50%",
                                background: "linear-gradient(135deg, #0d6efd, #0dcaf0)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "white", fontSize: "0.8rem", fontWeight: "bold", flexShrink: 0
                              }}>
                                {record.name?.charAt(0).toUpperCase() || "?"}
                              </div>
                              <span className="fw-semibold">{record.name}</span>
                            </div>
                          </CTableDataCell>

                          {/* Date */}
                          <CTableDataCell className="small">
                            {formatDate(record.date)}
                          </CTableDataCell>

                          {/* Status */}
                          <CTableDataCell>
                            <CBadge
                              color={record.status === "Present" ? "success" : "danger"}
                              shape="rounded-pill"
                              className="px-3"
                            >
                              {record.status === "Present" ? "✓ " : "✗ "}
                              {record.status}
                            </CBadge>
                          </CTableDataCell>

                          {/* Action */}
                          <CTableDataCell>
                            <CButton
                              color="danger"
                              variant="outline"
                              size="sm"
                              onClick={() => deleteAttendance(record.id)}
                            >
                              <CIcon icon={cilTrash} size="sm" />
                            </CButton>
                          </CTableDataCell>

                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    </div>
  );
};

export default ManagerAttendance;
