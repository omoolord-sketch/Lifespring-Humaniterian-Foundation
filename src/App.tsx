import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProgramsPage from "./pages/ProgramsPage";
import ScholarshipPage from "./pages/ScholarshipPage";
import DonatePage from "./pages/DonatePage";
import ContactPage from "./pages/ContactPage";
import SupportRequestPage from "./pages/SupportRequestPage";
import GovernancePage from "./pages/GovernancePage";
import PolicyRoutePage from "./pages/PolicyRoutePage";
import ComplaintsPage from "./pages/ComplaintsPage";
import ReportConcernPage from "./pages/ReportConcernPage";
import AdminAgreementsPage from "./pages/AdminAgreementsPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/scholarship" element={<ScholarshipPage />} />
            <Route path="/support-request" element={<SupportRequestPage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/governance" element={<GovernancePage />} />
            <Route path="/governance/*" element={<PolicyRoutePage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/report-a-concern" element={<ReportConcernPage />} />
            <Route path="/admin/agreements" element={<AdminAgreementsPage />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
