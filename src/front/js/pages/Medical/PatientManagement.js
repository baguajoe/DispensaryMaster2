import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const PatientManagement = () => { const navigate = useNavigate(); useEffect(() => { navigate("/medical/patients"); }, []); return null; };
export default PatientManagement;
