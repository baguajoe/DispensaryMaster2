import React, { useState } from "react";
const FAQS = [
    {q:"How do I add a new product?",a:"Go to Products in the sidebar, click Add Product, fill in the details including batch number, THC/CBD content, and stock levels."},
    {q:"How does Metrc sync work?",a:"BudphoriaPro automatically syncs your inventory and sales with Metrc after each transaction. No manual entry needed."},
    {q:"How do I run payroll?",a:"Navigate to HR > Payroll, select the pay period, choose employees, and click Calculate Payroll. Export to PDF or CSV."},
    {q:"How do I assign training to an employee?",a:"Go to Training > Create Training, upload your video or document, then use the Assign button to select specific employees."},
    {q:"What states does compliance support?",a:"MA, CA, CO, IL, NY, NV, OR, WA, MI, AZ, NJ, CT, RI, ME, and MN with state-specific templates."},
    {q:"How do I register a medical patient?",a:"Go to Medical > Patient Registration, fill in the patient details including medical card number and expiration date."},
    {q:"How does LeafBridge Connect work?",a:"LeafBridge is your built-in cannabis professional network. Post jobs, hire staff, assign training, and manage onboarding all in one place."},
    {q:"Can I use BudphoriaPro on mobile?",a:"Yes — the app is fully responsive and works on all devices including tablets and smartphones."},
];
const HelpCenter = () => {
    const [open, setOpen] = useState(null);
    return (
        <div className="main-content p-4">
            <h2 style={{color:"#ffab00",marginBottom:"0.5rem"}}>Help Center</h2>
            <p style={{color:"rgba(255,248,225,0.6)",marginBottom:"2rem"}}>Frequently asked questions about BudphoriaPro</p>
            {FAQS.map((faq,i) => (
                <div key={i} className="glass-panel" style={{marginBottom:"0.75rem",cursor:"pointer"}} onClick={() => setOpen(open===i?null:i)}>
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 style={{margin:0,color:"#ffab00",fontWeight:700}}>{faq.q}</h6>
                        <span style={{color:"#ffab00"}}>{open===i?"▲":"▼"}</span>
                    </div>
                    {open===i && <p style={{marginTop:"0.75rem",marginBottom:0,color:"rgba(255,248,225,0.75)"}}>{faq.a}</p>}
                </div>
            ))}
            <div className="glass-panel" style={{marginTop:"2rem",textAlign:"center",borderColor:"rgba(255,171,0,0.3)"}}>
                <h5 style={{color:"#ffab00"}}>Still need help?</h5>
                <p style={{color:"rgba(255,248,225,0.6)"}}>Contact our support team</p>
                <a href="mailto:support@budphoriapro.com" className="btn btn-primary">Contact Support</a>
            </div>
        </div>
    );
};
export default HelpCenter;