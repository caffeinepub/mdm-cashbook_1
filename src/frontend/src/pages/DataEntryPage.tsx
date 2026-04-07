import { Loader2, PlusCircle, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Category, Mode, TransactionType } from "../backend";
import { useAddTransaction } from "../hooks/useQueries";
import { CATEGORY_ORDER, getCategoryLabel } from "../utils/categories";
import { rupeesToPaise, todayStr } from "../utils/format";

const EMPTY_FORM = {
  date: todayStr(),
  category: Category.cookingConversion as Category,
  transactionType: TransactionType.receipt as TransactionType,
  mode: Mode.cash as Mode,
  amount: "",
  voucherNumber: "",
  description: "",
};

export function DataEntryPage() {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const addTransaction = useAddTransaction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || Number.parseFloat(form.amount) <= 0) {
      toast.error("कृपया वैध राशि दर्ज करें");
      return;
    }
    if (!form.date) {
      toast.error("कृपया दिनांक चुनें");
      return;
    }
    try {
      await addTransaction.mutateAsync({
        id: BigInt(0),
        date: form.date,
        category: form.category,
        transactionType: form.transactionType,
        mode: form.mode,
        amount: BigInt(rupeesToPaise(form.amount)),
        voucherNumber: form.voucherNumber,
        description: form.description,
        createdAt: BigInt(Date.now()),
      });
      toast.success("लेनदेन सफलतापूर्वक सहेजा गया");
      setForm({ ...EMPTY_FORM, date: todayStr() });
    } catch {
      toast.error("लेनदेन सहेजने में त्रुटि हुई");
    }
  };

  const handleReset = () => {
    setForm({ ...EMPTY_FORM, date: todayStr() });
  };

  const fieldStyle = {
    width: "100%",
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: "14px",
    outline: "none",
    fontFamily: "'Noto Sans Devanagari', sans-serif",
  };

  const labelBaseStyle = {
    fontSize: "13px",
    fontWeight: "600" as const,
    color: "#374151",
    display: "block",
    marginBottom: "4px",
    fontFamily: "'Noto Sans Devanagari', sans-serif",
  };

  return (
    <div className="max-w-2xl">
      <div className="rounded-lg shadow-card" style={{ background: "white" }}>
        <div
          className="px-6 py-4"
          style={{ borderBottom: "1px solid #E5E7EB" }}
        >
          <h2 className="text-xl font-bold" style={{ color: "#0B3E74" }}>
            डेटा एंट्री
          </h2>
          <p className="text-sm" style={{ color: "#6B7280" }}>
            नया लेनदेन जोड़ें
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-5"
          data-ocid="data_entry.form"
        >
          {/* Date */}
          <div>
            <label htmlFor="entry-date" style={labelBaseStyle}>
              दिनांक *
            </label>
            <input
              id="entry-date"
              data-ocid="data_entry.date.input"
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              required
              style={fieldStyle}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="entry-category" style={labelBaseStyle}>
              मद / श्रेणी *
            </label>
            <select
              id="entry-category"
              data-ocid="data_entry.category.select"
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value as Category }))
              }
              style={fieldStyle}
            >
              {CATEGORY_ORDER.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Type */}
          <div>
            <div style={labelBaseStyle}>प्रकार *</div>
            <div className="flex gap-3">
              <label
                htmlFor="type-receipt"
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  id="type-receipt"
                  data-ocid="data_entry.type_receipt.radio"
                  type="radio"
                  name="transactionType"
                  value={TransactionType.receipt}
                  checked={form.transactionType === TransactionType.receipt}
                  onChange={() =>
                    setForm((p) => ({
                      ...p,
                      transactionType: TransactionType.receipt,
                    }))
                  }
                  className="w-4 h-4"
                  style={{ accentColor: "#0D5EA8" }}
                />
                <span style={{ color: "#16a34a", fontWeight: 600 }}>
                  प्राप्ति (जमा)
                </span>
              </label>
              <label
                htmlFor="type-expense"
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  id="type-expense"
                  data-ocid="data_entry.type_expense.radio"
                  type="radio"
                  name="transactionType"
                  value={TransactionType.expense}
                  checked={form.transactionType === TransactionType.expense}
                  onChange={() =>
                    setForm((p) => ({
                      ...p,
                      transactionType: TransactionType.expense,
                    }))
                  }
                  className="w-4 h-4"
                  style={{ accentColor: "#dc2626" }}
                />
                <span style={{ color: "#dc2626", fontWeight: 600 }}>
                  खर्च (निकासी)
                </span>
              </label>
            </div>
          </div>

          {/* Mode */}
          <div>
            <div style={labelBaseStyle}>माध्यम *</div>
            <div className="flex gap-3">
              <label
                htmlFor="mode-cash"
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  id="mode-cash"
                  data-ocid="data_entry.mode_cash.radio"
                  type="radio"
                  name="mode"
                  value={Mode.cash}
                  checked={form.mode === Mode.cash}
                  onChange={() => setForm((p) => ({ ...p, mode: Mode.cash }))}
                  className="w-4 h-4"
                  style={{ accentColor: "#0D5EA8" }}
                />
                <span>नकद</span>
              </label>
              <label
                htmlFor="mode-bank"
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  id="mode-bank"
                  data-ocid="data_entry.mode_bank.radio"
                  type="radio"
                  name="mode"
                  value={Mode.bank}
                  checked={form.mode === Mode.bank}
                  onChange={() => setForm((p) => ({ ...p, mode: Mode.bank }))}
                  className="w-4 h-4"
                  style={{ accentColor: "#0D5EA8" }}
                />
                <span>बैंक</span>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="entry-amount" style={labelBaseStyle}>
              राशि (₹) *
            </label>
            <input
              id="entry-amount"
              data-ocid="data_entry.amount.input"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) =>
                setForm((p) => ({ ...p, amount: e.target.value }))
              }
              placeholder="राशि दर्ज करें"
              required
              style={fieldStyle}
            />
          </div>

          {/* Voucher Number */}
          <div>
            <label htmlFor="entry-voucher" style={labelBaseStyle}>
              वाउचर / रसीद संख्या
            </label>
            <input
              id="entry-voucher"
              data-ocid="data_entry.voucher.input"
              type="text"
              value={form.voucherNumber}
              onChange={(e) =>
                setForm((p) => ({ ...p, voucherNumber: e.target.value }))
              }
              placeholder="वाउचर नंबर"
              style={fieldStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="entry-description" style={labelBaseStyle}>
              विवरण
            </label>
            <textarea
              id="entry-description"
              data-ocid="data_entry.description.textarea"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="विवरण दर्ज करें (वैकल्पिक)"
              rows={3}
              style={{ ...fieldStyle, resize: "vertical" }}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              data-ocid="data_entry.submit_button"
              type="submit"
              disabled={addTransaction.isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white text-sm"
              style={{
                background: addTransaction.isPending ? "#93c5fd" : "#0D5EA8",
                cursor: addTransaction.isPending ? "not-allowed" : "pointer",
              }}
            >
              {addTransaction.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>सहेज रहा है...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>सहेजें</span>
                </>
              )}
            </button>
            <button
              data-ocid="data_entry.cancel_button"
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm"
              style={{
                background: "#F3F4F6",
                color: "#374151",
                cursor: "pointer",
              }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>रीसेट करें</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
