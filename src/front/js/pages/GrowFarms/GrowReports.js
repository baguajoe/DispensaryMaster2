import React, { useState, useEffect } from "react";
import ReportTable from "../../component/GrowFarmComponent/ReportTable";
import ReportFilters from "../../component/GrowFarmComponent/ReportFilters";
import ExportButton from "../../component/GrowFarmComponent/ExportButton";

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchReports = async (filters) => {
        const queryString = new URLSearchParams(filters).toString();
        const url = `${process.env.BACKEND_URL}/api/reports/compliance${queryString ? `?${queryString}` : ""}`;
        setLoading(true);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setReports(data);
        } catch (error) {
            console.error("Error fetching compliance reports:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports(filters);
    }, [filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <div>
            <h1>Reports</h1>
            <ReportFilters onFilterChange={handleFilterChange} />
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <ReportTable reports={reports} />
                    <ExportButton data={reports} />
                </>
            )}
        </div>
    );
};

export default Reports;






// import React, { useState, useEffect } from "react";
// import ReportTable from "../../component/GrowFarmComponent/ReportTable";
// import ReportFilters from "../../component/GrowFarmComponent/ReportFilters";
// import ExportButton from "../../component/GrowFarmComponent/ExportButton";
// import { fetchReports } from "../services/reportService";

// const Reports = () => {
//     const [reports, setReports] = useState([]);
//     const [filters, setFilters] = useState({});
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const data = await fetchReports(filters);
//                 setReports(data);
//             } catch (error) {
//                 console.error("Error fetching reports:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [filters]);

//     const handleFilterChange = (newFilters) => {
//         setFilters(newFilters);
//     };

//     return (
//         <div>
//             <h1>Reports</h1>
//             {loading ? (
//                 <p>Loading...</p>
//             ) : (
//                 <>
//                     <ReportFilters onFilterChange={handleFilterChange} />
//                     <ReportTable reports={reports} />
//                     <ExportButton data={reports} />
//                 </>
//             )}
//         </div>
//     );
// };

// export default Reports;
