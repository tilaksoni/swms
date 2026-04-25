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
  CFormInput,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilMoney,
  cilPeople,
  cilCheckCircle,
  cilClock,
} from "@coreui/icons";

const monthNames = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const ManagerSalary = () => {
  const [workers, setWorkers] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    worker_id: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    base_salary: "",
    present_days: "",
    total_days: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get("http://localhost:5000/api/workers")
      .then(res => setWorkers(res.data));

    axios.get("http://localhost:5000/api/salary")
      .then(res => setSalaryRecords(res.data));
  };

  // ── Handle Form Change ─────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Generate Salary ────────────────────────────────────────────
  const generateSalary = async (e) => {
    e.preventDefault();
    if (!formData.worker_id) {
      toast.warning("Please select a worker!");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/salary", formData);
      toast.success("Salary generated successfully!");
      fetchData();
      setFormData({
        worker_id: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        base_salary: "",
        present_days: "",
        total_days: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate salary!");
    } finally {
      setLoading(false);
    }
  };

  // ── Mark as Paid ───────────────────────────────────────────────
  const markAsPaid = async (id) => {
    if (!window.confirm("Mark this salary as Paid?")) return;
    try {
      await axios.put(`http://localhost:5000/api/salary/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update salary status!");
    }
  };

  // ── Derived Stats ──────────────────────────────────────────────
  const totalRecords   = salaryRecords.length;
  const paidRecords    = salaryRecords.filter(s => s.status === "Paid").length;
  const pendingRecords = salaryRecords.filter(s => s.status === "Pending").length;
  const totalPaid      = salaryRecords
    .filter(s => s.status === "Paid")
    .reduce((sum, s) => sum + parseFloat(s.final_salary), 0);

  // ── Helpers ────────────────────────────────────────────────────
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const calcFinalSalary = () => {
    if (!formData.base_salary || !formData.present_days || !formData.total_days) return "—";
    const final = (formData.base_salary / formData.total_days) * formData.present_days;
    return formatCurrency(final);
  };

  return (
    <div className="p-4">

      {/* ── Page Header ── */}
      <div className="mb-4">
        <h4 className="fw-bold mb-0">Salary Management</h4>
        <small className="text-medium-emphasis">
          Generate and manage worker salaries
        </small>
      </div>

      {/* ── Stat Cards ── */}
      <CRow className="g-3 mb-4">
        {[
          { title: "Total Records",  value: totalRecords,              icon: cilPeople,       color: "primary" },
          { title: "Paid",           value: paidRecords,               icon: cilCheckCircle,  color: "success" },
          { title: "Pending",        value: pendingRecords,            icon: cilClock,        color: "warning" },
          { title: "Total Paid Out", value: formatCurrency(totalPaid), icon: cilMoney,        color: "info",   small: true },
        ].map((stat, i) => (
          <CCol xs={6} md={3} key={i}>
            <CCard className={`border-top border-top-${stat.color} border-top-3 shadow-sm`}>
              <CCardBody className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-medium-emphasis fw-semibold text-uppercase mb-1"
                    style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                    {stat.title}
                  </div>
                  <div className={`fw-bold ${stat.small ? "fs-5" : "fs-2"}`}>{stat.value}</div>
                </div>
                <CIcon icon={stat.icon} size="3xl" className={`text-${stat.color} opacity-25`} />
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <CRow className="g-4">

        {/* ── Generate Salary Form ── */}
        <CCol md={4}>
          <CCard className="shadow-sm">
            <CCardHeader className="fw-semibold">Generate Salary</CCardHeader>
            <CCardBody>
              <form onSubmit={generateSalary}>

                {/* Worker */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Select Worker</label>
                  <CFormSelect
                    name="worker_id"
                    value={formData.worker_id}
                    onChange={handleChange}
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

                {/* Month */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Month</label>
                  <CFormSelect
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                  >
                    {monthNames.map((month, index) => (
                      <option key={index + 1} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </CFormSelect>
                </div>

                {/* Year */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Year</label>
                  <CFormInput
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Base Salary */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Base Salary (₹)</label>
                  <CFormInput
                    type="number"
                    name="base_salary"
                    placeholder="e.g. 25000"
                    value={formData.base_salary}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Present Days */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Present Days</label>
                  <CFormInput
                    type="number"
                    name="present_days"
                    placeholder="e.g. 24"
                    value={formData.present_days}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Total Days */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Total Working Days</label>
                  <CFormInput
                    type="number"
                    name="total_days"
                    placeholder="e.g. 26"
                    value={formData.total_days}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Final Salary Preview */}
                <div className="mb-4 p-3 rounded"
                  style={{ background: "rgba(25,135,84,0.08)", border: "1px solid rgba(25,135,84,0.2)" }}>
                  <div className="small text-medium-emphasis">Final Salary Preview</div>
                  <div className="fs-5 fw-bold text-success">{calcFinalSalary()}</div>
                  <small className="text-medium-emphasis">
                    = (Base ÷ Total Days) × Present Days
                  </small>
                </div>

                <CButton
                  type="submit"
                  color="success"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate Salary"}
                </CButton>

              </form>
            </CCardBody>
          </CCard>
        </CCol>

        {/* ── Salary Records Table ── */}
        <CCol md={8}>
          <CCard className="shadow-sm">
            <CCardHeader className="d-flex align-items-center justify-content-between">
              <span className="fw-semibold">Salary Records</span>
              <CBadge color="primary" shape="rounded-pill">{totalRecords} records</CBadge>
            </CCardHeader>

            <CCardBody className="p-0">
              {salaryRecords.length === 0 ? (
                <div className="text-center py-5 text-medium-emphasis">
                  No salary records found.
                </div>
              ) : (
                <div className="table-responsive">
                  <CTable hover align="middle" className="mb-0">
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>Worker</CTableHeaderCell>
                        <CTableHeaderCell>Month</CTableHeaderCell>
                        <CTableHeaderCell>Base Salary</CTableHeaderCell>
                        <CTableHeaderCell>Attendance</CTableHeaderCell>
                        <CTableHeaderCell>Final Salary</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Action</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>

                    <CTableBody>
                      {salaryRecords.map((record, index) => (
                        <CTableRow key={record.id}>

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

                          {/* Month */}
                          <CTableDataCell className="small">
                            {monthNames[record.month - 1]} {record.year}
                          </CTableDataCell>

                          {/* Base Salary */}
                          <CTableDataCell className="small">
                            {formatCurrency(record.base_salary)}
                          </CTableDataCell>

                          {/* Attendance */}
                          <CTableDataCell className="small">
                            {record.present_days}/{record.total_days} days
                          </CTableDataCell>

                          {/* Final Salary */}
                          <CTableDataCell>
                            <span className="fw-bold text-success">
                              {formatCurrency(record.final_salary)}
                            </span>
                          </CTableDataCell>

                          {/* Status */}
                          <CTableDataCell>
                            <CBadge
                              color={record.status === "Paid" ? "success" : "warning"}
                              shape="rounded-pill"
                            >
                              {record.status}
                            </CBadge>
                          </CTableDataCell>

                          {/* Action */}
                          <CTableDataCell>
                            {record.status === "Pending" ? (
                              <CButton
                                color="success"
                                size="sm"
                                onClick={() => markAsPaid(record.id)}
                              >
                                Mark Paid
                              </CButton>
                            ) : (
                              <span className="text-success small fw-semibold">✓ Paid</span>
                            )}
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

export default ManagerSalary;
