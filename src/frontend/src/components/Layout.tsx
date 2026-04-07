import type { ReactNode } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Page = "dashboard" | "data-entry" | "transactions" | "report";

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { clear, identity } = useInternetIdentity();

  const navItems: { page: Page; label: string }[] = [
    { page: "dashboard", label: "डैशबोर्ड" },
    { page: "data-entry", label: "डेटा एंट्री" },
    { page: "transactions", label: "लेनदेन" },
    { page: "report", label: "रिपोर्ट" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F3F5F7" }}
    >
      {/* Top Header Strip */}
      <header
        className="no-print"
        style={{ background: "white", borderBottom: "3px solid #0B3E74" }}
      >
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-4">
          {/* Government Emblem Area */}
          <div
            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ background: "#0B3E74" }}
          >
            🏫
          </div>
          <div>
            <h1
              className="text-xl font-bold"
              style={{
                color: "#0B3E74",
                fontFamily: "'Noto Sans Devanagari', sans-serif",
              }}
            >
              MDM कैशबुक एप
            </h1>
            <p className="text-xs" style={{ color: "#6B7280" }}>
              मध्याह्न भोजन कार्यक्रम — वित्तीय प्रबंधन प्रणाली
            </p>
          </div>
          <div
            className="ml-auto text-right text-xs"
            style={{ color: "#6B7280" }}
          >
            <div>स्कूल कैशबुक</div>
            {identity && (
              <div className="font-mono text-xs" style={{ color: "#0B3E74" }}>
                {identity.getPrincipal().toString().slice(0, 12)}...
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Primary Navigation Bar */}
      <nav className="no-print w-full" style={{ background: "#0B3E74" }}>
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.page}
                data-ocid={`nav.${item.page}.link`}
                onClick={() => onNavigate(item.page)}
                className="px-5 py-3 text-sm font-medium transition-colors"
                style={{
                  color: currentPage === item.page ? "#F39C12" : "white",
                  borderBottom:
                    currentPage === item.page
                      ? "3px solid #F39C12"
                      : "3px solid transparent",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "'Noto Sans Devanagari', sans-serif",
                }}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              data-ocid="nav.signout.button"
              onClick={() => clear()}
              className="ml-auto px-5 py-3 text-sm font-medium transition-colors hover:bg-white/10"
              style={{
                color: "#fca5a5",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "'Noto Sans Devanagari', sans-serif",
              }}
            >
              साइन आउट
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div
        className="no-print w-full py-6"
        style={{
          background: "linear-gradient(135deg, #0B3E74 0%, #0D5EA8 100%)",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <h2
            className="text-2xl font-bold text-white mb-1"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
          >
            आपका स्कूल कैशबुक सारांश
          </h2>
          <p
            className="text-blue-200 text-sm"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
          >
            मध्याह्न भोजन योजना — वित्तीय रिकॉर्ड प्रबंधन
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer
        className="no-print py-4 text-center text-xs"
        style={{
          color: "#6B7280",
          borderTop: "1px solid #e5e7eb",
          background: "white",
        }}
      >
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: "#0D5EA8" }}
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
