import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import PatientOnlyRoute from "@/components/PatientOnlyRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Home from "@/pages/Home";
import SymptomChecker from "@/pages/SymptomChecker";
import Doctors from "@/pages/Doctors";
import Chatbot from "@/pages/Chatbot";
import ReportAnalyzer from "@/pages/ReportAnalyzer";
import NearbyDoctors from "@/pages/NearbyDoctors";
import BookAppointment from "@/pages/BookAppointment";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Support from "@/pages/Support";
import EmergencyMode from "@/pages/EmergencyMode";
import PatientDashboard from "@/pages/dashboard/PatientDashboard";
import PatientAppointments from "@/pages/dashboard/PatientAppointments";
import PatientPayments from "@/pages/dashboard/PatientPayments";
import PaymentGateway from "@/pages/dashboard/PaymentGateway";
import PatientProfile from "@/pages/dashboard/PatientProfile";
import DoctorDashboard from "@/pages/dashboard/DoctorDashboard";
import DoctorAppointments from "@/pages/dashboard/DoctorAppointments";
import DoctorProfile from "@/pages/dashboard/DoctorProfile";
import DoctorSchedule from "@/pages/dashboard/DoctorSchedule";
import ChatRoom from "@/pages/dashboard/ChatRoom";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import AdminDoctors from "@/pages/dashboard/AdminDoctors";
import AdminUsers from "@/pages/dashboard/AdminUsers";
import AdminAppointments from "@/pages/dashboard/AdminAppointments";
import AdminSupport from "@/pages/dashboard/AdminSupport";
import NotFound from "@/pages/NotFound";

import ScrollToTop from "@/components/ScrollToTop";
import EmergencyFAB from "@/components/EmergencyFAB";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <SocketProvider>
          <Navbar />
          <EmergencyFAB />
          <Routes>
            {/* Public routes — patient-only (Admin/Doctor redirected to dashboard) */}
            <Route path="/" element={<PatientOnlyRoute><Home /></PatientOnlyRoute>} />
            <Route path="/symptom-checker" element={<PatientOnlyRoute><SymptomChecker /></PatientOnlyRoute>} />
            <Route path="/doctors" element={<PatientOnlyRoute><Doctors /></PatientOnlyRoute>} />
            <Route path="/chatbot" element={<PatientOnlyRoute><Chatbot /></PatientOnlyRoute>} />
            <Route path="/report-analyzer" element={<PatientOnlyRoute><ReportAnalyzer /></PatientOnlyRoute>} />
            <Route path="/nearby-doctors" element={<PatientOnlyRoute><NearbyDoctors /></PatientOnlyRoute>} />
            <Route path="/book/:doctorId" element={<PatientOnlyRoute><BookAppointment /></PatientOnlyRoute>} />
            <Route path="/support" element={<PatientOnlyRoute><Support /></PatientOnlyRoute>} />
            <Route path="/emergency-mode" element={<EmergencyMode />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Patient Dashboard */}
            <Route
              path="/dashboard/patient"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<PatientDashboard />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="payments" element={<PatientPayments />} />
              <Route path="payment/:appointmentId" element={<PaymentGateway />} />
              <Route path="profile" element={<PatientProfile />} />
              <Route path="chat/:oderId" element={<ChatRoom />} />
            </Route>

            {/* Doctor Dashboard */}
            <Route
              path="/dashboard/doctor"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="schedule" element={<DoctorSchedule />} />
              <Route path="profile" element={<DoctorProfile />} />
              <Route path="chat/:oderId" element={<ChatRoom />} />
            </Route>

            {/* Admin Dashboard */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="doctors" element={<AdminDoctors />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="support" element={<AdminSupport />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
