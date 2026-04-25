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
  CFormTextarea,
  CFormSelect,
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
  cilTrash,
  cilPencil,
} from "@coreui/icons";

const ManagerTasks = () => {
  const [workerlist, setWorkerlist] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    worker_id: "",
    assigned_by: "",
    title: "",
    description: "",
    deadline: "",
  });

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    axios.get("http://localhost:5000/api/workers")
      .then((res) => setWorkerlist(res.data));

    axios.get("http://localhost:5000/api/tasks")
      .then((res) => setTasks(res.data));
  }, []);

  // ── Fetch Tasks ────────────────────────────────────────────────
  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:5000/api/tasks");
    setTasks(res.data);
  };

  // ── Handle Form Change ─────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Submit New Task ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.worker_id) {
    toast.warning("Please select a worker!");
    return;
  }
  if (!formData.title) {
    toast.warning("Please enter task title!");
    return;
  }
  if (!formData.assigned_by) {
    toast.warning("Please enter assigned by!");
    return;
  }
  if (!formData.deadline) {
    toast.warning("Please select a deadline!");
    return;
  }
  
    try {
      await axios.post("http://localhost:5000/api/tasks", formData);
      toast.success("Task Assigned Successfully!");
      fetchTasks();
      setFormData({
        worker_id: "",
        assigned_by: "",
        title: "",
        description: "",
        deadline: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign task!");
    }
  };

  // ── Delete Task ────────────────────────────────────────────────
  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Open Edit Modal ────────────────────────────────────────────
  const openEdit = (task) => {
    setEditData({
      id: task.id,
      title: task.title,
      description: task.description || "",
      deadline: task.deadline || "",
      assigned_by: task.assigned_by || "",
    });
    setEditModal(true);
  };

  // ── Save Edit ──────────────────────────────────────────────────
  const saveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${editData.id}`, editData);
      setEditModal(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task!");
    }
  };

  // ── Derived Stats ──────────────────────────────────────────────
  const totalTasks      = tasks.length;
  const completedTasks  = tasks.filter(t => t.status === "Completed").length;
  const pendingTasks    = tasks.filter(t => t.status === "Pending").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;

  const statusColor = (status) => {
    if (status === "Completed")  return "success";
    if (status === "In Progress") return "warning";
    return "secondary";
  };

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
        <h4 className="fw-bold mb-0">Task Management</h4>
        <small className="text-medium-emphasis">
          Assign and manage tasks for workers
        </small>
      </div>

      {/* ── Stat Cards ── */}
      <CRow className="g-3 mb-4">
        {[
          { title: "Total Tasks",   value: totalTasks,      icon: cilTask,         color: "primary"   },
          { title: "Completed",     value: completedTasks,  icon: cilCheckCircle,  color: "success"   },
          { title: "In Progress",   value: inProgressTasks, icon: cilSync,         color: "warning"   },
          { title: "Pending",       value: pendingTasks,    icon: cilClock,        color: "secondary" },
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

        {/* ── Assign Task Form ── */}
        <CCol md={4}>
          <CCard className="shadow-sm">
            <CCardHeader className="fw-semibold">Assign New Task</CCardHeader>
            <CCardBody>
              <form onSubmit={handleSubmit}>

                {/* Worker Select */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Select Worker</label>
                  <CFormSelect
                    name="worker_id"
                    value={formData.worker_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose worker...</option>
                    {workerlist.map(worker => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name}
                      </option>
                    ))}
                  </CFormSelect>
                </div>

                {/* Assigned By */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Assigned By</label>
                  <CFormInput
                    name="assigned_by"
                    placeholder="Your name"
                    value={formData.assigned_by}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Title */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Task Title</label>
                  <CFormInput
                    name="title"
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Description</label>
                  <CFormTextarea
                    name="description"
                    placeholder="Task description..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                {/* Deadline */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold">Deadline</label>
                  <CFormInput
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                  />
                </div>

                <CButton type="submit" color="primary" className="w-100">
                  Assign Task
                </CButton>

              </form>
            </CCardBody>
          </CCard>
        </CCol>

        {/* ── Tasks Table ── */}
        <CCol md={8}>
          <CCard className="shadow-sm">
            <CCardHeader className="d-flex align-items-center justify-content-between">
              <span className="fw-semibold">All Tasks</span>
              <CBadge color="primary" shape="rounded-pill">{totalTasks} total</CBadge>
            </CCardHeader>

            <CCardBody className="p-0">
              {tasks.length === 0 ? (
                <div className="text-center py-5 text-medium-emphasis">
                  No tasks found.
                </div>
              ) : (
                <div className="table-responsive">
                  <CTable hover align="middle" className="mb-0">
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>Title</CTableHeaderCell>
                        <CTableHeaderCell>Worker</CTableHeaderCell>
                        <CTableHeaderCell>Deadline</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>

                    <CTableBody>
                      {tasks.map((task, index) => (
                        <CTableRow key={task.id}>

                          <CTableDataCell className="text-medium-emphasis small">
                            {index + 1}
                          </CTableDataCell>

                          {/* Title */}
                          <CTableDataCell>
                            <div className="fw-semibold">{task.title}</div>
                            {task.description && (
                              <small className="text-medium-emphasis"
                                style={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden"
                                }}>
                                {task.description}
                              </small>
                            )}
                          </CTableDataCell>

                          {/* Worker */}
                          <CTableDataCell>
                            <span className="small">
                              {task.name || `Worker #${task.worker_id}`}
                            </span>
                          </CTableDataCell>

                          {/* Deadline */}
                          <CTableDataCell className="small">
                            {formatDate(task.deadline)}
                          </CTableDataCell>

                          {/* Status */}
                          <CTableDataCell>
                            <CBadge
                              color={statusColor(task.status)}
                              shape="rounded-pill"
                            >
                              {task.status}
                            </CBadge>
                          </CTableDataCell>

                          {/* Actions */}
                          <CTableDataCell>
                            <div className="d-flex gap-2">
                              <CButton
                                color="warning"
                                variant="outline"
                                size="sm"
                                onClick={() => openEdit(task)}
                              >
                                <CIcon icon={cilPencil} size="sm" />
                              </CButton>
                              <CButton
                                color="danger"
                                variant="outline"
                                size="sm"
                                onClick={() => deleteTask(task.id)}
                              >
                                <CIcon icon={cilTrash} size="sm" />
                              </CButton>
                            </div>
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

      {/* ── Edit Task Modal ── */}
      <CModal visible={editModal} onClose={() => setEditModal(false)}>
        <CModalHeader>
          <CModalTitle>Edit Task</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Title</label>
            <CFormInput
              value={editData.title || ""}
              onChange={e => setEditData({ ...editData, title: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Description</label>
            <CFormTextarea
              value={editData.description || ""}
              onChange={e => setEditData({ ...editData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Deadline</label>
            <CFormInput
              type="date"
              value={editData.deadline || ""}
              onChange={e => setEditData({ ...editData, deadline: e.target.value })}
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={saveEdit}>
            Save Changes
          </CButton>
        </CModalFooter>
      </CModal>

    </div>
  );
};

export default ManagerTasks;
