import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DashboardSummary {
    todayExpenses: bigint;
    cashBalance: bigint;
    bankBalance: bigint;
    todayReceipts: bigint;
}
export interface TransactionUpdate {
    transactionType: TransactionType;
    date: string;
    mode: Mode;
    description: string;
    voucherNumber: string;
    category: Category;
    amount: bigint;
}
export interface Summary {
    bankClosing: bigint;
    cashReceived: bigint;
    bankSpent: bigint;
    bankReceived: bigint;
    cashSpent: bigint;
    cashOpening: bigint;
    bankOpening: bigint;
    cashClosing: bigint;
}
export interface OpeningBalance {
    bankAmount: bigint;
    cashAmount: bigint;
}
export interface Transaction {
    id: bigint;
    transactionType: TransactionType;
    date: string;
    mode: Mode;
    createdAt: bigint;
    description: string;
    voucherNumber: string;
    category: Category;
    amount: bigint;
}
export enum Category {
    gasCylinder = "gasCylinder",
    cookHelperHonorarium = "cookHelperHonorarium",
    other = "other",
    sugar = "sugar",
    cookingConversion = "cookingConversion",
    milkWarmingHonorarium = "milkWarmingHonorarium"
}
export enum Mode {
    bank = "bank",
    cash = "cash"
}
export enum TransactionType {
    expense = "expense",
    receipt = "receipt"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTransaction(transaction: Transaction): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteTransaction(id: bigint): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardSummary(): Promise<DashboardSummary>;
    getOpeningBalance(): Promise<OpeningBalance>;
    getSummary(fromDate: string, toDate: string): Promise<Summary>;
    getTransaction(id: bigint): Promise<Transaction>;
    getTransactions(fromDate: string | null, toDate: string | null, category: Category | null, transactionType: TransactionType | null, mode: Mode | null): Promise<Array<Transaction>>;
    isCallerAdmin(): Promise<boolean>;
    setOpeningBalance(balance: OpeningBalance): Promise<void>;
    updateTransaction(id: bigint, transaction: TransactionUpdate): Promise<void>;
}
