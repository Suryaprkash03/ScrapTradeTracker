import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { hasPageAccess } from "@/lib/permissions";
import Dashboard from "@/pages/dashboard";
import Deals from "@/pages/deals";
import Documents from "@/pages/documents";
import Finance from "@/pages/finance";
import Inventory from "@/pages/inventory";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import Partners from "@/pages/partners";
import QualityCheck from "@/pages/quality-check";
import Reports from "@/pages/reports";
import ScrapLifecycle from "@/pages/scrap-lifecycle";
import Settings from "@/pages/settings";
import Shipments from "@/pages/shipments";
import Users from "@/pages/users";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";

function ProtectedRoute({ children, requiredPage }: { children: React.ReactNode; requiredPage?: string }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Login />;
  }

  // Check page access for role-based permissions
  if (requiredPage && user && !hasPageAccess(user.role, requiredPage)) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard" component={() => <ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin-dashboard" component={() => <ProtectedRoute requiredPage="/admin-dashboard"><Dashboard /></ProtectedRoute>} />
      <Route path="/inventory" component={() => <ProtectedRoute requiredPage="/inventory"><Inventory /></ProtectedRoute>} />
      <Route path="/scrap-lifecycle" component={() => <ProtectedRoute requiredPage="/scrap-lifecycle"><ScrapLifecycle /></ProtectedRoute>} />
      <Route path="/quality-check" component={() => <ProtectedRoute requiredPage="/quality-check"><QualityCheck /></ProtectedRoute>} />
      <Route path="/partners" component={() => <ProtectedRoute requiredPage="/partners"><Partners /></ProtectedRoute>} />
      <Route path="/deals" component={() => <ProtectedRoute requiredPage="/deals"><Deals /></ProtectedRoute>} />
      <Route path="/documents" component={() => <ProtectedRoute requiredPage="/documents"><Documents /></ProtectedRoute>} />
      <Route path="/shipments" component={() => <ProtectedRoute requiredPage="/shipments"><Shipments /></ProtectedRoute>} />
      <Route path="/finance" component={() => <ProtectedRoute requiredPage="/finance"><Finance /></ProtectedRoute>} />
      <Route path="/reports" component={() => <ProtectedRoute requiredPage="/reports"><Reports /></ProtectedRoute>} />
      <Route path="/settings" component={() => <ProtectedRoute requiredPage="/settings"><Settings /></ProtectedRoute>} />
      <Route path="/users" component={() => <ProtectedRoute requiredPage="/users"><Users /></ProtectedRoute>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
