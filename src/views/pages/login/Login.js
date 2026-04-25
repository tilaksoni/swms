import React, { useState } from 'react'
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
import { cilLockLocked, cilUser } from '@coreui/icons'

const Login = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

 const handleSubmit = async (e) => {
  e.preventDefault()

  // ADD VALIDATION
  if (!email) {
    toast.warning("Please enter your email!");
    return;
  }
  if (!password) {
    toast.warning("Please enter your password!");
    return;
  }
  // email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    toast.warning("Please enter a valid email!");
    return;
  }

  try {

    const res = await axios.post(
      "http://localhost:5000/api/auth/login",
      { email, password }
    )

    const user = res.data.user;
    // save token
    localStorage.setItem("token", res.data.token)

    // save full user
    localStorage.setItem("user", JSON.stringify(user))

    // save worker id
    if (user && user.id) {
  localStorage.setItem("workerId", user.id)
}

    // redirect based on role
    if (user.role === "manager") {
      window.location.href = "#/dashboard"
    }

    if (user.role === "worker") {
      window.location.href = "#/worker-dashboard"
    }

  } catch (err) {

    toast.error(
      err.response?.data?.message ||
      "Login failed"
    )

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

                    <h1>Login</h1>

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
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

                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary">
                          Login
                        </CButton>
                      </CCol>
                    </CRow>

                    <CRow className="mt-3">
                      <CCol xs={12}>
                        <CButton
                          color="link"
                          className="px-0"
                          onClick={() => window.location.href = "#/register"}
                        >
                          Don't have an account? Register
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

export default Login