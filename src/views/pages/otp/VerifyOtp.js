import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { CButton, CCard, CCardBody, CContainer, CForm } from "@coreui/react";

const VerifyOtp = () => {

    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const email = localStorage.getItem("verifyEmail");

    const [otp, setOtp] = useState(new Array(6).fill(""));
    const inputRefs = useRef([]);

    // ✅ Timer Effect (Must be after state declaration)
    useEffect(() => {
        let interval;

        if (!canResend && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        }

        if (timer === 0) {
            setCanResend(true);
            clearInterval(interval);
        }

        return () => clearInterval(interval);

    }, [timer, canResend]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;

        let newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();

        try {

            const otpString = otp.join("");

            await axios.post(
                "http://localhost:5000/api/auth/verify-otp",
                {
                    email,
                    otp: otpString
                }
            );

            toast.success("OTP Verified Successfully");

            localStorage.removeItem("verifyEmail");

            window.location.href = "#/login";

        } catch {
            toast.error("OTP Verification Failed");
        }
    };

    return (
        <CContainer className="d-flex justify-content-center align-items-center min-vh-100">
            <CCard className="p-4 w-50">
                <CCardBody>

                    <h2 className="mb-4 text-center">Verify OTP</h2>

                    <CForm onSubmit={handleVerify}>

                        <div className="d-flex justify-content-center gap-2 mb-3">
                            {otp.map((_, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    className="form-control text-center"
                                    style={{ width: "50px", height: "50px" }}
                                    value={otp[index]}
                                    ref={el => inputRefs.current[index] = el}
                                    onChange={e => handleChange(e.target, index)}
                                    onKeyDown={e => handleKeyDown(e, index)}
                                />
                            ))}
                        </div>

                        <CButton type="submit" color="primary" className="w-100">
                            Verify OTP
                        </CButton>

                        <CButton
                            color="link"
                            className="w-100 mt-2"
                            disabled={!canResend || loading}
                            onClick={async () => {

                                try {

                                    setLoading(true);

                                    await axios.post(
                                        "http://localhost:5000/api/auth/resend-otp",
                                        { email }
                                    );

                                    toast.success("OTP Resent Successfully");

                                    setTimer(60);
                                    setCanResend(false);

                                } catch {
                                    toast.error("Resend OTP Failed");
                                }

                                setLoading(false);
                            }}
                        >
                            {canResend ? "Resend OTP" : `Resend OTP in ${timer}s`}
                        </CButton>

                    </CForm>
                </CCardBody>
            </CCard>
        </CContainer>
    );
};

export default VerifyOtp;