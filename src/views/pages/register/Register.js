import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from 'axios'

import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilUser, cilLockLocked, cilEnvelopeClosed } from '@coreui/icons'

const Register = () => {

  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ADD VALIDATION
  if (!name) {
    toast.warning("Please enter your name!");
    return;
  }
  if (!email) {
    toast.warning("Please enter your email!");
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    toast.warning("Please enter a valid email!");
    return;
  }
  if (!password) {
    toast.warning("Please enter your password!");
    return;
  }
  if (password.length < 6) {
    toast.warning("Password must be at least 6 characters!");
    return;
  }
  if (!role) {
    toast.warning("Please select a role!");
    return;
  }

    try {

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          name,
          email,
          password,
          role
        }
      );

      // Save email for OTP verification
      localStorage.setItem("verifyEmail", email);

      // Redirect to OTP page
      navigate("/verify-otp");

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        "Registration failed"
      );

    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">

      <CContainer>
        <CRow className="justify-content-center">

          <CCol md={8}>
            <CCardGroup>

              <CCard className="p-4">
                <CCardBody>

                  <CForm onSubmit={handleSubmit}>

                    <h1>Register</h1>

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>

                      <CFormInput
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilEnvelopeClosed} />
                      </CInputGroupText>

                      <CFormInput
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>

                      <CFormInput
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </CInputGroup>

                    <select
                      className="form-control mb-3"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="worker">Worker</option>
                      <option value="manager">Manager</option>
                    </select>

                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="success">
                          Register
                        </CButton>
                      </CCol>
                    </CRow>

                  </CForm>

                </CCardBody>
              </CCard>

            </CCardGroup>
          </CCol>

        </CRow>
      </CContainer>

    </div>
  )
}

export default Register