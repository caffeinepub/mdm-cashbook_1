import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // ---------- Types ----------
  type Category = {
    #cookingConversion;
    #cookHelperHonorarium;
    #milkWarmingHonorarium;
    #gasCylinder;
    #sugar;
    #other;
  };

  type TransactionType = {
    #receipt;
    #expense;
  };

  type Mode = {
    #cash;
    #bank;
  };

  type OpeningBalance = {
    cashAmount : Nat;
    bankAmount : Nat;
  };

  module OpeningBalance {
    public func compare(a : OpeningBalance, b : OpeningBalance) : Order.Order {
      Int.compare(a.cashAmount + b.bankAmount, b.cashAmount + b.bankAmount);
    };
  };

  type Transaction = {
    id : Nat;
    date : Text;
    category : Category;
    transactionType : TransactionType;
    mode : Mode;
    amount : Nat;
    voucherNumber : Text;
    description : Text;
    createdAt : Int;
  };

  module Transaction {
    public func compare(a : Transaction, b : Transaction) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type TransactionUpdate = {
    date : Text;
    category : Category;
    transactionType : TransactionType;
    mode : Mode;
    amount : Nat;
    voucherNumber : Text;
    description : Text;
  };

  type Summary = {
    cashOpening : Nat;
    bankOpening : Nat;
    cashReceived : Nat;
    bankReceived : Nat;
    cashSpent : Nat;
    bankSpent : Nat;
    cashClosing : Nat;
    bankClosing : Nat;
  };

  type DashboardSummary = {
    cashBalance : Nat;
    bankBalance : Nat;
    todayReceipts : Nat;
    todayExpenses : Nat;
  };

  // ---------- Utilities ----------
  func getTransactionInternal(id : Nat) : Transaction {
    switch (transactionsMap.get(id)) {
      case (?transaction) { transaction };
      case (null) { Runtime.trap("Transaction not found") };
    };
  };

  func filterTransactions(
    fromDate : ?Text,
    toDate : ?Text,
    category : ?Category,
    transactionType : ?TransactionType,
    mode : ?Mode,
  ) : [Transaction] {
    createTransactionsList().toArray().filter(
      func(txn) {
        let dateInRange = switch (fromDate, toDate) {
          case (?from, ?to) {
            txn.date >= from and txn.date <= to;
          };
          case (?from, null) { txn.date >= from };
          case (null, ?to) { txn.date <= to };
          case (null, null) { true };
        };

        let categoryMatch = switch (category) {
          case (?cat) { txn.category == cat };
          case (null) { true };
        };

        let typeMatch = switch (transactionType) {
          case (?t) { txn.transactionType == t };
          case (null) { true };
        };

        let modeMatch = switch (mode) {
          case (?m) { txn.mode == m };
          case (null) { true };
        };

        dateInRange and categoryMatch and typeMatch and modeMatch;
      }
    );
  };

  func createTransactionsList() : List.List<Transaction> {
    let list = List.empty<Transaction>();
    for ((_, txn) in transactionsMap.entries()) {
      list.add(txn);
    };
    list;
  };

  func calculateSummary(fromDate : Text, toDate : Text) : Summary {
    var cashOpening = openingBalance.cashAmount : Int;
    var bankOpening = openingBalance.bankAmount : Int;
    var cashReceived = 0;
    var bankReceived = 0;
    var cashSpent = 0;
    var bankSpent = 0;

    for (txn in transactionsMap.values()) {
      if (txn.date < fromDate) {
        switch (txn.mode, txn.transactionType) {
          case (#cash, #receipt) { cashOpening += txn.amount };
          case (#bank, #receipt) { bankOpening += txn.amount };
          case (#cash, #expense) { cashOpening -= txn.amount };
          case (#bank, #expense) { bankOpening -= txn.amount };
        };
      } else if (txn.date >= fromDate and txn.date <= toDate) {
        switch (txn.mode, txn.transactionType) {
          case (#cash, #receipt) { cashReceived += txn.amount };
          case (#bank, #receipt) { bankReceived += txn.amount };
          case (#cash, #expense) { cashSpent += txn.amount };
          case (#bank, #expense) { bankSpent += txn.amount };
        };
      };
    };

    {
      cashOpening = cashOpening.toNat();
      bankOpening = bankOpening.toNat();
      cashReceived;
      bankReceived;
      cashSpent;
      bankSpent;
      cashClosing = (cashOpening + cashReceived - cashSpent).toNat();
      bankClosing = (bankOpening + bankReceived - bankSpent).toNat();
    };
  };

  func calculateDashboardSummary() : DashboardSummary {
    var cashBalance = openingBalance.cashAmount;
    var bankBalance = openingBalance.bankAmount;
    var todayReceipts = 0;
    var todayExpenses = 0;
    let todayDate = timeToDateString(Time.now());

    for (txn in transactionsMap.values()) {
      switch (txn.mode, txn.transactionType) {
        case (#cash, #receipt) { cashBalance += txn.amount };
        case (#bank, #receipt) { bankBalance += txn.amount };
        case (#cash, #expense) { cashBalance -= txn.amount };
        case (#bank, #expense) { bankBalance -= txn.amount };
      };

      if (txn.date == todayDate) {
        switch (txn.transactionType) {
          case (#receipt) { todayReceipts += txn.amount };
          case (#expense) { todayExpenses += txn.amount };
        };
      };
    };

    {
      cashBalance;
      bankBalance;
      todayReceipts;
      todayExpenses;
    };
  };

  func timeToDateString(time : Int) : Text {
    let secondsInDay = 24 * 60 * 60;
    let startTime : Int = 1_530_000_000;
    let daysSinceStart = (time - startTime) / secondsInDay;
    let totalDays = 19_999 * 365 + daysSinceStart : Int;
    let year = totalDays / 365 + 1530_000;
    let daysInYear = totalDays % 365;
    let month = daysInYear / 30 + 1;
    let day = daysInYear % 30 + 1;
    let yearText = year.toText();
    let monthText = if (month < 10) { "0" # month.toText() } else {
      month.toText();
    };
    let dayText = if (day < 10) { "0" # day.toText() } else { day.toText() };
    yearText # "-" # monthText # "-" # dayText;
  };

  // ---------- State ----------
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let transactionsMap = Map.empty<Nat, Transaction>();
  var nextTransactionId = 1;
  var openingBalance : OpeningBalance = {
    cashAmount = 0;
    bankAmount = 0;
  };

  // ---------- Opening Balance ----------
  public shared ({ caller }) func setOpeningBalance(balance : OpeningBalance) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set opening balance");
    };
    openingBalance := balance;
  };

  public query ({ caller }) func getOpeningBalance() : async OpeningBalance {
    if (AccessControl.getUserRole(accessControlState, caller) == #guest) {
      Runtime.trap("Unauthorized: Only authenticated users can view opening balance");
    };
    openingBalance;
  };

  // ---------- Transactions ----------
  public shared ({ caller }) func addTransaction(transaction : Transaction) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add transactions");
    };
    let id = nextTransactionId;
    nextTransactionId += 1;
    let newTransaction : Transaction = {
      transaction with
      id;
      createdAt = Time.now();
    };
    transactionsMap.add(id, newTransaction);
    id;
  };

  public shared ({ caller }) func updateTransaction(id : Nat, transaction : TransactionUpdate) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update transactions");
    };

    let oldTransaction = getTransactionInternal(id);
    let updatedTransaction = {
      oldTransaction with transaction
    };
    transactionsMap.add(id, updatedTransaction);
  };

  public shared ({ caller }) func deleteTransaction(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete transactions");
    };
    ignore getTransactionInternal(id);
    transactionsMap.remove(id);
  };

  public query ({ caller }) func getTransactions(
    fromDate : ?Text,
    toDate : ?Text,
    category : ?Category,
    transactionType : ?TransactionType,
    mode : ?Mode,
  ) : async [Transaction] {
    if (AccessControl.getUserRole(accessControlState, caller) == #guest) {
      Runtime.trap("Unauthorized: Only authenticated users can view transactions");
    };
    filterTransactions(fromDate, toDate, category, transactionType, mode);
  };

  public query ({ caller }) func getTransaction(id : Nat) : async Transaction {
    if (AccessControl.getUserRole(accessControlState, caller) == #guest) {
      Runtime.trap("Unauthorized: Only authenticated users can view transactions");
    };
    getTransactionInternal(id);
  };

  // ---------- Summary ----------
  public query ({ caller }) func getSummary(fromDate : Text, toDate : Text) : async Summary {
    if (AccessControl.getUserRole(accessControlState, caller) == #guest) {
      Runtime.trap("Unauthorized: Only authenticated users can view summary");
    };
    calculateSummary(fromDate, toDate);
  };

  public query ({ caller }) func getDashboardSummary() : async DashboardSummary {
    if (AccessControl.getUserRole(accessControlState, caller) == #guest) {
      Runtime.trap("Unauthorized: Only authenticated users can view dashboard summary");
    };
    calculateDashboardSummary();
  };
};
