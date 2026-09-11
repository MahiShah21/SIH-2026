import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// 1. Auth Page
import LoginPage from './pages/auth/LoginPage';

// 2. Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import ReportProblemStep1 from './pages/citizen/ReportProblemStep1';
import ReportProblemStep2 from './pages/citizen/ReportProblemStep2';
import CitizenProfile from './pages/citizen/CitizenProfile';
import GiveFeedback from './pages/citizen/GiveFeedback';

// 3. University Pages
import UniversityDashboard from './pages/university/UniversityDashboard';
import UniversityChallenges from './pages/university/UniversityChallenges';
import UniversityProjects from './pages/university/UniversityProjects';
import UniversityProposals from './pages/university/UniversityProposals';
import UniversityTeams from './pages/university/UniversityTeams';
import UniversityMilestones from './pages/university/UniversityMilestones';
import UniversityCommunication from './pages/university/UniversityCommunication';
import UniversityDocuments from './pages/university/UniversityDocuments';
import UniversityImpact from './pages/university/UniversityImpact';
import UniversityIndustry from './pages/university/UniversityIndustry';
import UniversityProfile from './pages/university/UniversityProfile';

// 4. Industry Pages
import IndustryDashboard from './pages/industry/IndustryDashboard';
import IndustryProblems from './pages/industry/IndustryProblems';
import IndustryActiveProjects from './pages/industry/IndustryActiveProjects';
import CollaborationRequests from './pages/industry/CollaborationRequests';
import IndustryImpact from './pages/industry/IndustryImpact';
import IndustryCommunication from './pages/industry/IndustryCommunication';
import IndustryProfile from './pages/industry/IndustryProfile';

// 5. Government Admin Page
import AIReviewDashboard from './pages/admin/AIReviewDashboard';

// 6. Public Dashboards & Explorer Pages
import ChallengesDashboard from './pages/public/ChallengesDashboard';
import ImpactInsightsDashboard from './pages/public/ImpactInsightsDashboard';
import ProblemsMapDashboard from './pages/public/ProblemsMapDashboard';
import SolutionsProjectsDashboard from './pages/public/SolutionsProjectsDashboard';
import ViewProjectPublic from './pages/public/ViewProjectPublic';
import ProblemLifecycleTimeline from './pages/public/ProblemLifecycleTimeline';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans">
          <Routes>
            {/* 1. Multi-Role Login Gateway as the Home & Login Starting Page */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* 2. Citizen Portal Routes */}
            <Route path="/citizen" element={<Navigate to="/citizen/dashboard" replace />} />
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            <Route path="/citizen/report-problem" element={<ReportProblemStep1 />} />
            <Route path="/citizen/report" element={<ReportProblemStep1 />} />
            <Route path="/citizen/problem" element={<ReportProblemStep1 />} />
            <Route path="/citizen/report-problem/step-2" element={<ReportProblemStep2 />} />
            <Route path="/citizen/problems" element={<GiveFeedback />} />
            <Route path="/citizen/my-problems" element={<GiveFeedback />} />
            <Route path="/citizen/track" element={<GiveFeedback />} />
            <Route path="/citizen/feedback" element={<GiveFeedback />} />
            <Route path="/citizen/profile" element={<CitizenProfile />} />

            {/* 3. University / Academia Portal Routes */}
            <Route path="/university" element={<Navigate to="/university/dashboard" replace />} />
            <Route path="/university/dashboard" element={<UniversityDashboard />} />
            <Route path="/university/challenges" element={<UniversityChallenges />} />
            <Route path="/university/projects" element={<UniversityProjects />} />
            <Route path="/university/proposals" element={<Navigate to="/university/projects?tab=proposals" replace />} />
            <Route path="/university/teams" element={<Navigate to="/university/projects?tab=teams" replace />} />
            <Route path="/university/milestones" element={<Navigate to="/university/projects" replace />} />
            <Route path="/university/communication" element={<UniversityCommunication />} />
            <Route path="/university/documents" element={<Navigate to="/university/projects?tab=documents" replace />} />
            <Route path="/university/impact" element={<UniversityImpact />} />
            <Route path="/university/industry" element={<UniversityIndustry />} />
            <Route path="/university/profile" element={<UniversityProfile />} />

            {/* 4. Industry & CSR Hub Routes */}
            <Route path="/industry" element={<Navigate to="/industry/dashboard" replace />} />
            <Route path="/industry/dashboard" element={<IndustryDashboard />} />
            <Route path="/industry/problems" element={<IndustryProblems />} />
            <Route path="/industry/projects" element={<IndustryActiveProjects />} />
            <Route path="/industry/collaborations" element={<CollaborationRequests />} />
            <Route path="/industry/communication" element={<IndustryCommunication />} />
            <Route path="/industry/impact" element={<IndustryImpact />} />
            <Route path="/industry/profile" element={<IndustryProfile />} />

            {/* 5. Government Admin AI Review Route */}
            <Route path="/admin" element={<Navigate to="/admin/ai-review" replace />} />
            <Route path="/admin/ai-review" element={<AIReviewDashboard />} />

            {/* 6. Public Dashboards & Shared Intelligence Views */}
            <Route path="/public/challenges" element={<ChallengesDashboard />} />
            <Route path="/public/impact" element={<ImpactInsightsDashboard />} />
            <Route path="/public/map" element={<ProblemsMapDashboard />} />
            <Route path="/public/solutions" element={<SolutionsProjectsDashboard />} />
            <Route path="/public/project-view" element={<ViewProjectPublic />} />
            <Route path="/public/problem-timeline" element={<ProblemLifecycleTimeline />} />

            {/* Catch-all route -> redirect to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  </AuthProvider>
  );
}

