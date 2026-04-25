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
  cilPeople,
  cilTask,
  cilCheckCircle,
  cilClock,
  cilSync,
  cilCalendar,
  cilChartPie,
} from "@coreui/icons";

const ManagerDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/workers")
      .then(res => setWorkers(res.data));

    axios.get("http://localhost:5000/api/attendance/today")
  .then(res => setAttendance(res.data));

    axios.get("http://localhost:5000/api/tasks")
      .then(res => setTasks(res.data));
  }, []);

  // ── Derived Stats ──────────────────────────────────────────────
  const totalWorkers    = workers.length;
  const presentToday    = attendance.filter(a => a.status === "Present").length;
  const totalTasks      = tasks.length;
  const completedTasks  = tasks.filter(t => t.status === "Completed").length;
  const pendingTasks    = tasks.filter(t => t.status === "Pending").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
  const completionRate  = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const attendanceRate  = totalWorkers > 0 ? Math.round((presentToday / totalWorkers) * 100) : 0;

  // ── Stat Card ──────────────────────────────────────────────────
  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <CCard className={`border-top border-top-${color} border-top-3 shadow-sm`}>
      <CCardBody className="d-flex align-items-center justify-content-between">
        <div>
          <div
            className="text-medium-emphasis fw-semibold text-uppercase mb-1"
            style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}
          >
            {title}
          </div>
          <div className="fs-2 fw-bold">{value}</div>
          {subtitle && (
            <small className="text-medium-emphasis">{subtitle}</small>
          )}
        </div>
        <CIcon icon={icon} size="3xl" className={`text-${color} opacity-25`} />
      </CCardBody>
    </CCard>
  );

  return (
    <div className="p-4">

      {/* ── Page Header ── */}
      <div className="mb-4">
        <h4 className="fw-bold mb-0">Manager Dashboard</h4>
        <small className="text-medium-emphasis">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
          })}
        </small>
      </div>

      {/* ── Stat Cards Row 1 ── */}
      <CRow className="g-3 mb-4">
        <CCol xs={6} md={3}>
          <StatCard
            title="Total Workers"
            value={totalWorkers}
            icon={cilPeople}
            color="primary"
          />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard
            title="Present Today"
            value={presentToday}
            icon={cilCalendar}
            color="success"
            subtitle={`${attendanceRate}% attendance`}
          />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard
            title="Total Tasks"
            value={totalTasks}
            icon={cilTask}
            color="info"
          />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard
            title="Completed"
            value={completedTasks}
            icon={cilCheckCircle}
            color="success"
            subtitle={`${completionRate}% rate`}
          />
        </CCol>
      </CRow>

      {/* ── Stat Cards Row 2 ── */}
      <CRow className="g-3 mb-4">
        <CCol xs={6} md={3}>
          <StatCard
            title="In Progress"
            value={inProgressTasks}
            icon={cilSync}
            color="warning"
          />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard
            title="Pending"
            value={pendingTasks}
            icon={cilClock}
            color="secondary"
          />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard
            title="Absent Today"
            value={totalWorkers - presentToday}
            icon={cilPeople}
            color="danger"
          />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard
            title="Completion Rate"
            value={`${completionRate}%`}
            icon={cilChartPie}
            color="info"
          />
        </CCol>
      </CRow>

      {/* ── Progress Overview ── */}
      <CRow className="g-3 mb-4">

        {/* Task Progress */}
        <CCol md={6}>
          <CCard className="shadow-sm h-100">
            <CCardBody>
              <h6 className="fw-bold text-uppercase text-medium-emphasis mb-3"
                style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                Task Overview
              </h6>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="small">Completed</span>
                  <span className="small fw-semibold text-success">{completedTasks}</span>
                </div>
                <CProgress style={{ height: "8px", borderRadius: "8px" }}>
                  <CProgressBar value={completionRate} color="success" style={{ borderRadius: "8px" }} />
                </CProgress>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="small">In Progress</span>
                  <span className="small fw-semibold text-warning">{inProgressTasks}</span>
                </div>
                <CProgress style={{ height: "8px", borderRadius: "8px" }}>
                  <CProgressBar
                    value={totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0}
                    color="warning"
                    style={{ borderRadius: "8px" }}
                  />
                </CProgress>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="small">Pending</span>
                  <span className="small fw-semibold text-secondary">{pendingTasks}</span>
                </div>
                <CProgress style={{ height: "8px", borderRadius: "8px" }}>
                  <CProgressBar
                    value={totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0}
                    color="secondary"
                    style={{ borderRadius: "8px" }}
                  />
                </CProgress>
              </div>

            </CCardBody>
          </CCard>
        </CCol>

        {/* Attendance Progress */}
        <CCol md={6}>
          <CCard className="shadow-sm h-100">
            <CCardBody>
              <h6 className="fw-bold text-uppercase text-medium-emphasis mb-3"
                style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                Attendance Overview
              </h6>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="small">Present</span>
                  <span className="small fw-semibold text-success">{presentToday}</span>
                </div>
                <CProgress style={{ height: "8px", borderRadius: "8px" }}>
                  <CProgressBar value={attendanceRate} color="success" style={{ borderRadius: "8px" }} />
                </CProgress>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="small">Absent</span>
                  <span className="small fw-semibold text-danger">{totalWorkers - presentToday}</span>
                </div>
                <CProgress style={{ height: "8px", borderRadius: "8px" }}>
                  <CProgressBar
                    value={totalWorkers > 0 ? Math.round(((totalWorkers - presentToday) / totalWorkers) * 100) : 0}
                    color="danger"
                    style={{ borderRadius: "8px" }}
                  />
                </CProgress>
              </div>

              <div className="mt-4 text-center">
                <div className="fs-1 fw-bold" style={{ color: attendanceRate >= 75 ? "#198754" : "#dc3545" }}>
                  {attendanceRate}%
                </div>
                <small className="text-medium-emphasis">Overall Attendance Rate</small>
              </div>

            </CCardBody>
          </CCard>
        </CCol>

      </CRow>

      {/* ── Recent Tasks Table ── */}
      <CCard className="shadow-sm mb-4">
        <CCardHeader className="d-flex align-items-center justify-content-between">
          <span className="fw-semibold">Recent Tasks</span>
          <CBadge color="primary" shape="rounded-pill">{totalTasks} total</CBadge>
        </CCardHeader>
        <CCardBody className="p-0">
          <div className="table-responsive">
            <CTable hover align="middle" className="mb-0">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Title</CTableHeaderCell>
                  <CTableHeaderCell>Assigned To</CTableHeaderCell>
                  <CTableHeaderCell>Deadline</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {tasks.slice(0, 5).map((task, index) => (
                  <CTableRow key={task.id}>
                    <CTableDataCell className="text-medium-emphasis small">{index + 1}</CTableDataCell>
                    <CTableDataCell className="fw-semibold">{task.title}</CTableDataCell>
                    <CTableDataCell>{task.name || `Worker #${task.worker_id}`}</CTableDataCell>
                    <CTableDataCell className="small">
                      {task.deadline
                        ? new Date(task.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge
                        color={
                          task.status === "Completed" ? "success" :
                          task.status === "In Progress" ? "warning" : "secondary"
                        }
                        shape="rounded-pill"
                      >
                        {task.status}
                      </CBadge>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>

      {/* ── Workers Table ── */}
      <CCard className="shadow-sm">
        <CCardHeader className="d-flex align-items-center justify-content-between">
          <span className="fw-semibold">Workers Overview</span>
          <CBadge color="primary" shape="rounded-pill">{totalWorkers} total</CBadge>
        </CCardHeader>
        <CCardBody className="p-0">
          <div className="table-responsive">
            <CTable hover align="middle" className="mb-0">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Role</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {workers.map((worker, index) => (
                  <CTableRow key={worker.id}>
                    <CTableDataCell className="text-medium-emphasis small">{index + 1}</CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{
                          width: "32px", height: "32px", borderRadius: "50%",
                          background: "linear-gradient(135deg, #0d6efd, #0dcaf0)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "white", fontSize: "0.8rem", fontWeight: "bold", flexShrink: 0
                        }}>
                          {worker.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="fw-semibold">{worker.name}</span>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-medium-emphasis small">{worker.email}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="primary" shape="rounded-pill">{worker.role}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={worker.status === "Active" ? "success" : "secondary"} shape="rounded-pill">
                        {worker.status || "Active"}
                      </CBadge>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>

    </div>
  );
};

export default ManagerDashboard;
