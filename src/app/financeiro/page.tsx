
"use client";
import AppHeader from "@/components/AppHeader";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Wallet = {
  id: string;
  name: string;
  account_type: string;
  balance: number | string;
};

type Debt = {
  id: string;
  name: string;
  creditor?: string | null;
  amount: number | string;
  paid_amount?: number | string | null;
  due_date: string;
  status: string;
  category?: string | null;
};

type Payment = {
  id: string;
  debt_id: string;
  account_id: string;
  amount: number | string;
  paid_at: string;
  created_at?: string;
};


type FinancialExpense = {
  id: string;
  name: string;
  category: string;
  amount: number | string;
  expense_date: string;
  habit_entry_id?: string | null;
  notes?: string | null;
};

type ControlAccount = {
  id: string;
  name: string;
  account_type: string;
  amount: number | string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  status: string;
};

const money = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const numberValue = (value: number | string | null | undefined) =>
  Number(value ?? 0);

function remaining(debt: Debt) {
  return Math.max(
    0,
    numberValue(debt.amount) - numberValue(debt.paid_amount),
  );
}

function debtStatus(debt: Debt) {
  if (remaining(debt) <= 0 || debt.status === "pago") return "Pago";

  if (debt.due_date) {
    const due = new Date(`${debt.due_date}T12:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = Math.ceil(
      (due.getTime() - today.getTime()) / 86_400_000,
    );

    if (days < 0) return "Atrasado";
    if (days <= 3) return "Vence em breve";
  }

  return "Pendente";
}

export default function FinanceiroPage() {
  const supabase = getSupabaseBrowserClient();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<FinancialExpense[]>([]);
  const [controlAccounts, setControlAccounts] = useState<ControlAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedDebt, setSelectedDebt] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toLocaleDateString("en-CA"),
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;

      const user = authData.user;

      if (!user) {
        window.location.href = "/login";
        return;
      }
      const [walletResult, debtResult, paymentResult, expenseResult, controlResult] = await Promise.all([
        supabase
          .from("wallet_accounts")
          .select("id,name,account_type,balance")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),

        supabase
          .from("debts")
          .select("*")
          .eq("user_id", user.id)
          .order("due_date", { ascending: true }),

        supabase
          .from("debt_payments")
          .select("id,debt_id,account_id,amount,paid_at,created_at")
          .eq("user_id", user.id)
          .order("paid_at", { ascending: false }),

        supabase
          .from("financial_expenses")
          .select("id,name,category,amount,expense_date,habit_entry_id,notes")
          .eq("user_id", user.id)
          .order("expense_date", { ascending: false }),

        supabase
          .from("control_accounts")
          .select("id,name,account_type,amount,due_date,paid_at,created_at,status")
          .eq("user_id", user.id)
          .order("due_date", { ascending: true }),
      ]);

      if (walletResult.error) throw walletResult.error;
      if (debtResult.error) throw debtResult.error;
      if (paymentResult.error) throw paymentResult.error;
      if (controlResult.error) throw controlResult.error;

      // Permite abrir a página antes da migração ser aplicada.
      // Depois da migração, erros de acesso ou outros erros continuam visíveis.
      const expensesTableMissing =
        expenseResult.error?.code === "42P01" ||
        expenseResult.error?.code === "PGRST205";

      if (expenseResult.error && !expensesTableMissing) {
        throw expenseResult.error;
      }

      setWallets((walletResult.data ?? []) as Wallet[]);
      setDebts((debtResult.data ?? []) as Debt[]);
      setPayments((paymentResult.data ?? []) as Payment[]);
      setExpenses(
        expensesTableMissing
          ? []
          : ((expenseResult.data ?? []) as FinancialExpense[]),
      );
      setControlAccounts((controlResult.data ?? []) as ControlAccount[]);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os dados financeiros.",
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const debtId = new URLSearchParams(window.location.search).get("debt");
    if (!debtId || selectedDebt) return;

    const debt = debts.find((item) => item.id === debtId);
    if (!debt || remaining(debt) <= 0) return;

    setSelectedDebt(debt.id);
    setPaymentAmount((remaining(debt)).toFixed(2).replace(".", ","));
  }, [debts, selectedDebt]);

  const totalWallets = wallets.reduce(
    (sum, wallet) => sum + numberValue(wallet.balance),
    0,
  );

  const totalDebt = debts.reduce(
    (sum, debt) => sum + numberValue(debt.amount),
    0,
  );

  const totalPaid = debts.reduce(
    (sum, debt) => sum + numberValue(debt.paid_amount),
    0,
  );

  const totalRemaining = debts.reduce(
    (sum, debt) => sum + remaining(debt),
    0,
  );

  const overdueTotal = debts
    .filter((debt) => debtStatus(debt) === "Atrasado")
    .reduce((sum, debt) => sum + remaining(debt), 0);

  // A tabela já reúne despesas comuns e despesas originadas em Hábitos.
  // Não somamos habit_entry_id separadamente para evitar duplicidade.
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + numberValue(expense.amount),
    0,
  );

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;
  const monthlyExpenses = expenses
    .filter((expense) => expense.expense_date?.slice(0, 7) === currentMonth)
    .reduce((sum, expense) => sum + numberValue(expense.amount), 0);

  // Contas cadastradas: pagamentos usam paid_at; pendências usam vencimento.
  const monthAccounts = controlAccounts.filter((account) => {
    if (account.status === "cancelado") return false;
    const date = account.status === "pago"
      ? account.paid_at || account.due_date || account.created_at
      : account.due_date || account.created_at;
    return date?.slice(0, 7) === currentMonth;
  });

  const receivedIncome = monthAccounts
    .filter((account) => account.account_type === "receita" && account.status === "pago")
    .reduce((sum, account) => sum + numberValue(account.amount), 0);

  const pendingIncome = monthAccounts
    .filter((account) => account.account_type === "receita" && account.status === "pendente")
    .reduce((sum, account) => sum + numberValue(account.amount), 0);

  const paidAccounts = monthAccounts
    .filter((account) => account.account_type !== "receita" && account.status === "pago")
    .reduce((sum, account) => sum + numberValue(account.amount), 0);

  const pendingAccounts = monthAccounts
    .filter((account) => account.account_type !== "receita" && account.status === "pendente")
    .reduce((sum, account) => sum + numberValue(account.amount), 0);

  const todayDate = new Date();
  const todayKey = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, "0")}-${String(todayDate.getDate()).padStart(2, "0")}`;
  const overdueAccounts = controlAccounts.filter((account) =>
    account.status === "pendente" &&
    account.account_type !== "receita" &&
    account.due_date &&
    account.due_date < todayKey
  );

  const overdueAccountsTotal = overdueAccounts.reduce(
    (sum, account) => sum + numberValue(account.amount), 0
  );

  async function reversePayment(payment: Payment) {
    const debtName = debtNames.get(payment.debt_id) ?? "Dívida";
    const amount = money(numberValue(payment.amount));

    const confirmed = window.confirm(
      `Deseja estornar o pagamento de ${amount} da dívida "${debtName}"?\n\nO valor será devolvido à carteira original.`
    );

    if (!confirmed) return;

    setMessage("");
    setSaving(true);

    try {
      const { data, error } = await supabase.rpc(
        "reverse_debt_payment",
        { p_payment_id: payment.id }
      );

      if (error) throw error;

      if (data && data.success === false) {
        throw new Error(
          data.message || "Não foi possível estornar o pagamento."
        );
      }

      await loadData();

      setMessage(
        `Pagamento de ${amount} estornado. O saldo da carteira e da dívida foi atualizado.`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível estornar o pagamento."
      );
    } finally {
      setSaving(false);
    }
  }

  async function registerPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const amount = Number(paymentAmount.replace(",", "."));
    const debt = debts.find((item) => item.id === selectedDebt);

    if (!debt || !selectedWallet) {
      setMessage("Selecione a dívida e a conta usada para pagar.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Informe um valor de pagamento válido.");
      return;
    }

    if (amount > remaining(debt)) {
      setMessage("O pagamento não pode ultrapassar o saldo restante da dívida.");
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase.rpc("register_debt_payment", {
        p_debt_id: selectedDebt,
        p_account_id: selectedWallet,
        p_amount: amount,
        p_paid_at: paymentDate,
      });

      if (error) throw error;

      if (data && data.success === false) {
        throw new Error(data.message || "O pagamento não foi registrado.");
      }

      setPaymentAmount("");
      await loadData();
      setMessage("Pagamento registrado e saldo atualizado.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar o pagamento.",
      );
    } finally {
      setSaving(false);
    }
  }

  const debtNames = new Map(debts.map((debt) => [debt.id, debt.name]));
  const walletNames = new Map(wallets.map((wallet) => [wallet.id, wallet.name]));

  const currentYear = new Date().getFullYear();

  const monthlyPayments = Array.from({ length: 12 }, (_, month) => {
    const total = payments
      .filter((payment) => {
        const date = new Date(`${payment.paid_at}T12:00:00`);
        return date.getFullYear() === currentYear && date.getMonth() === month;
      })
      .reduce((sum, payment) => sum + numberValue(payment.amount), 0);

    return {
      label: new Date(currentYear, month, 1)
        .toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", ""),
      total,
    };
  });

  const maxMonthlyPayment = Math.max(
    ...monthlyPayments.map((item) => item.total),
    1
  );

  const expensesByCategory = Object.values(
    expenses.reduce<Record<string, number>>((groups, expense) => {
      const category = expense.category?.trim() || "Sem categoria";
      groups[category] = (groups[category] || 0) + numberValue(expense.amount);
      return groups;
    }, {})
  );

  const categoryTotals = expensesByCategory
    .map((total, index) => ({
      category: Object.keys(
        expenses.reduce<Record<string, number>>((groups, expense) => {
          const category = expense.category?.trim() || "Sem categoria";
          groups[category] = (groups[category] || 0) + numberValue(expense.amount);
          return groups;
        }, {})
      )[index],
      total,
    }))
    .sort((a, b) => b.total - a.total);

  const monthlyExpensesByMonth = Array.from({ length: 12 }, (_, month) => {
    const total = expenses
      .filter((expense) => {
        const date = expense.expense_date;
        return date?.slice(0, 4) === String(currentYear)
          && Number(date.slice(5, 7)) === month + 1;
      })
      .reduce((sum, expense) => sum + numberValue(expense.amount), 0);

    return {
      label: new Date(currentYear, month, 1)
        .toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", ""),
      total,
    };
  });

  const maxMonthlyExpense = Math.max(
    ...monthlyExpensesByMonth.map((item) => item.total),
    1,
  );

  const paymentProgress =
    totalDebt > 0 ? Math.min(100, (totalPaid / totalDebt) * 100) : 0;


  const recentMovements = [
    ...expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      date: expense.expense_date,
      description: expense.name || "Despesa",
      kind: "Despesa",
      amount: numberValue(expense.amount),
    })),
    ...payments.map((payment) => ({
      id: `payment-${payment.id}`,
      date: payment.paid_at,
      description: `Pagamento: ${debtNames.get(payment.debt_id) ?? "Dívida"}`,
      kind: "Pagamento de dívida",
      amount: -numberValue(payment.amount),
    })),
  ]
    .sort((a, b) =>
      new Date(`${b.date}T12:00:00`).getTime() -
      new Date(`${a.date}T12:00:00`).getTime()
    )
    .slice(0, 8);

  return (
    <main className="finance-page">
      <AppHeader />

      <style jsx>{`
        .finance-page {
          min-height: 100vh;
          padding: 28px 18px 48px;
          background: #f3f6fb;
          color: #172033;
        }
        .container {
          max-width: 1180px;
          margin: 0 auto;
        }
        .top {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        h1 {
          margin: 0;
          font-size: clamp(27px, 4vw, 36px);
          font-weight: 800;
        }
        .muted {
          color: #64748b;
          margin-top: 7px;
        }
        .nav {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .nav a, button {
          border: 0;
          border-radius: 10px;
          padding: 10px 14px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
        }
        .nav a {
          background: white;
          color: #1e293b;
          border: 1px solid #dbe3ee;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }
        .card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 5px 20px #0f172a08;
          margin-bottom: 18px;
        }
        .stat-label {
          color: #64748b;
          font-size: 13px;
          font-weight: 700;
        }
        .stat-value {
          margin-top: 8px;
          font-size: clamp(21px, 3vw, 27px);
          font-weight: 800;
          overflow-wrap: anywhere;
        }
        h2 {
          margin: 0 0 16px;
          font-size: 19px;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 12px;
          align-items: end;
        }
        label {
          display: grid;
          gap: 7px;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
        }
        input, select {
          width: 100%;
          min-width: 0;
          padding: 12px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background: white;
          color: #172033;
          font: inherit;
        }
        button.primary {
          background: #0f766e;
          color: white;
        }
        button.secondary {
          background: #e8eef7;
          color: #1e293b;
        }
        button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .account-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }
        .account {
          border: 1px solid #dce5ef;
          border-radius: 13px;
          padding: 16px;
        }
        .account-name {
          font-weight: 800;
        }
        .balance {
          font-size: 23px;
          font-weight: 800;
          margin: 10px 0;
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .debt-list {
          display: grid;
          gap: 10px;
        }
        .debt-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          border: 1px solid #e2e8f0;
          border-left: 5px solid #eab308;
          border-radius: 12px;
          padding: 14px;
        }
        .debt-row.overdue { border-left-color: #dc2626; }
        .debt-row.soon { border-left-color: #f97316; }
        .debt-row.paid { border-left-color: #16a34a; }
        .debt-title {
          font-weight: 800;
          overflow-wrap: anywhere;
        }
        .debt-details {
          color: #64748b;
          font-size: 13px;
          margin-top: 5px;
        }
        .status {
          display: inline-block;
          border-radius: 999px;
          background: #fef3c7;
          color: #92400e;
          padding: 5px 9px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }
        .status.red { background: #fee2e2; color: #991b1b; }
        .status.green { background: #dcfce7; color: #166534; }
        .notice {
          border-radius: 10px;
          padding: 12px 14px;
          background: #e0f2fe;
          color: #075985;
          margin-bottom: 16px;
          overflow-wrap: anywhere;
        }
        .empty {
          color: #64748b;
          padding: 14px 0;
        }
        .table-wrap { overflow-x: auto; }
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 500px;
        }
        th, td {
          padding: 12px 10px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
        }
        th { color: #64748b; }
        .movement-expense { color: #334155; }
        .movement-payment { color: #64748b; }
        .movement-value { font-variant-numeric: tabular-nums; white-space: nowrap; }

        .finance-page {
          background: #f8fafc;
          color: #0f172a;
          min-height: 100vh;
        }

        .stats .card {
          margin: 0;
          border: none;
          color: white;
          min-width: 0;
          box-shadow: 0 8px 22px #0f172a12;
        }

        .stats .card {
          background: #ffffff;
          color: #0f172a;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 4px 14px #0f172a08;
        }
        .stats .card:nth-child(1) { border-top: 3px solid #64748b; }
        .stats .card:nth-child(2) { border-top: 3px solid #94a3b8; }
        .stats .card:nth-child(3) { border-top: 3px solid #64748b; }
        .stats .card:nth-child(4) { border-top: 3px solid #475569; }
        .stats .card:nth-child(5) { border-top: 3px solid #b45353; }
        .stats .stat-label { color: #64748b; }
        .stats .stat-value { color: #0f172a; }
        .stats .muted { color: #64748b; }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 16px;
        }

        .section-heading h2 { margin: 0; }

        .table-wrap {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 620px;
          background: white;
        }

        th {
          background: #f1f5f9;
          color: #475569;
          font-weight: 800;
          white-space: nowrap;
        }

        th, td {
          padding: 14px 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
        }

        tbody tr:hover { background: #f8fafc; }

        .status.orange { background: #ffedd5; color: #9a3412; }

        .chart-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) minmax(230px, 1fr);
          gap: 22px;
          align-items: stretch;
        }

        .chart {
          display: flex;
          align-items: end;
          justify-content: space-around;
          gap: 10px;
          height: 230px;
          padding: 20px 10px 0;
          border-bottom: 1px solid #cbd5e1;
          background: repeating-linear-gradient(
            to bottom, transparent 0, transparent 45px, #e2e8f0 46px
          );
        }

        .chart-column {
          display: flex;
          flex: 1;
          min-width: 0;
          height: 100%;
          flex-direction: column;
          justify-content: end;
          align-items: center;
          gap: 8px;
        }

        .chart-bar {
          width: min(28px, 80%);
          min-height: 3px;
          border-radius: 7px 7px 0 0;
          background: linear-gradient(180deg, #34d399, #059669);
          transition: height 0.25s ease;
        }
        .chart-bar.expense-bar {
          background: #64748b;
        }

        .chart-subtitle {
          margin: 26px 0 0;
          font-size: 15px;
          color: #334155;
        }

        .category-list {
          display: grid;
          gap: 14px;
          margin: 16px 0 22px;
        }

        .category-item {
          min-width: 0;
        }

        .category-item-heading {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 7px;
          color: #334155;
          font-size: 13px;
        }

        .category-item-heading span {
          overflow-wrap: anywhere;
        }

        .category-item-heading strong {
          white-space: nowrap;
          color: #0f172a;
        }

        .category-track {
          height: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: #e2e8f0;
        }

        .category-fill {
          height: 100%;
          border-radius: inherit;
          background: #64748b;
        }

        .chart-label {
          color: #64748b;
          font-size: 11px;
          padding-bottom: 8px;
          text-transform: capitalize;
        }

        .progress-track {
          height: 10px;
          overflow: hidden;
          background: #e2e8f0;
          border-radius: 999px;
          margin: 12px 0;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #059669, #34d399);
          border-radius: inherit;
        }

        .insight {
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 14px;
          padding: 20px;
        }

        .insight h3 { margin: 0 0 10px; font-size: 17px; }

        .insight p {
          color: #475569;
          font-size: 14px;
          line-height: 1.7;
        }

        @media (max-width: 720px) {
          .chart-layout { grid-template-columns: 1fr; }
          .chart { gap: 5px; height: 180px; }
        }

        @media (max-width: 520px) {
          .category-pie-layout {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 18px !important;
          }

          .category-pie-layout > div:first-child {
            width: min(100%, 210px) !important;
          }

          .category-pie-legend {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .finance-page { padding: 20px 12px 35px; }
          .card { padding: 15px; }
          .debt-row { grid-template-columns: 1fr; }

          .table-wrap {
            max-width: 100%;
            -webkit-overflow-scrolling: touch;
          }

          .table-wrap table {
            min-width: 560px;
          }

          .table-wrap th,
          .table-wrap td {
            padding: 10px 8px;
            font-size: 12px;
          }
        }
        /* Tabela de dívidas responsiva no Financeiro */
        .debts-table-wrap {
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .debts-table {
          width: max(100%, 760px) !important;
          min-width: 760px;
          border-collapse: collapse;
          table-layout: auto;
          background: white;
        }

        .debts-table th,
        .debts-table td {
          padding: 11px 10px;
          font-size: 13px;
          line-height: 1.45;
          text-align: left;
          vertical-align: middle;
        }

        .debts-table th {
          white-space: nowrap;
        }

        .debts-table td:first-child {
          min-width: 110px;
          max-width: 220px;
          white-space: normal;
          overflow-wrap: anywhere;
        }

        .debts-table td:nth-child(2) {
          min-width: 100px;
          max-width: 180px;
          overflow-wrap: anywhere;
        }

        .debts-table td:nth-child(n+3) {
          white-space: nowrap;
        }

        @media (max-width: 900px) {
          .debts-table {
            min-width: 760px;
          }

          .debts-table th,
          .debts-table td {
            padding: 10px 8px;
            font-size: 13px;
          }
        }

        /* Refinamento visual da página financeira */
        .finance-page {
          max-width: 1440px;
          margin-inline: auto;
          color: #172238;
        }

        .finance-page h1,
        .finance-page h2,
        .finance-page h3 {
          color: #172238;
          letter-spacing: -0.025em;
        }

        .finance-page .card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          box-shadow: 0 5px 18px rgba(23, 34, 56, 0.045);
        }

        .finance-page .stat-label {
          color: #68758a;
          font-weight: 600;
        }

        .finance-page .stat-value {
          font-weight: 800;
          letter-spacing: -0.03em;
          overflow-wrap: anywhere;
        }

        .finance-page details {
          margin-block: 18px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 4px 16px rgba(23, 34, 56, 0.035);
        }

        .finance-page details > summary {
          padding: 18px 22px;
          cursor: pointer;
          color: #172238;
          font-weight: 750;
          list-style: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          transition: background 160ms ease;
        }

        .finance-page details > summary::-webkit-details-marker {
          display: none;
        }

        .finance-page details > summary::after {
          content: "+";
          display: grid;
          place-items: center;
          flex: 0 0 30px;
          width: 30px;
          height: 30px;
          border-radius: 10px;
          background: #e8f4f0;
          color: #126b58;
          font-size: 21px;
        }

        .finance-page details[open] > summary {
          background: #f4faf7;
          border-bottom: 1px solid #e2e8f0;
        }

        .finance-page details[open] > summary::after {
          content: "−";
        }

        .finance-page details > summary:hover {
          background: #f4faf7;
        }

        .finance-page input,
        .finance-page select,
        .finance-page textarea {
          border-radius: 10px;
          border-color: #d7e0e9;
        }

        .finance-page input:focus,
        .finance-page select:focus,
        .finance-page textarea:focus {
          outline: 3px solid rgba(18, 107, 88, 0.13);
          border-color: #126b58;
        }

        .finance-page .more-stats {
          grid-column: 1 / -1;
          min-width: 0;
          margin: 0;
        }

        .finance-page .stats-extra {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          padding: 16px;
        }

        .finance-page .indicator-group {
          min-width: 0;
          padding: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
        }

        .finance-page .indicator-group h3 {
          margin: 0 0 12px;
          font-size: 16px;
        }

        .finance-page .indicator-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .finance-page .indicator-grid > .card {
          min-width: 0;
          margin: 0;
        }

        @media (max-width: 700px) {
          .finance-page .indicator-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 420px) {
          .finance-page .indicator-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }


        /* Ajuste visual dos indicadores financeiros */
        .finance-page > * {
          box-sizing: border-box;
        }

        .finance-page .stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          width: 100%;
          margin: 0 0 28px;
          align-items: stretch;
        }

        .finance-page .stats > .card {
          box-sizing: border-box;
          min-width: 0;
          padding: 26px 24px;
          margin: 0;
          border-radius: 18px;
        }

        .finance-page .stats .stat-label {
          font-size: 14px;
          line-height: 1.5;
          overflow-wrap: break-word;
        }

        .finance-page .stats .stat-value {
          display: block;
          max-width: 100%;
          margin-top: 12px;
          font-size: clamp(22px, 2.2vw, 32px);
          line-height: 1.25;
          font-weight: 800;
          letter-spacing: -0.02em;
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: normal;
          font-variant-numeric: tabular-nums;
          border-bottom: 0;
        }

        .finance-page .more-stats {
          min-width: 0;
        }

        @media (max-width: 640px) {
          .finance-page .stats {
            grid-template-columns: minmax(0, 1fr);
            gap: 14px;
          }

          .finance-page .stats > .card {
            padding: 20px;
          }

          .finance-page .stats .stat-value {
            font-size: clamp(23px, 6vw, 30px);
          }
        }



        /* Nomes dos indicadores em negrito e cores coordenadas */
        .finance-page .stats .stat-label {
          font-size: 14px;
          line-height: 1.5;
          font-weight: 800;
          letter-spacing: 0.01em;
        }

        /* Dinheiro disponível: verde */
        .finance-page .stats > .card:nth-child(1) .stat-label,
        .finance-page .stats > .card:nth-child(1) .stat-value {
          color: #047857;
        }

        /* Dívida original: azul */
        .finance-page .stats > .card:nth-child(2) .stat-label,
        .finance-page .stats > .card:nth-child(2) .stat-value {
          color: #1d4ed8;
        }

        /* Total pago: roxo */
        .finance-page .stats > .card:nth-child(3) .stat-label,
        .finance-page .stats > .card:nth-child(3) .stat-value {
          color: #6d28d9;
        }

        /* Títulos dos indicadores extras */
        .finance-page .indicator-grid .stat-label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 800;
          color: #334155;
        }

        .finance-page .indicator-group:nth-child(1) .stat-label {
          color: #047857;
        }

        .finance-page .indicator-group:nth-child(2) .stat-label {
          color: #be123c;
        }

        .finance-page .indicator-group:nth-child(3) .stat-label {
          color: #a16207;
        }

        .finance-page .indicator-group:nth-child(4) .stat-label {
          color: #1d4ed8;
        }

        

/* Todos os dados das tabelas em negrito */
.finance-page table tbody td {
  font-weight: 700 !important;
  color: #334155;
}

.finance-page table tbody td strong,
.finance-page table tbody td b {
  font-weight: 800 !important;
}

.finance-page table thead th {
  font-weight: 800 !important;
}

.finance-page table tbody tr:nth-child(even) td {
  background-color: #f8fafc;
}

.finance-page table tbody tr:hover td {
  background-color: #eff6ff;
}





/* Layout adaptável: mantém o visual de desktop em telas menores */
.finance-page {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.finance-page .stats,
.finance-page .indicator-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
}

.finance-page .card {
  min-width: 0;
  max-width: 100%;
}

.finance-page .recharts-responsive-container,
.finance-page .recharts-wrapper {
  max-width: 100%;
  min-width: 0;
}

@media (max-width: 900px) {
  .finance-page {
    padding-left: 14px !important;
    padding-right: 14px !important;
  }

  .finance-page .stats,
  .finance-page .indicator-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 12px !important;
  }

  .finance-page .card {
    padding: 14px !important;
  }

  .finance-page .stat-label {
    font-size: 12px !important;
  }

  .finance-page .stat-value {
    font-size: clamp(17px, 2.8vw, 23px) !important;
  }
}

@media (max-width: 600px) {
  .finance-page {
    padding: 12px 10px 24px !important;
  }

  /* Dois cards por linha, como um painel compacto */
  .finance-page .stats,
  .finance-page .indicator-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 9px !important;
    margin-bottom: 14px !important;
  }

  .finance-page .card,
  .finance-page .card:has(.recharts-wrapper),
  .finance-page .card:has(.recharts-responsive-container) {
    padding: 11px !important;
    border-radius: 13px !important;
  }

  .finance-page h1 {
    font-size: 21px !important;
    line-height: 1.3 !important;
  }

  .finance-page h2 {
    font-size: 18px !important;
    line-height: 1.35 !important;
  }

  .finance-page h3,
  .finance-page .chart-title,
  .finance-page .section-title {
    font-size: 14px !important;
    line-height: 1.35 !important;
  }

  .finance-page .stat-label {
    font-size: 11px !important;
    line-height: 1.4 !important;
  }

  .finance-page .stat-value {
    font-size: clamp(16px, 4.4vw, 21px) !important;
    line-height: 1.25 !important;
    overflow-wrap: anywhere;
  }

  /* Gráficos em largura total para facilitar a leitura */
  .finance-page .card:has(.recharts-wrapper),
  .finance-page .card:has(.recharts-responsive-container) {
    grid-column: 1 / -1;
  }

  .finance-page .recharts-responsive-container {
    width: 100% !important;
    height: 205px !important;
    min-height: 0 !important;
  }

  .finance-page .recharts-text {
    font-size: 10px !important;
  }

  /* Tabelas rolam horizontalmente sem estourar a página */
  .finance-page table {
    display: block;
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  .finance-page table th,
  .finance-page table td {
    padding: 8px !important;
    font-size: 11px !important;
  }

  .finance-page a[href*="dividas"] {
    max-width: 100%;
    padding: 10px 12px !important;
    font-size: 12px !important;
  }
}

@media (max-width: 360px) {
  .finance-page {
    padding-left: 7px !important;
    padding-right: 7px !important;
  }

  .finance-page .stats,
  .finance-page .indicator-grid {
    gap: 7px !important;
  }

  .finance-page .card {
    padding: 9px !important;
  }

  .finance-page .stat-label {
    font-size: 10px !important;
  }

  .finance-page .stat-value {
    font-size: 15px !important;
  }

  .finance-page .recharts-responsive-container {
    height: 185px !important;
  }
}

/* Ajuste compacto para celulares */
@media (max-width: 600px) {
  .finance-page {
    padding: 10px 8px 20px !important;
  }

  .finance-page .stats,
  .finance-page .indicator-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 18px !important;
    margin-bottom: 10px !important;
  }

  .finance-page .card,
  .finance-page .card:has(.recharts-wrapper),
  .finance-page .card:has(.recharts-responsive-container) {
    padding: 10px !important;
    border-radius: 20px !important;
  }

  .finance-page h1 {
    font-size: 18px !important;
    line-height: 0.99 !important;
  }

  .finance-page h2 {
    font-size: 18px !important;
    line-height: 1.0 !important;
    margin-bottom: 6px !important;
  }

  .finance-page h3,
  .finance-page .chart-title,
  .finance-page .section-title {
    font-size: 14px !important;
    line-height: 1.3 !important;
    margin-bottom: 8px !important;
  }

  .finance-page .stat-label {
    font-size: 10px !important;
    line-height: 1.35 !important;
  }

  .finance-page .stat-value {
    font-size: clamp(16px, 4.5vw, 21px) !important;
    line-height: 1.2 !important;
  }

  .finance-page .recharts-responsive-container {
    min-height: 0 !important;
    height: 175px !important;
  }

  .finance-page .recharts-wrapper {
    font-size: 10px !important;
  }

  .finance-page .recharts-text {
    font-size: 10px !important;
  }

  .finance-page .recharts-legend-wrapper {
    font-size: 10px !important;
  }

  .finance-page table {
    font-size: 10px !important;
  }

  .finance-page table thead th,
  .finance-page table tbody td {
    padding: 7px 8px !important;
    font-size: 11px !important;
  }

  .finance-page a[href*="dividas"] {
    width: auto !important;
    max-width: 100%;
    padding: 9px 12px !important;
    font-size: 12px !important;
  }
}

@media (max-width: 380px) {
  .finance-page .stats,
  .finance-page .indicator-grid {
    grid-template-columns: minmax(0, 1fr) !important;
  }

  .finance-page .recharts-responsive-container {
    height: 155px !important;
  }
}

/* Responsividade para celular, tablet e telas pequenas */
.finance-page {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.finance-page *,
.finance-page *::before,
.finance-page *::after {
  box-sizing: border-box;
}

.finance-page h1,
.finance-page h2,
.finance-page h3,
.finance-page p,
.finance-page .stat-label {
  overflow-wrap: anywhere;
}

.finance-page .stats,
.finance-page .indicator-grid {
  width: 100%;
  min-width: 0;
}

.finance-page .card,
.finance-page section,
.finance-page article {
  min-width: 0;
  max-width: 100%;
}

.finance-page .recharts-responsive-container,
.finance-page .recharts-wrapper,
.finance-page .chart-container {
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.finance-page svg {
  max-width: 100%;
}

.finance-page table {
  width: 100%;
  max-width: 100%;
}

.finance-page {
  overflow-wrap: anywhere;
}

@media (max-width: 900px) {
  .finance-page {
    padding-left: 18px;
    padding-right: 18px;
  }

  .finance-page .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .finance-page .indicator-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
}

@media (max-width: 600px) {
  .finance-page {
    padding: 16px 12px 28px;
  }

  .finance-page .stats,
  .finance-page .indicator-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }

  .finance-page .card {
    padding: 16px;
    border-radius: 16px;
  }

  .finance-page h1 {
    font-size: 24px;
    line-height: 1.25;
  }

  .finance-page h2 {
    font-size: 21px;
    line-height: 1.3;
  }

  .finance-page h3,
  .finance-page .chart-title,
  .finance-page .section-title {
    font-size: 16px;
    line-height: 1.4;
  }

  .finance-page .stat-value {
    font-size: clamp(20px, 6vw, 26px);
    overflow-wrap: anywhere;
  }

  .finance-page .stat-label {
    font-size: 13px;
  }

  .finance-page .recharts-responsive-container {
    min-height: 220px;
  }

  .finance-page table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  .finance-page table thead th,
  .finance-page table tbody td {
    padding: 10px;
    font-size: 12px;
  }

  .finance-page a[href*="dividas"] {
    width: 100%;
    text-align: center;
  }

  .finance-page button,
  .finance-page input,
  .finance-page select,
  .finance-page textarea {
    max-width: 100%;
  }
}

@media (max-width: 360px) {
  .finance-page {
    padding-left: 8px;
    padding-right: 8px;
  }

  .finance-page .card {
    padding: 12px;
  }

  .finance-page h1 {
    font-size: 21px;
  }

  .finance-page .recharts-responsive-container {
    min-height: 190px;
  }
}

/* Painel profissional de visão geral financeira */
.finance-page h2,
.finance-page h3,
.finance-page .chart-title,
.finance-page .section-title {
  color: #172554;
  font-weight: 800 !important;
  letter-spacing: -0.025em;
}

.finance-page h2 {
  font-size: clamp(22px, 2.4vw, 30px);
  margin-bottom: 8px;
}

.finance-page h3,
.finance-page .chart-title,
.finance-page .section-title {
  font-size: 18px;
  line-height: 1.4;
  margin-bottom: 14px;
}

.finance-page .chart-container,
.finance-page .recharts-responsive-container,
.finance-page [class*="chart-card"],
.finance-page [class*="ChartCard"] {
  min-width: 0;
  max-width: 100%;
}

.finance-page .card:has(.recharts-wrapper),
.finance-page .card:has(.recharts-responsive-container) {
  padding: 22px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.055);
}

.finance-page .recharts-cartesian-grid line {
  stroke: #e2e8f0;
  stroke-dasharray: 4 4;
}

.finance-page .recharts-cartesian-axis-line,
.finance-page .recharts-cartesian-axis-tick-line {
  stroke: #cbd5e1;
}

.finance-page .recharts-text {
  fill: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.finance-page .recharts-legend-item-text {
  color: #334155 !important;
  font-weight: 700 !important;
}

.finance-page .recharts-tooltip-wrapper {
  outline: none;
}

.finance-page .recharts-default-tooltip {
  border: 1px solid #dbe4f0 !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
}

.finance-page .recharts-tooltip-label {
  color: #172554 !important;
  font-weight: 800 !important;
}

.finance-page .recharts-tooltip-item {
  font-weight: 700 !important;
}

.finance-page .debt-progress,
.finance-page .progress-bar {
  border-radius: 999px;
  overflow: hidden;
}

.finance-page a[href*="dividas"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 16px;
  border-radius: 12px;
  background: #1d4ed8;
  color: #ffffff;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.18);
  transition: background 0.2s ease, transform 0.2s ease;
}

.finance-page a[href*="dividas"]:hover {
  background: #1e40af;
  transform: translateY(-1px);
}

@media (max-width: 760px) {
  .finance-page .card:has(.recharts-wrapper),
  .finance-page .card:has(.recharts-responsive-container) {
    padding: 16px;
  }

  .finance-page h3,
  .finance-page .chart-title,
  .finance-page .section-title {
    font-size: 16px;
  }
}

/* Cores coordenadas para tabelas e gráficos financeiros */
.finance-page table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.finance-page table thead th {
  background: #eaf2ff;
  color: #1e40af;
  font-weight: 800;
  padding: 12px 14px;
  text-align: left;
  border-bottom: 2px solid #c7d7fe;
}

.finance-page table tbody td {
  padding: 11px 14px;
  border-bottom: 1px solid #e8edf5;
  color: #334155;
}

.finance-page table tbody tr:nth-child(even) {
  background: #f8fafc;
}

.finance-page table tbody tr:hover {
  background: #eff6ff;
}

.finance-page table tbody tr:last-child td {
  border-bottom: 0;
}

/* Valores e destaques nas tabelas */
.finance-page table td strong {
  font-weight: 800;
  color: #1d4ed8;
}

/* Área dos gráficos */
.finance-page .recharts-wrapper,
.finance-page .chart-container,
.finance-page [class*="chart"] {
  max-width: 100%;
}

.finance-page .recharts-cartesian-grid line {
  stroke: #e2e8f0;
  stroke-dasharray: 4 4;
}

.finance-page .recharts-text {
  fill: #64748b;
  font-size: 12px;
}

.finance-page .recharts-legend-item-text {
  color: #334155 !important;
  font-weight: 600;
}

/* Cores de gráficos SVG quando as séries usam estas classes */
.finance-page .chart-green { color: #059669; }
.finance-page .chart-blue { color: #2563eb; }
.finance-page .chart-purple { color: #7c3aed; }
.finance-page .chart-red { color: #e11d48; }
.finance-page .chart-amber { color: #d97706; }

@media (max-width: 760px) {
  .finance-page table {
    font-size: 13px;
  }

  .finance-page table thead th,
  .finance-page table tbody td {
    padding: 9px 10px;
  }
}

/* Identidade visual dos cards financeiros */
        .finance-page {
          width: 100%;
          max-width: none;
          padding: 28px clamp(16px, 3vw, 40px) 40px;
          box-sizing: border-box;
        }

        .finance-page .stats {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          width: 100%;
        }

        .finance-page .stats > .card {
          min-width: 0;
          padding: 26px;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
          transition: transform 160ms ease, box-shadow 160ms ease;
        }

        .finance-page .stats > .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.09);
        }

        .finance-page .stats > .card:nth-child(1) {
          background: linear-gradient(135deg, #ecfdf5, #ffffff);
          border-top: 4px solid #10b981;
        }

        .finance-page .stats > .card:nth-child(2) {
          background: linear-gradient(135deg, #eff6ff, #ffffff);
          border-top: 4px solid #3b82f6;
        }

        .finance-page .stats > .card:nth-child(3) {
          background: linear-gradient(135deg, #f5f3ff, #ffffff);
          border-top: 4px solid #8b5cf6;
        }

        .finance-page .stats .stat-value {
          font-size: clamp(22px, 2.1vw, 32px);
          line-height: 1.3;
          overflow-wrap: anywhere;
          word-break: normal;
          border-bottom: 0;
          font-variant-numeric: tabular-nums;
        }

        .finance-page .indicator-group {
          margin: 18px 0 24px;
          padding: 22px;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          background: #ffffff;
        }

        .finance-page .indicator-group h3 {
          margin: 0 0 18px;
          font-size: 18px;
        }

        .finance-page .indicator-group:nth-child(1) {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }

        .finance-page .indicator-group:nth-child(2) {
          background: #fff1f2;
          border-color: #fecdd3;
        }

        .finance-page .indicator-group:nth-child(3) {
          background: #fffbeb;
          border-color: #fde68a;
        }

        .finance-page .indicator-group:nth-child(4) {
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .finance-page .indicator-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .finance-page .indicator-grid > .card {
          min-width: 0;
          margin: 0;
          padding: 20px;
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
        }

        .finance-page .more-stats {
          margin-bottom: 28px;
        }

        @media (max-width: 760px) {
          .finance-page .stats {
            grid-template-columns: minmax(0, 1fr);
            gap: 14px;
          }

          .finance-page .stats > .card {
            padding: 21px;
          }

          .finance-page .indicator-group {
            padding: 16px;
          }

          .finance-page .indicator-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 12px;
          }
        }

        .finance-page .status {
          border-radius: 999px;
          font-weight: 700;
        }

       .finance-page .more-stats {
          grid-column: 1 / -1;
          min-width: 0;
          margin: 0;
        }

        @media (max-width: 640px) {
          .finance-page details > summary {
            padding: 16px;
          }
        }


        /* Ajustes finais para celulares: espaçamento e tabelas */
        .finance-page .top {
          margin-bottom: 12px !important;
        }

        .finance-page .top p {
          margin-bottom: 0 !important;
        }

        .finance-page .stats {
          margin-top: 0 !important;
        }

        .finance-page .table-wrap {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-x: contain;
          box-sizing: border-box !important;
        }

        .finance-page .table-wrap table {
          display: table !important;
          width: max-content !important;
          min-width: 100% !important;
          max-width: none !important;
          border-collapse: collapse;
          white-space: nowrap !important;
        }

        .finance-page .table-wrap th,
        .finance-page .table-wrap td {
          white-space: nowrap !important;
        }

        @media (max-width: 760px) {
          .finance-page .top {
            margin-bottom: 8px !important;
          }

          .finance-page .top p {
            margin-top: 4px !important;
            line-height: 1.00 !important;
          }

          .finance-page .stats {
            margin-top: 0 !important;
            row-gap: 8px !important;
          }

          .finance-page .collapsible-section,
          .finance-page details.card {
            min-width: 0 !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }

          .finance-page .collapsible-content {
            min-width: 0 !important;
            max-width: 100% !important;
          }

          .finance-page .table-wrap {
            margin: 0 !important;
            border-radius: 8px;
            scrollbar-width: thin;
          }

          .finance-page .table-wrap table {
            min-width: 560px !important;
          }

          /* Tabela de dívidas: compacta, legível e rolável no celular */
          .finance-page .debts-table-wrap {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
          }

          .finance-page .debts-table-wrap .debts-table {
            width: max-content !important;
            min-width: 520px !important;
            max-width: none !important;
            table-layout: auto !important;
            border-collapse: collapse !important;
          }

          .finance-page .debts-table-wrap .debts-table th,
          .finance-page .debts-table-wrap .debts-table td {
            padding: 8px 10px !important;
            font-size: 12px !important;
            line-height: 1.35 !important;
            white-space: nowrap !important;
            vertical-align: middle;
          }

          .finance-page .debts-table-wrap .debts-table td:first-child {
            min-width: 90px;
            white-space: normal !important;
            overflow-wrap: anywhere;
          }

          /* Aproxima vencimento e valor, alinhando os números */
          .finance-page .debts-table-wrap .debts-table {
            min-width: 500px !important;
            table-layout: auto !important;
          }

          .finance-page .debts-table-wrap .debts-table th:nth-child(2),
          .finance-page .debts-table-wrap .debts-table td:nth-child(2) {
            padding-left: 8px !important;
            padding-right: 4px !important;
            text-align: left !important;
          }

          .finance-page .debts-table-wrap .debts-table th:nth-child(3),
          .finance-page .debts-table-wrap .debts-table td:nth-child(3) {
            padding-left: 4px !important;
            padding-right: 16px !important;
            text-align: right !important;
            white-space: nowrap !important;
            font-variant-numeric: tabular-nums;
          }

          .finance-page .debts-table-wrap .debts-table th:nth-child(3) {
            text-align: right !important;
          }

          .finance-page .debts-table-wrap .debts-table td:nth-child(3) strong {
            display: block;
            width: 100%;
            text-align: right !important;
          }

          @media (max-width: 600px) {
            .finance-page .debts-table-wrap .debts-table th,
            .finance-page .debts-table-wrap .debts-table td {
              padding: 7px 8px !important;
              font-size: 12px !important;
            }
          }
        }


        /* Reduz somente o espaço entre o texto do topo e os cards no celular */
        @media (max-width: 760px) {
          .finance-page .container > header.top {
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
            min-height: 0 !important;
          }

          .finance-page .container > header.top p {
            margin-top: 2px !important;
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
          }

          .finance-page .container > .stats {
            margin-top: 0 !important;
            padding-top: 0 !important;
            align-content: start !important;
          }
        }


        /* Correção final: aproxima os cards do cabeçalho no celular */
        @media (max-width: 600px) {
          .finance-page .container > header.top {
            display: flex !important;
            gap: 0 !important;
            margin: 0 0 6px !important;
            padding: 0 !important;
          }

          .finance-page .container > header.top > div {
            margin: 0 !important;
            padding: 0 !important;
          }

          .finance-page .container > header.top p {
            margin: 2px 0 0 !important;
            padding: 0 !important;
          }

          .finance-page .container > .stats {
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
        }


          /* Tabelas responsivas com espaçamento reduzido */
          .finance-page .table-wrap {
            max-width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            margin: 4px 0 !important;
          }

          .finance-page table {
            width: 100%;
            border-collapse: collapse;
            border-spacing: 0;
          }

          .finance-page table th,
          .finance-page table td {
            padding: 7px 8px !important;
            line-height: 1.3;
          }

          @media (max-width: 600px) {
            .finance-page table th,
            .finance-page table td {
              padding: 6px 7px !important;
              font-size: 12px;
            }
          }

          


        /* Ajuste seguro: aproximar colunas apenas em Minhas dívidas */
        @media (max-width: 600px) {
          .finance-page .debts-table-wrap {
            overflow-x: auto !important;
            max-width: 100% !important;
          }

          .finance-page .debts-table-wrap .debts-table {
            width: max-content !important;
            min-width: 460px !important;
            max-width: none !important;
            table-layout: auto !important;
          }

          .finance-page .debts-table-wrap .debts-table th,
          .finance-page .debts-table-wrap .debts-table td {
            padding: 6px 6px !important;
            white-space: nowrap !important;
            vertical-align: middle !important;
            box-sizing: border-box !important;
          }

          .finance-page .debts-table-wrap .debts-table td:first-child {
            min-width: 85px !important;
            white-space: normal !important;
            overflow-wrap: anywhere !important;
          }

          .finance-page .debts-table-wrap .debts-table td:nth-child(3),
          .finance-page .debts-table-wrap .debts-table th:nth-child(3) {
            text-align: right !important;
          }
        }


        /* AJUSTE FINAL MOBILE: todas as tabelas financeiras */
        @media (max-width: 600px) {
          .finance-page .table-wrap {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
            box-sizing: border-box !important;
          }

          .finance-page .table-wrap table {
            width: max-content !important;
            min-width: 100% !important;
            max-width: none !important;
            table-layout: auto !important;
            border-collapse: collapse !important;
            border-spacing: 0 !important;
          }

          .finance-page .table-wrap th,
          .finance-page .table-wrap td {
            padding: 6px 5px !important;
            font-size: 12px !important;
            line-height: 1.3 !important;
            vertical-align: middle !important;
            box-sizing: border-box !important;
          }

          .finance-page .table-wrap th {
            white-space: nowrap !important;
          }

          .finance-page .table-wrap td {
            white-space: normal !important;
            overflow-wrap: anywhere !important;
          }

          .finance-page .debts-table-wrap .debts-table {
            min-width: 460px !important;
            width: max-content !important;
          }

          .finance-page .debts-table-wrap .debts-table td:nth-child(3) {
            white-space: nowrap !important;
          }
        }

        /* finance-accordion-colors-v2 */
        .finance-page details { margin: 12px 0 !important; border: 1px solid #dbeafe; border-radius: 15px; overflow: hidden; background: #fff; box-shadow: 0 4px 14px rgba(15,23,42,.06); }
        .finance-page details > summary { padding: 15px 17px !important; font-weight: 800 !important; cursor: pointer; background: #eff6ff; color: #1d4ed8; }
        .finance-page details:nth-of-type(7n + 2) > summary { background: #f0fdf4; color: #15803d; }
        .finance-page details:nth-of-type(7n + 3) > summary { background: #fff7ed; color: #c2410c; }
        .finance-page details:nth-of-type(7n + 4) > summary { background: #faf5ff; color: #7e22ce; }
        .finance-page details:nth-of-type(7n + 5) > summary { background: #fdf2f8; color: #be185d; }
        .finance-page details:nth-of-type(7n + 6) > summary { background: #fefce8; color: #a16207; }
        .finance-page details:nth-of-type(7n) > summary { background: #f0fdfa; color: #0f766e; }
        @media (max-width: 600px) { .finance-page details > summary { padding: 13px 11px !important; font-size: 14px; } }

      `}
</style>

      <div className="container">
        <header className="top">
          <div>
            <h1>Financeiro</h1>
            <p className="muted">
              Contas, Saldos, Dívidas e Pagamentos Em Um Só Lugar.
            </p>
          </div>
          <nav className="nav" aria-label="Navegação financeira">
            
          </nav>
        </header>

        {message && <div className="notice" role="status">{message}</div>}

        {loading ? (
          <section className="card">Carregando seus dados financeiros...</section>
        ) : (
          <>
          
            <section className="stats">
              <article className="card">
                <div className="stat-label">Dinheiro disponível</div>
                <div className="stat-value">{money(totalWallets)}</div>
              </article>
              <article className="card">
                <div className="stat-label">Total original das dívidas</div>
                <div className="stat-value">{money(totalDebt)}</div>
              </article>
              <article className="card">
                <div className="stat-label">Total já pago</div>
                <div className="stat-value">{money(totalPaid)}</div>
              </article>
              <details className="more-stats">
                <summary>Mais indicadores financeiros</summary>
                <div className="stats-extra">
                  <section className="indicator-group">
                    <h3>💰 Receitas</h3>
                    <div className="indicator-grid">
                      <article className="card">
                        <div className="stat-label">Receitas recebidas no mês</div>
                        <div className="stat-value">{money(receivedIncome)}</div>
                      </article>
                      <article className="card">
                        <div className="stat-label">Receitas pendentes no mês</div>
                        <div className="stat-value">{money(pendingIncome)}</div>
                      </article>
                    </div>
                  </section>

                  <section className="indicator-group">
                    <h3>🛒 Despesas</h3>
                    <div className="indicator-grid">
                      <article className="card">
                        <div className="stat-label">Despesas registradas</div>
                        <div className="stat-value">{money(totalExpenses)}</div>
                        <p className="muted">Total de despesas comuns e gastos de hábitos.</p>
                      </article>
                      <article className="card">
                        <div className="stat-label">Despesas deste mês</div>
                        <div className="stat-value">{money(monthlyExpenses)}</div>
                        <p className="muted">Despesas registradas no histórico de gastos.</p>
                      </article>
                    </div>
                  </section>

                  <section className="indicator-group">
                    <h3>🤝 Dívidas</h3>
                    <div className="indicator-grid">
                      <article className="card">
                        <div className="stat-label">Dívida restante</div>
                        <div className="stat-value">{money(totalRemaining)}</div>
                      </article>
                      <article className="card">
                        <div className="stat-label">Dívidas atrasadas</div>
                        <div className="stat-value">{money(overdueTotal)}</div>
                      </article>
                    </div>
                  </section>

                  <section className="indicator-group">
                    <h3>🧾 Contas e pagamentos</h3>
                    <div className="indicator-grid">
                      <article className="card">
                        <div className="stat-label">Contas pagas no mês</div>
                        <div className="stat-value">{money(paidAccounts)}</div>
                      </article>
                      <article className="card">
                        <div className="stat-label">Contas pendentes no mês</div>
                        <div className="stat-value">{money(pendingAccounts)}</div>
                      </article>
                      <article className="card">
                        <div className="stat-label">Contas vencidas</div>
                        <div className="stat-value">{money(overdueAccountsTotal)}</div>
                        <p className="muted">{overdueAccounts.length} conta(s) pendente(s) vencida(s).</p>
                      </article>
                    </div>
                  </section>
                </div>
              </details>
            </section>

            <details className="card collapsible-section">
              <summary>Contas pendentes e vencidas</summary>
              <div className="collapsible-content">

              <div className="section-heading">
                <h2></h2>
                <Link href="/controle-contas"></Link>
              </div>
              {controlAccounts.filter((account) =>
                account.status === "pendente" && account.account_type !== "receita"
              ).length === 0 ? (
                <p className="empty">Você não tem contas pendentes cadastradas.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Conta</th>
                        <th>Vencimento</th>
                        <th>Status</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {controlAccounts
                        .filter((account) =>
                          account.status === "pendente" && account.account_type !== "receita"
                        )
                        .sort((a, b) => (a.due_date || "9999-12-31").localeCompare(b.due_date || "9999-12-31"))
                        .slice(0, 8)
                        .map((account) => {
                          const overdue = Boolean(account.due_date && account.due_date < todayKey);
                          return (
                            <tr key={account.id}>
                              <td><strong>{account.name}</strong></td>
                              <td>{account.due_date || "Sem vencimento"}</td>
                              <td>
                                <span className={overdue ? "status red" : "status"}>
                                  {overdue ? "Atrasada" : "Pendente"}
                                </span>
                              </td>
                              <td className="movement-value">{money(numberValue(account.amount))}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="muted">
                Estes valores vêm de contas Ativas.
              </p>
                          </div>
            </details>

            <details className="card collapsible-section">
              <summary>Registrar pagamento de dívida</summary>
              <div className="collapsible-content">

              <h2></h2>
              {debts.filter((debt) => remaining(debt) > 0).length === 0 ? (
                <p className="empty">
                  Não há dívidas pendentes cadastradas. Você pode adicionar dívidas na página Dívidas.
                </p>
              ) : wallets.length === 0 ? (
                <p className="empty">
                  Primeiro cadastre uma conta ou carteira com saldo disponível.
                </p>
              ) : (
                <form className="form-grid" onSubmit={registerPayment}>
                  <label>
                    Dívida
                    <select
                      required
                      value={selectedDebt}
                      onChange={(event) => setSelectedDebt(event.target.value)}
                    >
                      <option value="">Selecione uma dívida</option>
                      {debts
                        .filter((debt) => remaining(debt) > 0)
                        .map((debt) => (
                          <option key={debt.id} value={debt.id}>
                            {debt.name} — restante {money(remaining(debt))}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Pagar com
                    <select
                      required
                      value={selectedWallet}
                      onChange={(event) => setSelectedWallet(event.target.value)}
                    >
                      <option value="">Selecione uma conta</option>
                      {wallets.map((wallet) => (
                        <option key={wallet.id} value={wallet.id}>
                          {wallet.name} — {money(numberValue(wallet.balance))}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Valor pago (R$)
                    <input
                      required
                      inputMode="decimal"
                      value={paymentAmount}
                      onChange={(event) => setPaymentAmount(event.target.value)}
                      placeholder="0,00"
                    />
                  </label>
                  <label>
                    Data do pagamento
                    <input
                      required
                      type="date"
                      value={paymentDate}
                      onChange={(event) => setPaymentDate(event.target.value)}
                    />
                  </label>
                  <button className="primary" disabled={saving} type="submit">
                    {saving ? "Registrando..." : "Registrar pagamento"}
                  </button>
                </form>
              )}
              <p className="muted">
                
              </p>
                          </div>
            </details>

            <details className="card collapsible-section">
              <summary>Minhas dívidas</summary>
              <div className="collapsible-content">

              <div className="section-heading">
                <h2></h2>
                <Link href="/dividas"></Link>
              </div>

              {debts.length === 0 ? (
                <p className="empty">
                  Nenhuma dívida encontrada. Cadastre uma na página Dívidas.
                </p>
              ) : (
                <div className="table-wrap debts-table-wrap">
                  <table className="debts-table">
                    <thead>
                      <tr>
                        <th>Dívida</th>
                        <th>Venc.</th>
                        <th>Valor Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debts.map((debt) => {
                        const status = debtStatus(debt);
                        const badge =
                          status === "Pago"
                            ? "status green"
                            : status === "Atrasado"
                              ? "status red"
                              : status === "Vence em breve"
                                ? "status orange"
                                : "status";

                        return (
                          <tr key={debt.id}>
                            <td><strong>{debt.name}</strong></td>
                            <td>
                              {debt.due_date
                                ? `${debt.due_date.slice(8, 10)}/${debt.due_date.slice(5, 7)}`
                                : "—"}
                            </td>
                            <td><strong>{money(numberValue(debt.amount))}</strong></td>
                            <td><span className={badge}>{status}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
                          </div>
            </details>

            <details className="card collapsible-section">
              <summary>Histórico de pagamentos</summary>
              <div className="collapsible-content">

              <h2></h2>
              {payments.length === 0 ? (
                <p className="empty">Nenhum pagamento registrado ainda.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Dívida</th>
                        <th>Conta utilizada</th>
                        <th>Valor</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td>{payment.paid_at}</td>
                          <td>{debtNames.get(payment.debt_id) ?? "Dívida"}</td>
                          <td>{walletNames.get(payment.account_id) ?? "Conta"}</td>
                          <td>{money(numberValue(payment.amount))}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => void reversePayment(payment)}
                              disabled={saving}
                            >
                              {saving ? "Aguarde..." : "Estornar"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
                          </div>
            </details>

            <details className="card collapsible-section">
              <summary>Últimas movimentações</summary>
              <div className="collapsible-content">

              <div className="section-heading">
                <h2></h2>
                <Link href="/controle-contas"></Link>
              </div>
              {recentMovements.length === 0 ? (
                <p className="empty">Ainda não há movimentações para mostrar.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Data</th><th>Descrição</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentMovements.map((item) => (
                        <tr key={item.id}>
                          <td>
                            {item.date
                              ? new Date(`${item.date}T12:00:00`).toLocaleDateString("pt-BR")
                              : "—"}
                          </td>
                          <td><strong>{item.description}</strong></td>
                          <td>
                            <span className={item.kind === "Despesa" ? "movement-expense" : "movement-payment"}>
                              {item.kind}
                            </span>
                          </td>
                          <td className="movement-value">
                            <strong>{money(item.amount)}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="muted">
                Exibindo até 8 registros recentes. 
              </p>
                          </div>
            </details>

            <details className="card collapsible-section">
              <summary>Visão geral do seu financeiro</summary>
              <div className="collapsible-content">

              <div className="section-heading">
                <div>
                  <h2></h2>
                  <p className="muted">
                    Pagamentos registrados mês a mês em {currentYear}.
                  </p>
                </div>
              </div>

              <div
                className="chart-layout"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr)",
                  gap: "24px",
                  width: "100%",
                  maxWidth: "960px",
                  margin: "0 auto",
                  boxSizing: "border-box",
                }}
              >
                <div>
                  <div className="chart">
                    {monthlyPayments
                      .slice(
                        Math.max(0, new Date().getMonth() - 4),
                        Math.min(monthlyPayments.length, new Date().getMonth() + 3)
                      )
                      .map((item) => (
                      <div className="chart-column" key={item.label}>
                        <div
                          className="chart-bar"
                          title={`${item.label}: ${money(item.total)}`}
                          style={{
                            height: `${Math.max(
                              item.total > 0 ? 4 : 0,
                              (item.total / maxMonthlyPayment) * 100
                            )}%`,
                          }}
                        />
                        <span className="chart-label">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <h3 className="chart-subtitle">Despesas por mês</h3>
                  <div className="chart" aria-label={`Despesas mensais em ${currentYear}`}>
                    {monthlyExpensesByMonth
                      .slice(
                        Math.max(0, new Date().getMonth() - 4),
                        Math.min(monthlyExpensesByMonth.length, new Date().getMonth() + 3)
                      )
                      .map((item) => (
                      <div className="chart-column" key={`despesa-${item.label}`}>
                        <div
                          className="chart-bar expense-bar"
                          title={`${item.label}: ${money(item.total)}`}
                          style={{
                            height: `${Math.max(
                              item.total > 0 ? 4 : 0,
                              (item.total / maxMonthlyExpense) * 100,
                            )}%`,
                          }}
                        />
                        <span className="chart-label">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="muted">
                    Total de despesas registradas: {money(totalExpenses)}
                  </p>

                  <h3 className="chart-subtitle">Despesas por categoria</h3>
                  {categoryTotals.length === 0 ? (
                    <p className="muted">
                      Ainda não há despesas registradas para categorizar.
                    </p>
                  ) : (
                    <div
                      className="category-bar-list"
                      style={{
                        display: "grid",
                        gap: "16px",
                        width: "100%",
                        minWidth: 0,
                      }}
                    >
                      {categoryTotals.map((item, index) => {
                        const colors = [
                          "#059669", "#2563eb", "#f59e0b", "#dc2626",
                          "#7c3aed", "#0891b2", "#db2777", "#65a30d",
                          "#ea580c", "#64748b",
                        ];
                        const total = categoryTotals.reduce(
                          (sum, entry) => sum + entry.total, 0
                        );
                        const percent = total > 0
                          ? (item.total / total) * 100
                          : 0;
                        const maxCategory = Math.max(
                          ...categoryTotals.map((entry) => entry.total),
                          1
                        );
                        const barWidth = (item.total / maxCategory) * 100;

                        return (
                          <div
                            key={item.category}
                            className="category-bar-item"
                            style={{ minWidth: 0 }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "baseline",
                                gap: "12px",
                                flexWrap: "wrap",
                                marginBottom: "6px",
                              }}
                            >
                              <strong
                                style={{
                                  fontSize: "13px",
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {item.category}
                              </strong>
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {money(item.total)}
                              </span>
                            </div>
                            <div
                              role="img"
                              aria-label={`${item.category}: ${money(item.total)}, ${percent.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% das despesas`}
                              style={{
                                width: "100%",
                                height: "14px",
                                borderRadius: "999px",
                                overflow: "hidden",
                                background: "rgba(148, 163, 184, 0.18)",
                              }}
                            >
                              <div
                                style={{
                                  width: `${barWidth}%`,
                                  height: "100%",
                                  minWidth: item.total > 0 ? "4px" : "0",
                                  borderRadius: "999px",
                                  background: colors[index % colors.length],
                                  transition: "width 0.2s ease",
                                }}
                              />
                            </div>
                            <div
                              className="muted"
                              style={{
                                fontSize: "12px",
                                marginTop: "4px",
                              }}
                            >
                              {percent.toLocaleString("pt-BR", {
                                maximumFractionDigits: 1,
                              })}% do total
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="muted">
                    Total pago no histórico de dívidas: {money(totalPaid)}
                  </p>
                </div>

                <aside
                  className="insight"
                  style={{
                    gridColumn: "1 / -1",
                    width: "100%",
                    maxWidth: "960px",
                    margin: "0 auto",
                    boxSizing: "border-box",
                  }}
                >
                  <h3>Progresso das suas dívidas</h3>
                  <div className="stat-value">
                    {paymentProgress.toLocaleString("pt-BR", {
                      maximumFractionDigits: 1,
                    })}%
                  </div>

                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-label="Progresso de pagamento das dívidas"
                    aria-valuenow={Math.round(paymentProgress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="progress-fill"
                      style={{ width: `${paymentProgress}%` }}
                    />
                  </div>

                  <p>
                    Você já pagou {money(totalPaid)} de um total original de{" "}
                    {money(totalDebt)}.
                  </p>
                  <p><strong>Saldo restante:</strong> {money(totalRemaining)}</p>
                  <p className="muted">
                    Falta quitar{" "}
                    {Math.max(0, 100 - paymentProgress).toLocaleString("pt-BR", {
                      maximumFractionDigits: 1,
                    })}% do valor original.
                  </p>
                  <Link href="/dividas">Organizar minhas dívidas →</Link>
                </aside>
              </div>
                          </div>
            </details>

          </>
        )}
      </div>
    </main>
  );
}
