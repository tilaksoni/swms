import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
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
  CButton,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilMoney,
  cilCalendar,
  cilCheckCircle,
  cilClock,
  cilChart,
} from "@coreui/icons";

const monthNames = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const WorkerSalary = () => {
  const [salary, setSalary] = useState([]);
  const [loading, setLoading] = useState(true);
  const workerId = parseInt(localStorage.getItem("workerId"));

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/salary/worker/${workerId}`)
      .then((res) => {
        setSalary(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ── Derived Stats ──────────────────────────────────────────────
  const totalEarned = salary
    .filter((s) => s.status === "Paid")
    .reduce((sum, s) => sum + parseFloat(s.final_salary), 0);

  const pendingAmount = salary
    .filter((s) => s.status === "Pending")
    .reduce((sum, s) => sum + parseFloat(s.final_salary), 0);

  const latestSalary = salary[0];

  // ── Helpers ────────────────────────────────────────────────────
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const attendancePercentage = (present, total) => {
    if (!total) return 0;
    return Math.round((present / total) * 100);
  };

  // ── Stat Card ──────────────────────────────────────────────────
  const StatCard = ({ title, value, icon, color, small }) => (
    <CCard className={`border-top border-top-${color} border-top-3 shadow-sm`}>
      <CCardBody className="d-flex align-items-center justify-content-between">
        <div>
          <div
            className="text-medium-emphasis fw-semibold text-uppercase mb-1"
            style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}
          >
            {title}
          </div>
          <div className={`fw-bold ${small ? "fs-5" : "fs-2"}`}>{value}</div>
        </div>
        <CIcon
          icon={icon}
          size="3xl"
          className={`text-${color} opacity-25`}
        />
      </CCardBody>
    </CCard>
  );

 const downloadPayslip = (record) => {
  const doc = new jsPDF();
  const monthName = monthNames[record.month - 1];

  // ── Title ──
  doc.setFontSize(18);
  doc.setFont("courier", "bold");
  doc.text("PAYSLIP", 105, 20, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("courier", "normal");
  doc.text(`${monthName} ${record.year}`, 105, 28, { align: "center" });

  doc.line(10, 33, 200, 33);

  // ── Details ──
  doc.setFontSize(11);
  doc.setFont("courier", "normal");

  const lines = [
    `Worker ID    : ${record.worker_id}`,
    `Month        : ${monthName} ${record.year}`,
    ``,
    `Base Salary  : Rs. ${parseFloat(record.base_salary).toFixed(2)}`,
    `Present Days : ${record.present_days} / ${record.total_days} days`,
    `Deduction    : Rs. ${parseFloat(record.base_salary - record.final_salary).toFixed(2)}`,
    ``,
    `Final Salary : Rs. ${parseFloat(record.final_salary).toFixed(2)}`,
    `Status       : ${record.status}`,
  ];

  let y = 45;
  lines.forEach((line) => {
    doc.text(line, 10, y);
    y += 10;
  });

  doc.line(10, y, 200, y);

  // ── Save ──
  doc.save(`Payslip_${monthName}_${record.year}.pdf`);
};

  return (
    <div className="p-4">

      {/* ── Page Header ── */}
      <div className="mb-4">
        <h4 className="fw-bold mb-0">My Salary</h4>
        <small className="text-medium-emphasis">
          View your payslips and salary history
        </small>
      </div>

      {/* ── Stat Cards ── */}
      <CRow className="g-3 mb-4">
        <CCol xs={6} md={3}>
          <StatCard
            title="Total Earned"
            value={formatCurrency(totalEarned)}
            icon={cilMoney}
            color="success"
            small
          />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard
            title="Pending"
            value={formatCurrency(pendingAmount)}
            icon={cilClock}
            color="warning"
            small
          />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard
            title="Total Months"
            value={salary.length}
            icon={cilCalendar}
            color="primary"
          />
        </CCol>
        <CCol xs={6} md={3}>
          <StatCard
            title="Paid Months"
            value={salary.filter((s) => s.status === "Paid").length}
            icon={cilCheckCircle}
            color="info"
          />
        </CCol>
      </CRow>

      {/* ── Latest Payslip Card ── */}
      {latestSalary && (
        <CCard className="shadow-sm mb-4">
          <CCardHeader className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <CIcon icon={cilChart} />
              <span className="fw-semibold">
                Latest Payslip —{" "}
                {monthNames[latestSalary.month - 1]} {latestSalary.year}
              </span>
            </div>
            <CBadge
              color={latestSalary.status === "Paid" ? "success" : "warning"}
              shape="rounded-pill"
              className="px-3"
            >
              {latestSalary.status}
            </CBadge>
          </CCardHeader>

          <CCardBody>
            <CRow className="g-4">

              {/* Salary Breakdown */}
              <CCol md={6}>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-medium-emphasis">Base Salary</span>
                    <span className="fw-semibold">
                      {formatCurrency(latestSalary.base_salary)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-medium-emphasis">Present Days</span>
                    <span className="fw-semibold">
                      {latestSalary.present_days} / {latestSalary.total_days} days
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-medium-emphasis">Deduction</span>
                    <span className="fw-semibold text-danger">
                      -{formatCurrency(
                        latestSalary.base_salary - latestSalary.final_salary
                      )}
                    </span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">Final Salary</span>
                    <span className="fw-bold fs-5 text-success">
                      {formatCurrency(latestSalary.final_salary)}
                    </span>
                  </div>
                </div>
              </CCol>

              {/* Attendance Progress */}
              <CCol md={6}>
                <div className="mb-2 d-flex justify-content-between">
                  <span className="text-medium-emphasis">Attendance Rate</span>
                  <span className="fw-semibold">
                    {attendancePercentage(
                      latestSalary.present_days,
                      latestSalary.total_days
                    )}%
                  </span>
                </div>
                <CProgress
                  style={{ height: "12px", borderRadius: "8px" }}
                  className="mb-3"
                >
                  <CProgressBar
                    value={attendancePercentage(
                      latestSalary.present_days,
                      latestSalary.total_days
                    )}
                    color={
                      attendancePercentage(
                        latestSalary.present_days,
                        latestSalary.total_days
                      ) >= 85
                        ? "success"
                        : "warning"
                    }
                    style={{ borderRadius: "8px" }}
                  />
                </CProgress>
                <small className="text-medium-emphasis">
                  {latestSalary.present_days} present out of{" "}
                  {latestSalary.total_days} working days
                </small>
              </CCol>

            </CRow>
          </CCardBody>
        </CCard>
      )}

      {/* ── Salary History Table ── */}
      <CCard className="shadow-sm">
        <CCardHeader className="d-flex align-items-center justify-content-between">
          <span className="fw-semibold">Salary History</span>
          <CBadge color="primary" shape="rounded-pill">
            {salary.length} records
          </CBadge>
        </CCardHeader>

        <CCardBody className="p-0">
          {loading ? (
            <div className="text-center py-5 text-medium-emphasis">
              Loading salary records...
            </div>
          ) : salary.length === 0 ? (
            <div className="text-center py-5 text-medium-emphasis">
              No salary records found.
            </div>
          ) : (
            <div className="table-responsive">
              <CTable hover align="middle" className="mb-0">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Month & Year</CTableHeaderCell>
                    <CTableHeaderCell>Base Salary</CTableHeaderCell>
                    <CTableHeaderCell>Attendance</CTableHeaderCell>
                    <CTableHeaderCell>Deduction</CTableHeaderCell>
                    <CTableHeaderCell>Final Salary</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Download</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {salary.map((record, index) => (
                    <CTableRow key={record.id}>

                      <CTableDataCell className="text-medium-emphasis small">
                        {index + 1}
                      </CTableDataCell>

                      {/* Month & Year */}
                      <CTableDataCell>
                        <div className="fw-semibold">
                          {monthNames[record.month - 1]} {record.year}
                        </div>
                      </CTableDataCell>

                      {/* Base Salary */}
                      <CTableDataCell>
                        {formatCurrency(record.base_salary)}
                      </CTableDataCell>

                      {/* Attendance */}
                      <CTableDataCell>
                        <div className="d-flex flex-column">
                          <span className="small">
                            {record.present_days}/{record.total_days} days
                          </span>
                          <CBadge
                            color={
                              attendancePercentage(
                                record.present_days,
                                record.total_days
                              ) >= 85
                                ? "success"
                                : "warning"
                            }
                            style={{ width: "fit-content" }}
                            className="mt-1"
                          >
                            {attendancePercentage(
                              record.present_days,
                              record.total_days
                            )}%
                          </CBadge>
                        </div>
                      </CTableDataCell>

                      {/* Deduction */}
                      <CTableDataCell className="text-danger">
                        -{formatCurrency(
                          record.base_salary - record.final_salary
                        )}
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
                          color={
                            record.status === "Paid" ? "success" : "warning"
                          }
                          shape="rounded-pill"
                          className="px-3 py-2"
                        >
                          {record.status}
                        </CBadge>
                      </CTableDataCell>

                      {/* Download */}
                      <CTableDataCell>
                        <CButton
                          color="primary"
                          variant="outline"
                          size="sm"
                          onClick={() => downloadPayslip(record)}
                        >
                          Download PDF
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

    </div>
  );
};

export default WorkerSalary;
