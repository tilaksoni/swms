import React, { useState, useEffect } from "react";
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
  CProgress,
  CProgressBar,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilCalendar,
  cilCheckCircle,
  cilXCircle,
  cilClock,
  cilChartPie,
} from "@coreui/icons";

const WorkerAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const workerId = parseInt(localStorage.getItem("workerId"));

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/attendance/worker/${workerId}`)
      .then((res) => {
        setAttendance(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ── Derived Stats ──────────────────────────────────────────────
  const totalDays = attendance.length;
  const presentDays = attendance.filter((a) => a.status === "Present").length;
  const absentDays = attendance.filter((a) => a.status === "Absent").length;
  const attendancePercentage =
    totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // ── Helpers ────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "—";
    return new Date(timeStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const percentageColor = () => {
    if (attendancePercentage >= 85) return "success";
    if (attendancePercentage >= 60) return "warning";
    return "danger";
  };

  // ── Stat Card Component ────────────────────────────────────────
  const StatCard = ({ title, value, icon, color, suffix }) => (
    <CCard className={`border-top border-top-${color} border-top-3 shadow-sm`}>
      <CCardBody className="d-flex align-items-center justify-content-between">
        <div>
          <div
            className="text-medium-emphasis fw-semibold text-uppercase mb-1"
            style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}
          >
            {title}
          </div>
          <div className="fs-2 fw-bold">
            {value}
            {suffix && (
              <span className="fs-6 text-medium-emphasis ms-1">{suffix}</span>
            )}
          </div>
        </div>
        <CIcon
          icon={icon}
          size="3xl"
          className={`text-${color} opacity-25`}
        />
      </CCardBody>
    </CCard>
  );

  return (
    <div className="p-4">

      {/* ── Page Header ── */}
      <div className="mb-4">
        <h4 className="fw-bold mb-0">My Attendance</h4>
        <small className="text-medium-emphasis">
          Track your attendance history and performance
        </small>
      </div>

      {/* ── Stat Cards ── */}
      <CRow className="g-3 mb-4">
        <CCol xs={6} md={3}>
          <StatCard
            title="Total Days"
            value={totalDays}
            icon={cilCalendar}
            color="primary"
          />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard
            title="Present"
            value={presentDays}
            icon={cilCheckCircle}
            color="success"
          />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard
            title="Absent"
            value={absentDays}
            icon={cilXCircle}
            color="danger"
          />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard
            title="Attendance Rate"
            value={attendancePercentage}
            icon={cilChartPie}
            color={percentageColor()}
            suffix="%"
          />
        </CCol>
      </CRow>

      {/* ── Attendance Rate Progress ── */}
      <CCard className="shadow-sm mb-4">
        <CCardBody>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center gap-2">
              <CIcon icon={cilChartPie} className={`text-${percentageColor()}`} />
              <span className="fw-semibold">Overall Attendance Rate</span>
            </div>
            <CBadge
              color={percentageColor()}
              shape="rounded-pill"
              className="px-3"
            >
              {attendancePercentage >= 85
                ? "Excellent"
                : attendancePercentage >= 60
                ? "Average"
                : "Poor"}
            </CBadge>
          </div>

          <CProgress
            style={{ height: "14px", borderRadius: "8px" }}
            className="mb-2"
          >
            <CProgressBar
              value={attendancePercentage}
              color={percentageColor()}
              style={{ borderRadius: "8px", transition: "width 0.8s ease" }}
            />
          </CProgress>

          <div className="d-flex justify-content-between">
            <small className="text-medium-emphasis">
              {presentDays} present out of {totalDays} days
            </small>
            <small className={`text-${percentageColor()} fw-semibold`}>
              {attendancePercentage}%
            </small>
          </div>
        </CCardBody>
      </CCard>

      {/* ── Attendance Table ── */}
      <CCard className="shadow-sm">
        <CCardHeader className="d-flex align-items-center justify-content-between">
          <span className="fw-semibold">Attendance History</span>
          <CBadge color="primary" shape="rounded-pill">
            {totalDays} records
          </CBadge>
        </CCardHeader>

        <CCardBody className="p-0">
          {loading ? (
            <div className="text-center py-5 text-medium-emphasis">
              Loading attendance...
            </div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-5 text-medium-emphasis">
              No attendance records found.
            </div>
          ) : (
            <div className="table-responsive">
              <CTable hover align="middle" className="mb-0">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell style={{ width: "60px" }}>#</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Check-in Time</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Remarks</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {attendance.map((record, index) => (
                    <CTableRow
                      key={record.id}
                      className={
                        record.status === "Absent" ? "table-danger" : ""
                      }
                    >
                      {/* # */}
                      <CTableDataCell className="text-medium-emphasis small">
                        {index + 1}
                      </CTableDataCell>

                      {/* Date */}
                      <CTableDataCell>
                        <div className="d-flex align-items-center gap-2">
                          <CIcon
                            icon={cilCalendar}
                            className="text-medium-emphasis"
                            size="sm"
                          />
                          <span className="fw-semibold">
                            {formatDate(record.date)}
                          </span>
                        </div>
                      </CTableDataCell>

                      {/* Check-in Time */}
                      <CTableDataCell>
                        <div className="d-flex align-items-center gap-2">
                          <CIcon
                            icon={cilClock}
                            className="text-medium-emphasis"
                            size="sm"
                          />
                          <span>{formatTime(record.check_in)}</span>
                        </div>
                      </CTableDataCell>

                      {/* Status */}
                      <CTableDataCell>
                        <CBadge
                          color={
                            record.status === "Present" ? "success" : "danger"
                          }
                          shape="rounded-pill"
                          className="px-3 py-2"
                        >
                          {record.status === "Present" ? "✓ " : "✗ "}
                          {record.status}
                        </CBadge>
                      </CTableDataCell>

                      

                      {/* Remarks */}
                      <CTableDataCell className="text-medium-emphasis small">
                        {record.status === "Present"
                          ? record.check_in
                            ? "On time"
                            : "No check-in recorded"
                          : "Not present"}
                      </CTableDataCell>

                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          )}
        </CCardBody>
      </CCard>

    </div>
  );
};

export default WorkerAttendance;
