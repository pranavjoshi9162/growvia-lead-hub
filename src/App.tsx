import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import LeadSummary from "@/pages/LeadSummary";
import AllLeads from "@/pages/AllLeads";
import SignIn from "@/pages/SignIn";
import NotFound from "./pages/NotFound";
import { LeadsProvider } from "@/context/LeadsContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <LeadsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/signin" element={<SignIn />} />

              {/* Authenticated routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  {/* Super-admin-only routes */}
                  <Route element={<ProtectedRoute roles={["super_admin"]} />}>
                    <Route path="/" element={<LeadSummary />} />
                    <Route path="/home" element={<Navigate to="/" replace />} />
                    <Route path="/dashboard" element={<Navigate to="/" replace />} />
                  </Route>

                  {/* Shared routes */}
                  <Route path="/leads" element={<AllLeads />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LeadsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
