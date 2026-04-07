import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Layout } from "./components/Layout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { DashboardPage } from "./pages/DashboardPage";
import { DataEntryPage } from "./pages/DataEntryPage";
import { LoginPage } from "./pages/LoginPage";
import { ReportPage } from "./pages/ReportPage";
import { TransactionsPage } from "./pages/TransactionsPage";

type Page = "dashboard" | "data-entry" | "transactions" | "report";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F3F5F7" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-md"
            style={{ background: "#0B3E74" }}
          >
            🏫
          </div>
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "#0B3E74" }}
          />
          <p
            style={{
              color: "#6B7280",
              fontFamily: "'Noto Sans Devanagari', sans-serif",
            }}
          >
            लोड हो रहा है...
          </p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "data-entry":
        return <DataEntryPage />;
      case "transactions":
        return <TransactionsPage />;
      case "report":
        return <ReportPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
      <Toaster richColors position="top-right" />
    </>
  );
}
