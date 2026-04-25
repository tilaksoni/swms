import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CRow,
  CCol,
  CBadge,
  CProgress,
  CProgressBar,
  CTooltip,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,

} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilTask,
  cilCheckCircle,
  cilClock,
  cilSync,
  cilStar,
  cilWarning,
} from "@coreui/icons";

// ─── Helpers ────────────────────────────────────────────────────────────────

const statusColor = (status) => {
  switch (status) {
    case "Completed": return "success";
    case "In Progress": return "warning";
    case "Pending": return "secondary";
    default: return "light";
  }
};

const deadlineColor = (deadline) => {
  if (!deadline) return "secondary";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(deadline);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "danger";   // overdue
  if (diff <= 2) return "warning";  // due soon
  return "success";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const daysLeft = (deadline) => {
  if (!deadline) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(deadline);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Due today";
  return `${diff}d left`;
};

// ─── Productivity Score ──────────────────────────────────────────────────────
// Score = (completed / total) * 100, capped at 100
// Bonus: penalise overdue in-progress/pending tasks slightly
const calcProductivity = (tasks) => {
  if (!tasks.length) return 0;
  const completed = tasks.filter(t => t.status === "Completed").length;
  const overdue = tasks.filter(t => {
    if (!t.deadline) return false;
    if (t.status === "Completed") return false;
    return new Date(t.deadline) < new Date();
  }).length;
  const raw = (completed / tasks.length) * 100 - overdue * 5;
  return Math.max(0, Math.min(100, Math.round(raw)));
};

const productivityLabel = (score) => {
  if (score >= 85) return { label: "Excellent", color: "success" };
  if (score >= 60) return { label: "Good", color: "info" };
  if (score >= 35) return { label: "Average", color: "warning" };
  return { label: "Needs Work", color: "danger" };
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, color }) => (
  <CCard className={`border-top border-top-${color} border-top-3`}>
    <CCardBody className="d-flex align-items-center justify-content-between">
      <div>
        <div className="text-medium-emphasis small fw-semibold text-uppercase mb-1">{title}</div>
        <div className="fs-2 fw-bold">{value}</div>
      </div>
      <CIcon icon={icon} size="3xl" className={`text-${color} opacity-50`} />
    </CCardBody>
  </CCard>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const WorkerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workerName, setWorkerName] = useState("");

  const workerId = parseInt(localStorage.getItem("workerId"));

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const pendingTasks = tasks.filter(t => t.status === "Pending").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
  const productivity = calcProductivity(tasks);
  const { label: prodLabel, color: prodColor } = productivityLabel(productivity);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/tasks/worker/${workerId}`,
        { withCredentials: true }
      );
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!workerId) {
      console.error("Worker ID not found in localStorage");
      setLoading(false);
      return;
    }
    // Optionally fetch worker name from stored info
    setWorkerName(localStorage.getItem("workerName") || "Worker");
    fetchTasks();
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────
  const updateTaskStatus = async (taskId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/tasks/status/${taskId}`,
        { status },
        { withCredentials: true }
      );
      fetchTasks();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  // opens modal with clicked task
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  // closes modal
  const handleClose = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-3">

      {/* ── Header ── */}
      <div className="mb-4">
        <h4 className="mb-0 fw-bold">Welcome back, {workerName} 👋</h4>
        <small className="text-medium-emphasis">
          Here's your task overview for today — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </small>
      </div>

      {/* ── Stat Cards ── */}
      <CRow className="mb-4 g-3">
        <CCol xs={6} md={3}>
          <StatCard title="Total Tasks" value={totalTasks} icon={cilTask} color="primary" />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard title="Completed" value={completedTasks} icon={cilCheckCircle} color="success" />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard title="In Progress" value={inProgressTasks} icon={cilSync} color="warning" />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard title="Pending" value={pendingTasks} icon={cilClock} color="secondary" />
        </CCol>
      </CRow>

      {/* ── Productivity Score ── */}
      <CCard className="mb-4">
        <CCardBody>
          <CRow className="align-items-center">
            <CCol md={6}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <CIcon icon={cilStar} className="text-warning" />
                <span className="fw-semibold">Productivity Score</span>
                <CBadge color={prodColor} className="ms-1">{prodLabel}</CBadge>
              </div>
              <CProgress className="mb-1" style={{ height: "14px", borderRadius: "8px" }}>
                <CProgressBar
                  value={productivity}
                  color={prodColor}
                  style={{ borderRadius: "8px", transition: "width 0.8s ease" }}
                />
              </CProgress>
              <small className="text-medium-emphasis">
                {productivity}% — based on task completion
                {tasks.filter(t => !t.deadline ? false : t.status !== "Completed" && new Date(t.deadline) < new Date()).length > 0
                  ? " (overdue tasks reduce score)"
                  : ""}
              </small>
            </CCol>
            <CCol md={6} className="mt-3 mt-md-0">
              <div className="d-flex gap-4 justify-content-md-end">
                <div className="text-center">
                  <div className="fs-4 fw-bold text-success">{completedTasks}</div>
                  <small className="text-medium-emphasis">Done</small>
                </div>
                <div className="text-center">
                  <div className="fs-4 fw-bold text-warning">{inProgressTasks}</div>
                  <small className="text-medium-emphasis">Active</small>
                </div>
                <div className="text-center">
                  <div className="fs-4 fw-bold text-secondary">{pendingTasks}</div>
                  <small className="text-medium-emphasis">Queued</small>
                </div>
                <div className="text-center">
                  <div className="fs-4 fw-bold text-danger">
                    {tasks.filter(t => t.deadline && t.status !== "Completed" && new Date(t.deadline) < new Date()).length}
                  </div>
                  <small className="text-medium-emphasis">Overdue</small>
                </div>
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* ── Task Table ── */}
      <CCard>
        <CCardHeader className="d-flex align-items-center justify-content-between">
          <span className="fw-semibold">My Tasks</span>
          <CBadge color="primary" shape="rounded-pill">{totalTasks} total</CBadge>
        </CCardHeader>

        <CCardBody className="p-0">
          {loading ? (
            <div className="text-center py-5 text-medium-emphasis">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-5 text-medium-emphasis">No tasks assigned yet.</div>
          ) : (
            <div className="table-responsive">
              <CTable hover align="middle" className="mb-0">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell style={{ width: "60px" }}>#</CTableHeaderCell>
                    <CTableHeaderCell>Title</CTableHeaderCell>
                    <CTableHeaderCell>Description</CTableHeaderCell>
                    <CTableHeaderCell>Deadline</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {tasks.map((task) => {
                    const dLeft = daysLeft(task.deadline);
                    const dColor = deadlineColor(task.deadline);
                    const isOverdue = task.deadline && task.status !== "Completed" && new Date(task.deadline) < new Date();

                    return (
                      <CTableRow key={task.id} className={isOverdue ? "table-danger" : ""}>

                        {/* ID */}
                        <CTableDataCell className="text-medium-emphasis small">{task.id}</CTableDataCell>

                        {/* Title */}
                        <CTableDataCell>
                          <span
                            style={{ cursor: "pointer", color: "#0d6efd" }}
                            onClick={() => handleTaskClick(task)}
                          >
                            {task.title}
                          </span>
                        </CTableDataCell>

                        {/* Description */}
                        <CTableDataCell style={{ maxWidth: "220px" }}>
                          <CTooltip content={task.description || "No description"} placement="top">
                            <span
                              className="text-medium-emphasis small"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                cursor: "default",
                              }}
                            >
                              {task.description || <em>No description</em>}
                            </span>
                          </CTooltip>
                        </CTableDataCell>

                        {/* Deadline */}
                        <CTableDataCell>
                          <div className="d-flex flex-column">
                            <span className="small">{formatDate(task.deadline)}</span>
                            {dLeft && (
                              <CBadge color={dColor} className="mt-1" style={{ width: "fit-content" }}>
                                {isOverdue && <CIcon icon={cilWarning} size="sm" className="me-1" />}
                                {dLeft}
                              </CBadge>
                            )}
                          </div>
                        </CTableDataCell>

                        {/* Status */}
                        <CTableDataCell>
                          <CBadge color={statusColor(task.status)} shape="rounded-pill">
                            {task.status}
                          </CBadge>
                        </CTableDataCell>

                        {/* Action */}
                        <CTableDataCell>
                          {task.status === "Pending" && (
                            <CButton
                              color="primary"
                              variant="outline"
                              size="sm"
                              onClick={() => updateTaskStatus(task.id, "In Progress")}
                            >
                              Start
                            </CButton>
                          )}
                          {task.status === "In Progress" && (
                            <CButton
                              color="success"
                              size="sm"
                              onClick={() => updateTaskStatus(task.id, "Completed")}
                            >
                              Complete
                            </CButton>
                          )}
                          {task.status === "Completed" && (
                            <span className="text-success fw-semibold small">✔ Done</span>
                          )}
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


      <CModal visible={modalOpen} onClose={handleClose}>
        <CModalHeader>
          <CModalTitle>Task Details</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {selectedTask && (
            <>
              <p><strong>Title:</strong> {selectedTask.title}</p>
              <p><strong>Description:</strong> {selectedTask.description || "No description"}</p>
              <p><strong>Status:</strong> {selectedTask.status}</p>
              <p><strong>Deadline:</strong> {selectedTask.deadline || "No deadline"}</p>
            </>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={handleClose}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </div>

  );
};

export default WorkerDashboard;
