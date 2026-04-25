import { useEffect, useState } from "react";
import axios from "axios";

import React from 'react'

import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormInput,
  CFormTextarea
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilPeople } from '@coreui/icons'

import MainChart from './MainChart'

const Dashboard = () => {

  const [accessDenied, setAccessDenied] = useState(false);

  const [taskData, setTaskData] = useState({
    worker_id: "",
    assigned_by: "",
    title: "",
    description: "",
    deadline: ""
  });

  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  // ✅ Authentication Check
  useEffect(() => {

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
      window.location.href = "#/login";
      return;
    }

   

  }, []);

  // ✅ Fetch Data
  useEffect(() => {

    axios.get("http://localhost:5000/api/workers")
      .then(res => setWorkers(res.data))
      .catch(console.log);

    axios.get("http://localhost:5000/api/attendance")
      .then(res => setAttendance(res.data))
      .catch(console.log);

    axios.get("http://localhost:5000/api/tasks")
      .then(res => setTasks(res.data))
      .catch(console.log);

  }, []);

  if (accessDenied) {
    return <h2 className="text-center mt-5">Access Denied</h2>;
  }

  // ✅ Task handlers
  const handleTaskChange = (e) => {
    setTaskData({
      ...taskData,
      [e.target.name]: e.target.value
    });
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();

    try {

      await axios.post(
        "http://localhost:5000/api/tasks",
        taskData
      );

      alert("Task Assigned Successfully");

      const res = await axios.get("http://localhost:5000/api/tasks");
      setTasks(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>

      <CRow className="mb-4">

        <CCol sm={3}>
          <CCard>
            <CCardBody>
              <div className="fs-4 fw-semibold">{workers.length}</div>
              <div>Total Workers</div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={3}>
          <CCard>
            <CCardBody>
              <div className="fs-4 fw-semibold">
                {attendance.filter(a => a.status === "Present").length}
              </div>
              <div>Present Today</div>
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>

      <CCard className="mb-4">
        <CCardHeader>Assign Task</CCardHeader>

        <CCardBody>

          <form onSubmit={handleTaskSubmit}>

            <select
              name="worker_id"
              onChange={handleTaskChange}
              className="form-control mb-2"
              required
            >
              <option value="">Select Worker</option>
              {workers.map(worker => (
                <option key={worker.id} value={worker.id}>
                  {worker.name}
                </option>
              ))}
            </select>

            <CFormInput
              name="assigned_by"
              placeholder="Assigned By"
              onChange={handleTaskChange}
              className="mb-2"
              required
            />

            <CFormInput
              name="title"
              placeholder="Task Title"
              onChange={handleTaskChange}
              className="mb-2"
              required
            />

            <CFormTextarea
              name="description"
              placeholder="Task Description"
              onChange={handleTaskChange}
              className="mb-2"
            />

            <CFormInput
              type="date"
              name="deadline"
              onChange={handleTaskChange}
              className="mb-2"
            />

            <CButton type="submit" color="primary">
              Assign Task
            </CButton>

          </form>

        </CCardBody>
      </CCard>

      <CCard className="mb-4">
        <CCardHeader>Workers List</CCardHeader>

        <CCardBody>

          <CTable hover responsive>

            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>User</CTableHeaderCell>
                <CTableHeaderCell>Role</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>

              {workers.map(worker => (
                <CTableRow key={worker.id}>
                  <CTableDataCell>{worker.name}</CTableDataCell>
                  <CTableDataCell>{worker.role}</CTableDataCell>
                  <CTableDataCell>{worker.status}</CTableDataCell>
                </CTableRow>
              ))}

            </CTableBody>

          </CTable>

        </CCardBody>
      </CCard>

    </>
  );
};

export default Dashboard;