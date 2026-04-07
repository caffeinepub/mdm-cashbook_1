import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  OpeningBalance,
  Transaction,
  TransactionUpdate,
} from "../backend";
import type { Category, Mode, TransactionType } from "../backend";
import { useActor } from "./useActor";

export function useDashboardSummary() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOpeningBalance() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["openingBalance"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getOpeningBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSummary(fromDate: string, toDate: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["summary", fromDate, toDate],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSummary(fromDate, toDate);
    },
    enabled: !!actor && !isFetching && !!fromDate && !!toDate,
  });
}

export function useTransactions(
  fromDate: string | null = null,
  toDate: string | null = null,
  category: Category | null = null,
  transactionType: TransactionType | null = null,
  mode: Mode | null = null,
) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: [
      "transactions",
      fromDate,
      toDate,
      category,
      transactionType,
      mode,
    ],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactions(
        fromDate,
        toDate,
        category,
        transactionType,
        mode,
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetOpeningBalance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (balance: OpeningBalance) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setOpeningBalance(balance);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["openingBalance"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: Transaction) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addTransaction(transaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}

export function useUpdateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      update,
    }: { id: bigint; update: TransactionUpdate }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTransaction(id, update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteTransaction(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}
