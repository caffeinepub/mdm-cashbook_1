import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Edit2, Filter, Loader2, Search, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Category,
  Mode,
  type Transaction,
  TransactionType,
  type TransactionUpdate,
} from "../backend";
import {
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from "../hooks/useQueries";
import { CATEGORY_ORDER, getCategoryLabel } from "../utils/categories";
import {
  firstDayOfMonth,
  formatDate,
  formatRupee,
  paiseToRupeeStr,
  rupeesToPaise,
  todayStr,
} from "../utils/format";

export function TransactionsPage() {
  const [fromDate, setFromDate] = useState(firstDayOfMonth());
  const [toDate, setToDate] = useState(todayStr());
  const [filterCategory, setFilterCategory] = useState<Category | "">("");
  const [filterType, setFilterType] = useState<TransactionType | "">("");
  const [filterMode, setFilterMode] = useState<Mode | "">("");
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: firstDayOfMonth(),
    toDate: todayStr(),
    category: null as Category | null,
    type: null as TransactionType | null,
    mode: null as Mode | null,
  });

  const { data: transactions, isLoading } = useTransactions(
    appliedFilters.fromDate || null,
    appliedFilters.toDate || null,
    appliedFilters.category,
    appliedFilters.type,
    appliedFilters.mode,
  );

  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  // Edit state
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState<Partial<TransactionUpdate>>({});
  // Delete confirm
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const applyFilters = () => {
    setAppliedFilters({
      fromDate,
      toDate,
      category: filterCategory?.trim() ? (filterCategory as Category) : null,
      type: filterType?.trim() ? (filterType as TransactionType) : null,
      mode: filterMode?.trim() ? (filterMode as Mode) : null,
    });
  };

  const handleEdit = (txn: Transaction) => {
    setEditingTxn(txn);
    setEditForm({
      date: txn.date,
      category: txn.category,
      transactionType: txn.transactionType,
      mode: txn.mode,
      amount: txn.amount,
      voucherNumber: txn.voucherNumber,
      description: txn.description,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTxn) return;
    try {
      await updateTransaction.mutateAsync({
        id: editingTxn.id,
        update: editForm as TransactionUpdate,
      });
      toast.success("लेनदेन अपडेट किया गया");
      setEditingTxn(null);
    } catch {
      toast.error("लेनदेन अपडेट करने में त्रुटि");
    }
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    try {
      await deleteTransaction.mutateAsync(deletingId);
      toast.success("लेनदेन हटाया गया");
      setDeletingId(null);
    } catch {
      toast.error("लेनदेन हटाने में त्रुटि");
    }
  };

  const selectStyle = {
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    padding: "6px 10px",
    fontSize: "13px",
    fontFamily: "'Noto Sans Devanagari', sans-serif",
    background: "white",
  };

  const inputStyle = {
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    padding: "6px 10px",
    fontSize: "13px",
    fontFamily: "'Noto Sans Devanagari', sans-serif",
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div
        className="rounded-lg shadow-card p-4"
        style={{ background: "white" }}
      >
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <div
              className="text-xs font-medium mb-1"
              style={{ color: "#374151" }}
            >
              दिनांक से
            </div>
            <input
              data-ocid="transactions.from_date.input"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <div
              className="text-xs font-medium mb-1"
              style={{ color: "#374151" }}
            >
              दिनांक तक
            </div>
            <input
              data-ocid="transactions.to_date.input"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <div
              className="text-xs font-medium mb-1"
              style={{ color: "#374151" }}
            >
              मद
            </div>
            <select
              data-ocid="transactions.category.select"
              value={filterCategory}
              onChange={(e) =>
                setFilterCategory(e.target.value as Category | "")
              }
              style={selectStyle}
            >
              <option value="">सभी मद</option>
              {CATEGORY_ORDER.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div
              className="text-xs font-medium mb-1"
              style={{ color: "#374151" }}
            >
              प्रकार
            </div>
            <select
              data-ocid="transactions.type.select"
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as TransactionType | "")
              }
              style={selectStyle}
            >
              <option value="">सभी प्रकार</option>
              <option value={TransactionType.receipt}>प्राप्ति</option>
              <option value={TransactionType.expense}>खर्च</option>
            </select>
          </div>
          <div>
            <div
              className="text-xs font-medium mb-1"
              style={{ color: "#374151" }}
            >
              माध्यम
            </div>
            <select
              data-ocid="transactions.mode.select"
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as Mode | "")}
              style={selectStyle}
            >
              <option value="">सभी माध्यम</option>
              <option value={Mode.cash}>नकद</option>
              <option value={Mode.bank}>बैंक</option>
            </select>
          </div>
          <button
            type="button"
            data-ocid="transactions.filter.button"
            onClick={applyFilters}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white"
            style={{ background: "#0D5EA8", cursor: "pointer" }}
          >
            <Search className="w-4 h-4" />
            <span>खोजें</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div
        className="rounded-lg shadow-card overflow-hidden"
        style={{ background: "white" }}
      >
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid #E5E7EB" }}
        >
          <h2 className="font-bold text-lg" style={{ color: "#0B3E74" }}>
            लेनदेन सूची
          </h2>
          <span className="text-sm" style={{ color: "#6B7280" }}>
            {transactions?.length ?? 0} लेनदेन
          </span>
        </div>

        {isLoading ? (
          <div
            className="flex items-center justify-center py-12"
            data-ocid="transactions.loading_state"
          >
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "#0B3E74" }}
            />
            <span className="ml-2" style={{ color: "#6B7280" }}>
              लोड हो रहा है...
            </span>
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div
            className="text-center py-12"
            data-ocid="transactions.empty_state"
          >
            <Filter
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "#D1D5DB" }}
            />
            <p className="text-sm" style={{ color: "#6B7280" }}>
              कोई लेनदेन नहीं मिला
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs" data-ocid="transactions.table">
              <thead>
                <tr style={{ background: "#0B3E74", color: "white" }}>
                  <th className="px-3 py-3 text-left font-medium">#</th>
                  <th className="px-3 py-3 text-left font-medium">दिनांक</th>
                  <th className="px-3 py-3 text-left font-medium">मद</th>
                  <th className="px-3 py-3 text-left font-medium">प्रकार</th>
                  <th className="px-3 py-3 text-left font-medium">माध्यम</th>
                  <th className="px-3 py-3 text-right font-medium">राशि</th>
                  <th className="px-3 py-3 text-left font-medium">वाउचर सं.</th>
                  <th className="px-3 py-3 text-left font-medium">विवरण</th>
                  <th className="px-3 py-3 text-center font-medium">क्रिया</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, i) => (
                  <tr
                    key={String(txn.id)}
                    data-ocid={`transactions.item.${i + 1}`}
                    style={{
                      background: i % 2 === 0 ? "white" : "#F9FAFB",
                      borderBottom: "1px solid #F3F4F6",
                    }}
                  >
                    <td className="px-3 py-3" style={{ color: "#6B7280" }}>
                      {i + 1}
                    </td>
                    <td className="px-3 py-3" style={{ color: "#374151" }}>
                      {formatDate(txn.date)}
                    </td>
                    <td
                      className="px-3 py-3 font-medium"
                      style={{ color: "#111827" }}
                    >
                      {getCategoryLabel(txn.category)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background:
                            txn.transactionType === TransactionType.receipt
                              ? "#DCFCE7"
                              : "#FEE2E2",
                          color:
                            txn.transactionType === TransactionType.receipt
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {txn.transactionType === TransactionType.receipt
                          ? "प्राप्ति"
                          : "खर्च"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background:
                            txn.mode === Mode.cash ? "#FEF9C3" : "#EFF6FF",
                          color: txn.mode === Mode.cash ? "#854d0e" : "#1d4ed8",
                        }}
                      >
                        {txn.mode === Mode.cash ? "नकद" : "बैंक"}
                      </span>
                    </td>
                    <td
                      className="px-3 py-3 text-right font-bold"
                      style={{
                        color:
                          txn.transactionType === TransactionType.receipt
                            ? "#16a34a"
                            : "#dc2626",
                      }}
                    >
                      {formatRupee(txn.amount)}
                    </td>
                    <td className="px-3 py-3" style={{ color: "#374151" }}>
                      {txn.voucherNumber || "—"}
                    </td>
                    <td
                      className="px-3 py-3 max-w-[120px] truncate"
                      style={{ color: "#374151" }}
                    >
                      {txn.description || "—"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          data-ocid={`transactions.edit_button.${i + 1}`}
                          onClick={() => handleEdit(txn)}
                          className="p-1.5 rounded"
                          style={{
                            background: "#EFF6FF",
                            color: "#0D5EA8",
                            cursor: "pointer",
                          }}
                          title="संपादित करें"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          data-ocid={`transactions.delete_button.${i + 1}`}
                          onClick={() => setDeletingId(txn.id)}
                          className="p-1.5 rounded"
                          style={{
                            background: "#FEF2F2",
                            color: "#dc2626",
                            cursor: "pointer",
                          }}
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingTxn}
        onOpenChange={(open) => !open && setEditingTxn(null)}
      >
        <DialogContent
          className="max-w-md"
          data-ocid="transactions.edit.dialog"
        >
          <DialogHeader>
            <DialogTitle
              style={{
                color: "#0B3E74",
                fontFamily: "'Noto Sans Devanagari', sans-serif",
              }}
            >
              लेनदेन संपादित करें
            </DialogTitle>
          </DialogHeader>
          {editingTxn && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit-date"
                  className="text-sm font-medium block mb-1"
                  style={{ color: "#374151" }}
                >
                  दिनांक
                </label>
                <input
                  id="edit-date"
                  data-ocid="transactions.edit_date.input"
                  type="date"
                  value={editForm.date ?? ""}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, date: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  style={{ borderColor: "#D1D5DB" }}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-category"
                  className="text-sm font-medium block mb-1"
                  style={{ color: "#374151" }}
                >
                  मद
                </label>
                <select
                  id="edit-category"
                  data-ocid="transactions.edit_category.select"
                  value={editForm.category ?? ""}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      category: e.target.value as Category,
                    }))
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  style={{
                    borderColor: "#D1D5DB",
                    fontFamily: "'Noto Sans Devanagari', sans-serif",
                  }}
                >
                  {CATEGORY_ORDER.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="edit-type"
                    className="text-sm font-medium block mb-1"
                    style={{ color: "#374151" }}
                  >
                    प्रकार
                  </label>
                  <select
                    id="edit-type"
                    data-ocid="transactions.edit_type.select"
                    value={editForm.transactionType ?? ""}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        transactionType: e.target.value as TransactionType,
                      }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    style={{
                      borderColor: "#D1D5DB",
                      fontFamily: "'Noto Sans Devanagari', sans-serif",
                    }}
                  >
                    <option value={TransactionType.receipt}>प्राप्ति</option>
                    <option value={TransactionType.expense}>खर्च</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="edit-mode"
                    className="text-sm font-medium block mb-1"
                    style={{ color: "#374151" }}
                  >
                    माध्यम
                  </label>
                  <select
                    id="edit-mode"
                    data-ocid="transactions.edit_mode.select"
                    value={editForm.mode ?? ""}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        mode: e.target.value as Mode,
                      }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    style={{
                      borderColor: "#D1D5DB",
                      fontFamily: "'Noto Sans Devanagari', sans-serif",
                    }}
                  >
                    <option value={Mode.cash}>नकद</option>
                    <option value={Mode.bank}>बैंक</option>
                  </select>
                </div>
              </div>
              <div>
                <label
                  htmlFor="edit-amount"
                  className="text-sm font-medium block mb-1"
                  style={{ color: "#374151" }}
                >
                  राशि (₹)
                </label>
                <input
                  id="edit-amount"
                  data-ocid="transactions.edit_amount.input"
                  type="number"
                  value={
                    editForm.amount ? paiseToRupeeStr(editForm.amount) : ""
                  }
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      amount: BigInt(rupeesToPaise(e.target.value)),
                    }))
                  }
                  step="0.01"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  style={{ borderColor: "#D1D5DB" }}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-voucher"
                  className="text-sm font-medium block mb-1"
                  style={{ color: "#374151" }}
                >
                  वाउचर संख्या
                </label>
                <input
                  id="edit-voucher"
                  data-ocid="transactions.edit_voucher.input"
                  type="text"
                  value={editForm.voucherNumber ?? ""}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      voucherNumber: e.target.value,
                    }))
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  style={{ borderColor: "#D1D5DB" }}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-description"
                  className="text-sm font-medium block mb-1"
                  style={{ color: "#374151" }}
                >
                  विवरण
                </label>
                <textarea
                  id="edit-description"
                  data-ocid="transactions.edit_description.textarea"
                  value={editForm.description ?? ""}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  style={{
                    borderColor: "#D1D5DB",
                    fontFamily: "'Noto Sans Devanagari', sans-serif",
                  }}
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <button
              type="button"
              data-ocid="transactions.edit.cancel_button"
              onClick={() => setEditingTxn(null)}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                background: "#F3F4F6",
                color: "#374151",
                cursor: "pointer",
              }}
            >
              <span className="flex items-center gap-1">
                <X className="w-4 h-4" />
                रद्द
              </span>
            </button>
            <button
              type="button"
              data-ocid="transactions.edit.save_button"
              onClick={handleSaveEdit}
              disabled={updateTransaction.isPending}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-1"
              style={{ background: "#0D5EA8", cursor: "pointer" }}
            >
              {updateTransaction.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>सहेजें</span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent data-ocid="transactions.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle
              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            >
              लेनदेन हटाएं?
            </AlertDialogTitle>
            <AlertDialogDescription
              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            >
              क्या आप वाकई इस लेनदेन को हटाना चाहते हैं? यह क्रिया वापस नहीं की जा सकती।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="transactions.delete.cancel_button"
              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            >
              रद्द करें
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="transactions.delete.confirm_button"
              onClick={handleDelete}
              style={{
                background: "#dc2626",
                fontFamily: "'Noto Sans Devanagari', sans-serif",
              }}
            >
              {deleteTransaction.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              हटाएं
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
