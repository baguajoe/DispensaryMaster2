import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const PrescriptionCreation = () => { const navigate = useNavigate(); useEffect(() => { navigate("/medical/prescriptions"); }, []); return null; };
export default PrescriptionCreation;
