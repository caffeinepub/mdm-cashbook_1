import {
  Building2,
  Edit2,
  Loader2,
  Save,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Category, Mode, TransactionType } from "../backend";
import {
  useDashboardSummary,
  useOpeningBalance,
  useSetOpeningBalance,
} from "../hooks/useQueries";
import { useTransactions } from "../hooks/useQueries";
import { CATEGORY_ORDER, getCategoryLabel } from "../utils/categories";
import {
  firstDayOfMonth,
  formatRupee,
  paiseToRupeeStr,
  rupeesToPaise,
  todayStr,
} from "../utils/format";

export function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: opening, isLoading: openingLoading } = useOpeningBalance();
  const fromDate = firstDayOfMonth();
  const toDate = todayStr();
  const { data: transactions } = useTransactions(fromDate, toDate);
  const setOpeningBalance = useSetOpeningBalance();

  const [editingOpening, setEditingOpening] = useState(false);
  const [cashOpening, setCashOpening] = useState("");
  const [bankOpening, setBankOpening] = useState("");

  // Compute per-category totals from transactions
  const categoryData = CATEGORY_ORDER.map((cat) => {
    const catTxns = (transactions ?? []).filter((t) => t.category === cat);
    const cashReceived = catTxns
      .filter(
        (t) =>
          t.mode === Mode.cash && t.transactionType === TransactionType.receipt,
      )
      .reduce((s, t) => s + Number(t.amount), 0);
    const cashSpent = catTxns
      .filter(
        (t) =>
          t.mode === Mode.cash && t.transactionType === TransactionType.expense,
      )
      .reduce((s, t) => s + Number(t.amount), 0);
    const bankReceived = catTxns
      .filter(
        (t) =>
          t.mode === Mode.bank && t.transactionType === TransactionType.receipt,
      )
      .reduce((s, t) => s + Number(t.amount), 0);
    const bankSpent = catTxns
      .filter(
        (t) =>
          t.mode === Mode.bank && t.transactionType === TransactionType.expense,
      )
      .reduce((s, t) => s + Number(t.amount), 0);
    return {
      category: cat,
      label: getCategoryLabel(cat),
      cashReceived,
      cashSpent,
      cashBalance: cashReceived - cashSpent,
      bankReceived,
      bankSpent,
      bankBalance: bankReceived - bankSpent,
    };
  });

  const handleSaveOpening = async () => {
    try {
      await setOpeningBalance.mutateAsync({
        cashAmount: BigInt(rupeesToPaise(cashOpening)),
        bankAmount: BigInt(rupeesToPaise(bankOpening)),
      });
      toast.success("प्रारम्भिक शेष सहेजा गया");
      setEditingOpening(false);
    } catch {
      toast.error("प्रारम्भिक शेष सहेजने में त्रुटि");
    }
  };

  const handleStartEdit = () => {
    setCashOpening(paiseToRupeeStr(opening?.cashAmount ?? 0));
    setBankOpening(paiseToRupeeStr(opening?.bankAmount ?? 0));
    setEditingOpening(true);
  };

  const summaryCards = [
    {
      label: "कुल नकद शेष",
      value: summary ? formatRupee(summary.cashBalance) : "₹0",
      icon: <Wallet className="w-6 h-6" />,
      color: "#0B3E74",
      bg: "#EFF6FF",
      ocid: "dashboard.cash_balance.card",
    },
    {
      label: "कुल बैंक शेष",
      value: summary ? formatRupee(summary.bankBalance) : "₹0",
      icon: <Building2 className="w-6 h-6" />,
      color: "#0D5EA8",
      bg: "#F0F9FF",
      ocid: "dashboard.bank_balance.card",
    },
    {
      label: "आज का खर्च",
      value: summary ? formatRupee(summary.todayExpenses) : "₹0",
      icon: <TrendingDown className="w-6 h-6" />,
      color: "#dc2626",
      bg: "#FFF5F5",
      ocid: "dashboard.today_expense.card",
    },
    {
      label: "आज की प्राप्ति",
      value: summary ? formatRupee(summary.todayReceipts) : "₹0",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "#16a34a",
      bg: "#F0FDF4",
      ocid: "dashboard.today_receipt.card",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summaryLoading ? (
        <div
          className="flex items-center justify-center py-8"
          data-ocid="dashboard.loading_state"
        >
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "#0B3E74" }}
          />
          <span className="ml-2" style={{ color: "#6B7280" }}>
            लोड हो रहा है...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              data-ocid={card.ocid}
              className="rounded-lg p-5 shadow-card"
              style={{ background: "white", border: `2px solid ${card.bg}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: card.bg, color: card.color }}
                >
                  {card.icon}
                </div>
              </div>
              <div
                className="text-xs font-medium mb-1"
                style={{ color: "#6B7280" }}
              >
                {card.label}
              </div>
              <div className="text-xl font-bold" style={{ color: card.color }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Opening Balance */}
      <div
        className="rounded-lg shadow-card p-5"
        style={{ background: "white" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg" style={{ color: "#0B3E74" }}>
            प्रारम्भिक शेष
          </h3>
          {!editingOpening && (
            <button
              type="button"
              data-ocid="dashboard.opening_balance.edit_button"
              onClick={handleStartEdit}
              className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md font-medium"
              style={{
                background: "#EFF6FF",
                color: "#0D5EA8",
                cursor: "pointer",
              }}
            >
              <Edit2 className="w-4 h-4" />
              <span>संपादित करें</span>
            </button>
          )}
        </div>
        {openingLoading ? (
          <div className="flex items-center gap-2" style={{ color: "#6B7280" }}>
            <Loader2 className="w-4 h-4 animate-spin" /> लोड हो रहा है...
          </div>
        ) : editingOpening ? (
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label
                htmlFor="cash-opening"
                className="text-sm font-medium block mb-1"
                style={{ color: "#374151" }}
              >
                नकद प्रारम्भिक शेष (₹)
              </label>
              <input
                id="cash-opening"
                data-ocid="dashboard.cash_opening.input"
                type="number"
                min="0"
                step="0.01"
                value={cashOpening}
                onChange={(e) => setCashOpening(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm w-40"
                style={{ borderColor: "#D1D5DB" }}
              />
            </div>
            <div>
              <label
                htmlFor="bank-opening"
                className="text-sm font-medium block mb-1"
                style={{ color: "#374151" }}
              >
                बैंक प्रारम्भिक शेष (₹)
              </label>
              <input
                id="bank-opening"
                data-ocid="dashboard.bank_opening.input"
                type="number"
                min="0"
                step="0.01"
                value={bankOpening}
                onChange={(e) => setBankOpening(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm w-40"
                style={{ borderColor: "#D1D5DB" }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="dashboard.opening_balance.save_button"
                onClick={handleSaveOpening}
                disabled={setOpeningBalance.isPending}
                className="flex items-center gap-1 text-sm px-4 py-2 rounded-md font-medium text-white"
                style={{ background: "#0D5EA8", cursor: "pointer" }}
              >
                {setOpeningBalance.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>सहेजें</span>
              </button>
              <button
                type="button"
                data-ocid="dashboard.opening_balance.cancel_button"
                onClick={() => setEditingOpening(false)}
                className="flex items-center gap-1 text-sm px-4 py-2 rounded-md font-medium"
                style={{
                  background: "#F3F4F6",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                <X className="w-4 h-4" />
                <span>रद्द करें</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6">
            <div
              className="text-center p-4 rounded-lg"
              style={{ background: "#EFF6FF" }}
            >
              <div className="text-xs" style={{ color: "#6B7280" }}>
                नकद प्रारम्भिक शेष
              </div>
              <div className="text-xl font-bold" style={{ color: "#0B3E74" }}>
                {opening ? formatRupee(opening.cashAmount) : "₹0"}
              </div>
            </div>
            <div
              className="text-center p-4 rounded-lg"
              style={{ background: "#F0F9FF" }}
            >
              <div className="text-xs" style={{ color: "#6B7280" }}>
                बैंक प्रारम्भिक शेष
              </div>
              <div className="text-xl font-bold" style={{ color: "#0D5EA8" }}>
                {opening ? formatRupee(opening.bankAmount) : "₹0"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Summary Table */}
      <div
        className="rounded-lg shadow-card overflow-hidden"
        style={{ background: "white" }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid #E5E7EB" }}
        >
          <h3 className="font-bold text-lg" style={{ color: "#0B3E74" }}>
            मद अनुसार सारांश ({fromDate.split("-")[2]}/{fromDate.split("-")[1]} –{" "}
            {toDate.split("-")[2]}/{toDate.split("-")[1]})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#0B3E74", color: "white" }}>
                <th className="px-4 py-3 text-left font-medium">मद</th>
                <th className="px-4 py-3 text-right font-medium">नकद प्राप्त</th>
                <th className="px-4 py-3 text-right font-medium">नकद खर्च</th>
                <th className="px-4 py-3 text-right font-medium">नकद शेष</th>
                <th className="px-4 py-3 text-right font-medium">बैंक प्राप्त</th>
                <th className="px-4 py-3 text-right font-medium">बैंक खर्च</th>
                <th className="px-4 py-3 text-right font-medium">बैंक शेष</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((row, i) => (
                <tr
                  key={row.category}
                  data-ocid={`dashboard.category.item.${i + 1}`}
                  style={{
                    background: i % 2 === 0 ? "white" : "#F9FAFB",
                    borderBottom: "1px solid #F3F4F6",
                  }}
                >
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: "#111827" }}
                  >
                    {row.label}
                  </td>
                  <td
                    className="px-4 py-3 text-right"
                    style={{ color: "#16a34a" }}
                  >
                    {formatRupee(row.cashReceived)}
                  </td>
                  <td
                    className="px-4 py-3 text-right"
                    style={{ color: "#dc2626" }}
                  >
                    {formatRupee(row.cashSpent)}
                  </td>
                  <td
                    className="px-4 py-3 text-right font-medium"
                    style={{
                      color: row.cashBalance >= 0 ? "#0B3E74" : "#dc2626",
                    }}
                  >
                    {formatRupee(row.cashBalance)}
                  </td>
                  <td
                    className="px-4 py-3 text-right"
                    style={{ color: "#16a34a" }}
                  >
                    {formatRupee(row.bankReceived)}
                  </td>
                  <td
                    className="px-4 py-3 text-right"
                    style={{ color: "#dc2626" }}
                  >
                    {formatRupee(row.bankSpent)}
                  </td>
                  <td
                    className="px-4 py-3 text-right font-medium"
                    style={{
                      color: row.bankBalance >= 0 ? "#0B3E74" : "#dc2626",
                    }}
                  >
                    {formatRupee(row.bankBalance)}
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr
                style={{
                  background: "#EFF6FF",
                  borderTop: "2px solid #0B3E74",
                }}
              >
                <td
                  className="px-4 py-3 font-bold"
                  style={{ color: "#0B3E74" }}
                >
                  कुल राशि
                </td>
                <td
                  className="px-4 py-3 text-right font-bold"
                  style={{ color: "#16a34a" }}
                >
                  {formatRupee(
                    categoryData.reduce((s, r) => s + r.cashReceived, 0),
                  )}
                </td>
                <td
                  className="px-4 py-3 text-right font-bold"
                  style={{ color: "#dc2626" }}
                >
                  {formatRupee(
                    categoryData.reduce((s, r) => s + r.cashSpent, 0),
                  )}
                </td>
                <td
                  className="px-4 py-3 text-right font-bold"
                  style={{ color: "#0B3E74" }}
                >
                  {formatRupee(
                    categoryData.reduce((s, r) => s + r.cashBalance, 0),
                  )}
                </td>
                <td
                  className="px-4 py-3 text-right font-bold"
                  style={{ color: "#16a34a" }}
                >
                  {formatRupee(
                    categoryData.reduce((s, r) => s + r.bankReceived, 0),
                  )}
                </td>
                <td
                  className="px-4 py-3 text-right font-bold"
                  style={{ color: "#dc2626" }}
                >
                  {formatRupee(
                    categoryData.reduce((s, r) => s + r.bankSpent, 0),
                  )}
                </td>
                <td
                  className="px-4 py-3 text-right font-bold"
                  style={{ color: "#0B3E74" }}
                >
                  {formatRupee(
                    categoryData.reduce((s, r) => s + r.bankBalance, 0),
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
