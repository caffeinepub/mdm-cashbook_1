import { Loader2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background:
          "linear-gradient(160deg, #0B3E74 0%, #0D5EA8 60%, #1a6bc0 100%)",
      }}
    >
      {/* Decorative top strip */}
      <div className="w-full py-2" style={{ background: "#F39C12" }} />

      <div
        className="bg-white rounded-xl shadow-2xl px-10 py-12 flex flex-col items-center gap-6 w-full"
        style={{ maxWidth: 440 }}
        data-ocid="login.card"
      >
        {/* Emblem */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-md"
          style={{ background: "#0B3E74" }}
        >
          🏫
        </div>

        <div className="text-center">
          <h1
            className="text-2xl font-bold mb-2"
            style={{
              color: "#0B3E74",
              fontFamily: "'Noto Sans Devanagari', sans-serif",
            }}
          >
            MDM कैशबुक में
            <br />
            आपका स्वागत है
          </h1>
          <p
            className="text-sm"
            style={{
              color: "#6B7280",
              fontFamily: "'Noto Sans Devanagari', sans-serif",
            }}
          >
            मध्याह्न भोजन कार्यक्रम वित्तीय प्रबंधन
          </p>
        </div>

        <div
          className="w-full rounded-lg p-4 text-center text-sm"
          style={{
            background: "#EFF6FF",
            border: "1px solid #BFDBFE",
            color: "#1e40af",
          }}
        >
          <p style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            सुरक्षित लॉगिन के लिए इंटरनेट आइडेंटिटी का उपयोग करें।
          </p>
        </div>

        <button
          type="button"
          data-ocid="login.primary_button"
          onClick={login}
          disabled={isLoggingIn || isInitializing}
          className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg font-semibold text-white transition-all"
          style={{
            background: isLoggingIn || isInitializing ? "#60a5fa" : "#0D5EA8",
            cursor: isLoggingIn || isInitializing ? "not-allowed" : "pointer",
            fontFamily: "'Noto Sans Devanagari', sans-serif",
            fontSize: "1rem",
          }}
        >
          {isLoggingIn || isInitializing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>लॉगिन हो रहा है...</span>
            </>
          ) : (
            <>
              <span>🔐</span>
              <span>इंटरनेट आइडेंटिटी से लॉगिन करें</span>
            </>
          )}
        </button>

        <p
          className="text-xs text-center"
          style={{
            color: "#9CA3AF",
            fontFamily: "'Noto Sans Devanagari', sans-serif",
          }}
        >
          यह एप्लिकेशन Internet Computer blockchain पर चलती है।
        </p>
      </div>

      <div className="w-full py-2 mt-auto" style={{ background: "#F39C12" }} />
    </div>
  );
}
