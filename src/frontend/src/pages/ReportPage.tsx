import { Download, FileText, Loader2, Printer } from "lucide-react";
import { useRef, useState } from "react";
import { type Category, Mode, TransactionType } from "../backend";
import { useTransactions } from "../hooks/useQueries";
import { useOpeningBalance } from "../hooks/useQueries";
import { CATEGORY_ORDER, getCategoryLabel } from "../utils/categories";
import {
  firstDayOfMonth,
  formatDate,
  formatRupee,
  todayStr,
} from "../utils/format";

interface CategoryTotals {
  label: string;
  category: Category;
  cashReceived: number;
  cashSpent: number;
  cashBalance: number;
  bankReceived: number;
  bankSpent: number;
  bankBalance: number;
}

export function ReportPage() {
  const [fromDate, setFromDate] = useState(firstDayOfMonth());
  const [toDate, setToDate] = useState(todayStr());
  const [reportFromDate, setReportFromDate] = useState("");
  const [reportToDate, setReportToDate] = useState("");
  const [showReport, setShowReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const { data: transactions, isLoading } = useTransactions(
    reportFromDate || null,
    reportToDate || null,
    null,
    null,
    null,
  );
  const { data: opening } = useOpeningBalance();

  const handleViewReport = () => {
    setReportFromDate(fromDate);
    setReportToDate(toDate);
    setShowReport(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // Compute per-category totals
  const computeCategoryData = (): CategoryTotals[] => {
    return CATEGORY_ORDER.map((cat) => {
      const catTxns = (transactions ?? []).filter((t) => t.category === cat);
      const cashReceived = catTxns
        .filter(
          (t) =>
            t.mode === Mode.cash &&
            t.transactionType === TransactionType.receipt,
        )
        .reduce((s, t) => s + Number(t.amount), 0);
      const cashSpent = catTxns
        .filter(
          (t) =>
            t.mode === Mode.cash &&
            t.transactionType === TransactionType.expense,
        )
        .reduce((s, t) => s + Number(t.amount), 0);
      const bankReceived = catTxns
        .filter(
          (t) =>
            t.mode === Mode.bank &&
            t.transactionType === TransactionType.receipt,
        )
        .reduce((s, t) => s + Number(t.amount), 0);
      const bankSpent = catTxns
        .filter(
          (t) =>
            t.mode === Mode.bank &&
            t.transactionType === TransactionType.expense,
        )
        .reduce((s, t) => s + Number(t.amount), 0);
      return {
        label: getCategoryLabel(cat),
        category: cat,
        cashReceived,
        cashSpent,
        cashBalance: cashReceived - cashSpent,
        bankReceived,
        bankSpent,
        bankBalance: bankReceived - bankSpent,
      };
    });
  };

  const categoryData = showReport && transactions ? computeCategoryData() : [];

  const totalCashReceived = categoryData.reduce(
    (s, r) => s + r.cashReceived,
    0,
  );
  const totalCashSpent = categoryData.reduce((s, r) => s + r.cashSpent, 0);
  const totalCashBalance = categoryData.reduce((s, r) => s + r.cashBalance, 0);
  const totalBankReceived = categoryData.reduce(
    (s, r) => s + r.bankReceived,
    0,
  );
  const totalBankSpent = categoryData.reduce((s, r) => s + r.bankSpent, 0);
  const totalBankBalance = categoryData.reduce((s, r) => s + r.bankBalance, 0);
  const totalAvailable =
    (opening ? Number(opening.cashAmount) + Number(opening.bankAmount) : 0) +
    totalCashReceived +
    totalBankReceived -
    totalCashSpent -
    totalBankSpent;

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div
        className="rounded-lg shadow-card p-5 no-print"
        style={{ background: "white" }}
      >
        <h2 className="font-bold text-xl mb-4" style={{ color: "#0B3E74" }}>
          रिपोर्ट तैयार करें
        </h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label
              htmlFor="report-from"
              className="text-sm font-medium block mb-1"
              style={{ color: "#374151" }}
            >
              दिनांक से
            </label>
            <input
              id="report-from"
              data-ocid="report.from_date.input"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
              style={{ borderColor: "#D1D5DB" }}
            />
          </div>
          <div>
            <label
              htmlFor="report-to"
              className="text-sm font-medium block mb-1"
              style={{ color: "#374151" }}
            >
              दिनांक तक
            </label>
            <input
              id="report-to"
              data-ocid="report.to_date.input"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
              style={{ borderColor: "#D1D5DB" }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              data-ocid="report.view.primary_button"
              onClick={handleViewReport}
              disabled={isLoading && showReport}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-white text-sm"
              style={{ background: "#0D5EA8", cursor: "pointer" }}
            >
              {isLoading && showReport ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>रिपोर्ट देखें</span>
            </button>
            {showReport && (
              <>
                <button
                  type="button"
                  data-ocid="report.pdf.primary_button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-white text-sm"
                  style={{ background: "#F39C12", cursor: "pointer" }}
                >
                  <Download className="w-4 h-4" />
                  <span>पीडीएफ डाउनलोड करें</span>
                </button>
                <button
                  type="button"
                  data-ocid="report.print.secondary_button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-white text-sm"
                  style={{ background: "#0B3E74", cursor: "pointer" }}
                >
                  <Printer className="w-4 h-4" />
                  <span>प्रिंट करें</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Report Content */}
      {showReport && (
        <div
          ref={reportRef}
          className="print-report rounded-lg shadow-card"
          style={{ background: "white" }}
          data-ocid="report.panel"
        >
          {isLoading ? (
            <div
              className="flex items-center justify-center py-12"
              data-ocid="report.loading_state"
            >
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: "#0B3E74" }}
              />
              <span className="ml-2" style={{ color: "#6B7280" }}>
                रिपोर्ट लोड हो रही है...
              </span>
            </div>
          ) : (
            <div className="p-6">
              {/* Report Header */}
              <div
                className="report-title text-center mb-1"
                style={{ fontSize: 20, fontWeight: 700, color: "#0B3E74" }}
              >
                MDM कैशबुक रिपोर्ट
              </div>
              <div
                className="report-subtitle text-center mb-6"
                style={{ fontSize: 13, color: "#374151" }}
              >
                दिनांक: {formatDate(reportFromDate)} से {formatDate(reportToDate)}{" "}
                तक
              </div>

              {/* Opening Balance */}
              <div
                className="mb-6 p-4 rounded-lg"
                style={{ background: "#F0F9FF", border: "1px solid #BAE6FD" }}
              >
                <div
                  className="section-heading font-bold text-sm mb-3"
                  style={{ color: "#0B3E74" }}
                >
                  प्रारम्भिक शेष
                </div>
                <div className="flex flex-wrap gap-6">
                  <div>
                    <span className="text-sm" style={{ color: "#374151" }}>
                      नकद:{" "}
                    </span>
                    <span className="font-bold" style={{ color: "#0B3E74" }}>
                      {opening ? formatRupee(opening.cashAmount) : "₹0"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm" style={{ color: "#374151" }}>
                      बैंक:{" "}
                    </span>
                    <span className="font-bold" style={{ color: "#0B3E74" }}>
                      {opening ? formatRupee(opening.bankAmount) : "₹0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cash Section */}
              <div className="mb-6">
                <div
                  className="section-heading font-bold text-base mb-3 px-3 py-2 rounded"
                  style={{ background: "#EFF6FF", color: "#0B3E74" }}
                >
                  नकद में
                </div>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: "#0B3E74", color: "white" }}>
                      <th className="px-4 py-2 text-left font-medium border border-blue-800">
                        मद
                      </th>
                      <th className="px-4 py-2 text-right font-medium border border-blue-800">
                        प्राप्त राशि
                      </th>
                      <th className="px-4 py-2 text-right font-medium border border-blue-800">
                        खर्च राशि
                      </th>
                      <th className="px-4 py-2 text-right font-medium border border-blue-800">
                        शेष राशि
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData.map((row) => (
                      <tr
                        key={row.category}
                        style={{ borderBottom: "1px solid #E5E7EB" }}
                      >
                        <td
                          className="px-4 py-2"
                          style={{ borderRight: "1px solid #E5E7EB" }}
                        >
                          {row.label}
                        </td>
                        <td
                          className="px-4 py-2 text-right"
                          style={{
                            color: "#16a34a",
                            borderRight: "1px solid #E5E7EB",
                          }}
                        >
                          {formatRupee(row.cashReceived)}
                        </td>
                        <td
                          className="px-4 py-2 text-right"
                          style={{
                            color: "#dc2626",
                            borderRight: "1px solid #E5E7EB",
                          }}
                        >
                          {formatRupee(row.cashSpent)}
                        </td>
                        <td
                          className="px-4 py-2 text-right font-medium"
                          style={{
                            color: row.cashBalance >= 0 ? "#0B3E74" : "#dc2626",
                          }}
                        >
                          {formatRupee(row.cashBalance)}
                        </td>
                      </tr>
                    ))}
                    <tr
                      style={{
                        background: "#EFF6FF",
                        borderTop: "2px solid #0B3E74",
                      }}
                    >
                      <td
                        className="px-4 py-2 font-bold"
                        style={{ color: "#0B3E74" }}
                      >
                        कुल राशि
                      </td>
                      <td
                        className="px-4 py-2 text-right font-bold"
                        style={{ color: "#16a34a" }}
                      >
                        {formatRupee(totalCashReceived)}
                      </td>
                      <td
                        className="px-4 py-2 text-right font-bold"
                        style={{ color: "#dc2626" }}
                      >
                        {formatRupee(totalCashSpent)}
                      </td>
                      <td
                        className="px-4 py-2 text-right font-bold"
                        style={{ color: "#0B3E74" }}
                      >
                        {formatRupee(totalCashBalance)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bank Section */}
              <div className="mb-6">
                <div
                  className="section-heading font-bold text-base mb-3 px-3 py-2 rounded"
                  style={{ background: "#F0FDF4", color: "#16a34a" }}
                >
                  बैंक में
                </div>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: "#0B3E74", color: "white" }}>
                      <th className="px-4 py-2 text-left font-medium border border-blue-800">
                        मद
                      </th>
                      <th className="px-4 py-2 text-right font-medium border border-blue-800">
                        प्राप्त राशि
                      </th>
                      <th className="px-4 py-2 text-right font-medium border border-blue-800">
                        खर्च राशि
                      </th>
                      <th className="px-4 py-2 text-right font-medium border border-blue-800">
                        शेष राशि
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData.map((row) => (
                      <tr
                        key={row.category}
                        style={{ borderBottom: "1px solid #E5E7EB" }}
                      >
                        <td
                          className="px-4 py-2"
                          style={{ borderRight: "1px solid #E5E7EB" }}
                        >
                          {row.label}
                        </td>
                        <td
                          className="px-4 py-2 text-right"
                          style={{
                            color: "#16a34a",
                            borderRight: "1px solid #E5E7EB",
                          }}
                        >
                          {formatRupee(row.bankReceived)}
                        </td>
                        <td
                          className="px-4 py-2 text-right"
                          style={{
                            color: "#dc2626",
                            borderRight: "1px solid #E5E7EB",
                          }}
                        >
                          {formatRupee(row.bankSpent)}
                        </td>
                        <td
                          className="px-4 py-2 text-right font-medium"
                          style={{
                            color: row.bankBalance >= 0 ? "#0B3E74" : "#dc2626",
                          }}
                        >
                          {formatRupee(row.bankBalance)}
                        </td>
                      </tr>
                    ))}
                    <tr
                      style={{
                        background: "#F0FDF4",
                        borderTop: "2px solid #16a34a",
                      }}
                    >
                      <td
                        className="px-4 py-2 font-bold"
                        style={{ color: "#16a34a" }}
                      >
                        कुल राशि
                      </td>
                      <td
                        className="px-4 py-2 text-right font-bold"
                        style={{ color: "#16a34a" }}
                      >
                        {formatRupee(totalBankReceived)}
                      </td>
                      <td
                        className="px-4 py-2 text-right font-bold"
                        style={{ color: "#dc2626" }}
                      >
                        {formatRupee(totalBankSpent)}
                      </td>
                      <td
                        className="px-4 py-2 text-right font-bold"
                        style={{ color: "#16a34a" }}
                      >
                        {formatRupee(totalBankBalance)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Available */}
              <div
                className="p-4 rounded-lg flex flex-wrap gap-6 justify-between items-center"
                style={{ background: "#0B3E74" }}
              >
                <div>
                  <div className="text-sm font-medium text-blue-200">
                    कुल उपलब्ध राशि (नकद + बैंक)
                  </div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {formatRupee(totalAvailable)}
                  </div>
                </div>
                <div className="flex gap-8 text-white">
                  <div className="text-center">
                    <div className="text-xs text-blue-200">कुल नकद</div>
                    <div className="font-bold">
                      {formatRupee(
                        totalCashBalance +
                          (opening ? Number(opening.cashAmount) : 0),
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-blue-200">कुल बैंक</div>
                    <div className="font-bold">
                      {formatRupee(
                        totalBankBalance +
                          (opening ? Number(opening.bankAmount) : 0),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction List */}
              {transactions && transactions.length > 0 && (
                <div className="mt-6">
                  <div
                    className="section-heading font-bold text-base mb-3 px-3 py-2 rounded"
                    style={{ background: "#F3F4F6", color: "#374151" }}
                  >
                    विस्तृत लेनदेन सूची
                  </div>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr style={{ background: "#374151", color: "white" }}>
                        <th className="px-3 py-2 text-left border border-gray-400">
                          #
                        </th>
                        <th className="px-3 py-2 text-left border border-gray-400">
                          दिनांक
                        </th>
                        <th className="px-3 py-2 text-left border border-gray-400">
                          मद
                        </th>
                        <th className="px-3 py-2 text-left border border-gray-400">
                          प्रकार
                        </th>
                        <th className="px-3 py-2 text-left border border-gray-400">
                          माध्यम
                        </th>
                        <th className="px-3 py-2 text-right border border-gray-400">
                          राशि
                        </th>
                        <th className="px-3 py-2 text-left border border-gray-400">
                          वाउचर
                        </th>
                        <th className="px-3 py-2 text-left border border-gray-400">
                          विवरण
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn, i) => (
                        <tr
                          key={String(txn.id)}
                          style={{
                            background: i % 2 === 0 ? "white" : "#F9FAFB",
                            borderBottom: "1px solid #E5E7EB",
                          }}
                        >
                          <td className="px-3 py-1.5 border-r border-gray-200">
                            {i + 1}
                          </td>
                          <td className="px-3 py-1.5 border-r border-gray-200">
                            {formatDate(txn.date)}
                          </td>
                          <td className="px-3 py-1.5 border-r border-gray-200">
                            {getCategoryLabel(txn.category)}
                          </td>
                          <td
                            className="px-3 py-1.5 border-r border-gray-200"
                            style={{
                              color:
                                txn.transactionType === TransactionType.receipt
                                  ? "#16a34a"
                                  : "#dc2626",
                            }}
                          >
                            {txn.transactionType === TransactionType.receipt
                              ? "प्राप्ति"
                              : "खर्च"}
                          </td>
                          <td className="px-3 py-1.5 border-r border-gray-200">
                            {txn.mode === Mode.cash ? "नकद" : "बैंक"}
                          </td>
                          <td
                            className="px-3 py-1.5 text-right font-medium border-r border-gray-200"
                            style={{
                              color:
                                txn.transactionType === TransactionType.receipt
                                  ? "#16a34a"
                                  : "#dc2626",
                            }}
                          >
                            {formatRupee(txn.amount)}
                          </td>
                          <td className="px-3 py-1.5 border-r border-gray-200">
                            {txn.voucherNumber || "—"}
                          </td>
                          <td className="px-3 py-1.5">
                            {txn.description || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div
                className="mt-6 text-xs text-center"
                style={{ color: "#9CA3AF" }}
              >
                यह रिपोर्ट MDM कैशबुक एप द्वारा तैयार की गई है। मुद्रण दिनांक:{" "}
                {new Date().toLocaleDateString("hi-IN")}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
