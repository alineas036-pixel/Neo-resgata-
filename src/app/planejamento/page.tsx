"use client";

import AppHeader from "@/components/AppHeader";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Wallet = { id: string; name: string; balance: number | string };
type Debt = {
  id: string;
  name: string;
  amount: number | string;
  paid_amount?: number | string | null;
  due_date: string;
  status: string;
};
type Account = {
  id: string;
  name: string;
  account_type: string;
  amount: number | string;
  due_date: string | null;
  paid_at?: string | null;
  created_at?: string;
  status: string;
};

type Plan = {
  income: string;
  essentials: string;
  otherExpenses: string;
  debtGoal: string;
};

const money = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const parseAmount = (value: number | string | null | undefined): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  const text = String(value ?? "").trim();
  if (!text) return 0;
  const normalized = text.includes(",")
    ? text.replace(/\./g, "").replace(",", ".")
    : text;
  return Number(normalized);
};
const num = (n: number | string | null | undefined) => {
  const value = parseAmount(n);
  return Number.isFinite(value) ? value : 0;
};
const monthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const initialPlan: Plan = {
  income: "",
  essentials: "",
  otherExpenses: "",
  debtGoal: "",
};

export default function PlanejamentoPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [month, setMonth] = useState(monthKey());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [budgetOpen, setBudgetOpen] = useState(true);
  const [simulationOpen, setSimulationOpen] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`resgata-planejamento-${month}`);
      setPlan(saved ? { ...initialPlan, ...JSON.parse(saved) } : initialPlan);
    } catch {
      setPlan(initialPlan);
    }
  }, [month]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!auth.user) {
          router.replace("/login");
          return;
        }

        const [w, d, a] = await Promise.all([
          supabase.from("wallet_accounts")
            .select("id,name,balance")
            .eq("user_id", auth.user.id),
          supabase.from("debts")
            .select("id,name,amount,paid_amount,due_date,status")
            .eq("user_id", auth.user.id),
          supabase.from("control_accounts")
            .select("id,name,account_type,amount,due_date,paid_at,created_at,status")
            .eq("user_id", auth.user.id),
        ]);

        if (w.error) throw w.error;
        if (d.error) throw d.error;
        if (a.error) throw a.error;

        if (active) {
          setWallets((w.data ?? []) as Wallet[]);
          setDebts((d.data ?? []) as Debt[]);
          setAccounts((a.data ?? []) as Account[]);
        }
      } catch (e) {
        if (active) setMessage(e instanceof Error ? e.message : "Erro ao carregar os dados.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [router]);

  const totals = useMemo(() => {
    const wallet = wallets.reduce((s, x) => s + num(x.balance), 0);
    const openDebts = debts.reduce((sum, debt) => {
      if (debt.status === "pago") return sum;
      const remaining = Math.max(
        0,
        num(debt.amount) - Math.min(num(debt.amount), Math.max(0, num(debt.paid_amount)))
      );
      return sum + remaining;
    }, 0);
    const monthAccounts = accounts.filter(
      x => (x.due_date || "").slice(0, 7) === month && x.status !== "cancelado"
    );
    const pendingBills = monthAccounts
      .filter(x => x.status !== "pago" && x.account_type !== "receita")
      .reduce((s, x) => s + num(x.amount), 0);
    const paidInMonth = (account: Account) =>
      account.status === "pago" &&
      (account.paid_at || account.due_date || account.created_at || "").slice(0, 7) === month;

    const recordedIncome = accounts
      .filter(x => x.account_type === "receita" && x.status !== "cancelado" && paidInMonth(x))
      .reduce((s, x) => s + num(x.amount), 0);

    const recordedExpenses = accounts
      .filter(x => x.account_type !== "receita" && x.status !== "cancelado" && paidInMonth(x))
      .reduce((s, x) => s + num(x.amount), 0);
    const income = num(plan.income);
    const essentials = num(plan.essentials);
    const other = num(plan.otherExpenses);
    const goal = num(plan.debtGoal);
    return {
      wallet, openDebts, pendingBills, recordedIncome, recordedExpenses,
      income, essentials, other, goal,
      available: income - essentials - other,
      afterGoal: income - essentials - other - goal,
    };
  }, [wallets, debts, accounts, plan, month]);

  function update(field: keyof Plan, value: string) {
    setPlan(current => ({ ...current, [field]: value }));
  }

  function savePlan() {
    setSaving(true);
    setMessage("");
    try {
      for (const value of Object.values(plan)) {
        const amount = parseAmount(value);
        if (!Number.isFinite(amount) || amount < 0) {
          throw new Error("Informe valores válidos e não negativos.");
        }
      }
      localStorage.setItem(`resgata-planejamento-${month}`, JSON.stringify(plan));
      setMessage("Planejamento salvo neste navegador.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%", padding: "12px", border: "1px solid #d5dce5",
    borderRadius: 10, fontSize: 15, boxSizing: "border-box", background: "#fff",
  };
  const card: React.CSSProperties = {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16,
    padding: 20, minWidth: 0,
  };

  return (
    <>
      <AppHeader />
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 18px 50px", color: "#172033" }}>
        <section style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "stretch",
          flexWrap: "wrap",
          gap: 20,
          marginBottom: 28,
          padding: "24px",
          borderRadius: 20,
          border: "1px solid #dbeafe",
          background: "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
        }}>
          <div style={{ flex: "1 1 280px", minWidth: 0, alignSelf: "center" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              color: "#166534",
              background: "#dcfce7",
              borderRadius: 999,
              padding: "6px 11px",
              fontSize: 12,
              fontWeight: 750,
              marginBottom: 12,
            }}>
              <span aria-hidden="true"></span>

            </span>
            <h1 style={{
              fontSize: "clamp(27px, 4vw, 36px)",
              lineHeight: 1.15,
              letterSpacing: "-0.8px",
              margin: "0 0 10px",
              color: "#172033",
            }}>
              Planejamento Mensal
            </h1>
            <p style={{
              color: "#475569",
              fontSize: 15,
              lineHeight: 1.7,
              margin: 0,
              maxWidth: 540,
            }}>
              Organize sua renda, antecipe seus gastos e defina uma meta realista para quitar suas dívidas.
            </p>
          </div>

          <div style={{
            flex: "0 1 260px",
            minWidth: "min(100%, 220px)",
            alignSelf: "center",
            padding: 16,
            borderRadius: 16,
            border: "1px solid #dbeafe",
            background: "rgba(255,255,255,0.9)",
            boxSizing: "border-box",
          }}>
            <label htmlFor="planning-month" style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 700,
              fontSize: 14,
              color: "#334155",
              marginBottom: 9,
            }}>
              <span aria-hidden="true">📅</span>
              Mês de referência
            </label>
            <input
              id="planning-month"
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              style={{
                ...fieldStyle,
                width: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                background: "#fff",
                border: "1px solid #cbd5e1",
                borderRadius: 10,
                padding: "11px 12px",
                color: "#172033",
                fontSize: 15,
              }}
            />
            <p style={{
              color: "#64748b",
              fontSize: 12,
              lineHeight: 1.5,
              margin: "9px 0 0",
            }}>
              Selecione o mês que deseja organizar.
            </p>
          </div>
        </section>

        {message && <p role="status" style={{ padding: 12, borderRadius: 10, background: "#eff6ff", color: "#1d4ed8" }}>{message}</p>}
        {loading ? <p>Carregando seus dados financeiros...</p> : (
          <>
            <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14, marginBottom: 22 }}>
              {[
                {
                  label: "Saldo total da Carteira",
                  value: money(totals.wallet),
                  note: "Saldo cadastrado nas contas",
                  icon: "💳",
                  color: "#1d4ed8",
                  background: "#eff6ff",
                  border: "#bfdbfe",
                },
                {
                  label: "Dívidas em aberto",
                  value: money(totals.openDebts),
                  note: "Saldo restante das dívidas",
                  icon: "🎯",
                  color: "#7c3aed",
                  background: "#f5f3ff",
                  border: "#ddd6fe",
                },
                {
                  label: "Contas do mês pendentes",
                  value: money(totals.pendingBills),
                  note: "Controle de contas, não inclui dívidas",
                  icon: "⏳",
                  color: "#c2410c",
                  background: "#fff7ed",
                  border: "#fed7aa",
                },
                {
                  label: "Contas pagas no mês",
                  value: money(totals.recordedExpenses),
                  note: "Despesas marcadas como pagas",
                  icon: "✓",
                  color: "#15803d",
                  background: "#f0fdf4",
                  border: "#bbf7d0",
                },
              ].map(item => (
                <div
                  key={item.label}
                  style={{
                    ...card,
                    background: item.background,
                    border: `1px solid ${item.border}`,
                    borderTop: `4px solid ${item.color}`,
                    boxShadow: "0 5px 18px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}>
                    <p style={{
                      margin: 0,
                      color: "#475569",
                      fontSize: 14,
                      fontWeight: 600,
                    }}>{item.label}</p>
                    <span style={{
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: "#ffffffb8",
                      color: item.color,
                      fontSize: 22,
                      fontWeight: 800,
                    }}>{item.icon}</span>
                  </div>
                  <strong style={{
                    display: "block",
                    fontSize: "clamp(22px, 2.5vw, 28px)",
                    color: item.color,
                    margin: "8px 0",
                    overflowWrap: "anywhere",
                  }}>{item.value}</strong>
                  <small style={{ color: "#64748b" }}>{item.note}</small>
                </div>
              ))}
            </section>

            <section style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: 18,
              alignItems: "start",
            }}>
              <div style={{ ...card, padding: 22, boxShadow: "0 6px 20px rgba(15,23,42,0.04)" }}>
                <button type="button" onClick={() => setBudgetOpen(open => !open)} aria-expanded={budgetOpen} style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", gap: 12, padding: 0, border: 0, background: "transparent", color: "#1d4ed8", textAlign: "left", cursor: "pointer" }}>
                  <span style={{ fontSize: 20, lineHeight: 1.4, fontWeight: 750 }}>📝 Monte seu orçamento</span>
                  <span aria-hidden="true" style={{ fontSize: 20 }}>{budgetOpen ? "−" : "+"}</span>
                </button>
                {budgetOpen && <div>

                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7, margin: "14px 0 20px" }}>Informe os valores previstos para este mês. Esses campos são seu planejamento, não lançamentos bancários.</p>
                <div style={{ display: "grid", gap: 18 }}>
                  {([
                    ["income", "Renda prevista no mês"],
                    ["essentials", "Gastos essenciais previstos"],
                    ["otherExpenses", "Outros gastos previstos"],
                    ["debtGoal", "Meta de pagamento de dívidas"],
                  ] as [keyof Plan, string][]).map(([key, label]) => (
                    <label key={key} style={{ display: "grid", gap: 8, fontWeight: 650, color: "#334155", fontSize: 14 }}>
                      {label}
                      <input
                        inputMode="decimal"
                        placeholder="0,00"
                        value={plan[key]}
                        onChange={e => update(key, e.target.value)}
                        style={{
                          ...fieldStyle,
                          width: "100%",
                          minWidth: 0,
                          boxSizing: "border-box",
                          padding: "13px 14px",
                          borderRadius: 11,
                          border: "1px solid #cbd5e1",
                          background: "#fff",
                          color: "#172033",
                          fontSize: 16,
                        }}
                      />
                    </label>
                  ))}
                  <button type="button" onClick={savePlan} disabled={saving} style={{ border: 0, borderRadius: 11, padding: "14px 16px", background: saving ? "#94a3b8" : "#176b52", color: "#fff", fontWeight: 750, fontSize: 15, cursor: saving ? "wait" : "pointer", boxShadow: "0 4px 10px rgba(23,107,82,0.16)" }}>
                    {saving ? "Salvando..." : "Salvar planejamento"}
                  </button>
                </div>
                </div>}
              </div>

              <div style={{ ...card, padding: 22, boxShadow: "0 6px 20px rgba(15,23,42,0.04)" }}>
                <button type="button" onClick={() => setSimulationOpen(open => !open)} aria-expanded={simulationOpen} style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", gap: 12, padding: 0, border: 0, background: "transparent", color: "#7c3aed", textAlign: "left", cursor: "pointer" }}>
                  <span style={{ fontSize: 20, lineHeight: 1.4, fontWeight: 750 }}>📊 Simulação do mês</span>
                  <span aria-hidden="true" style={{ fontSize: 20 }}>{simulationOpen ? "−" : "+"}</span>
                </button>
                {simulationOpen && <div>

                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7, margin: "14px 0 20px" }}>Estimativa calculada com os valores que você informou.</p>

                <div style={{
                  margin: "16px 0 22px",
                  padding: 16,
                  borderRadius: 14,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 10,
                  }}>
                    <span style={{ color: "#475569", fontWeight: 600 }}>
                      Renda comprometida
                    </span>
                    <strong style={{
                      color: totals.available < 0 ? "#b91c1c" : "#1d4ed8",
                    }}>
                      {totals.income > 0
                        ? `${Math.round(((totals.essentials + totals.other) / totals.income) * 100)}%`
                        : "Informe a renda"}
                    </strong>
                  </div>
                  <div
                    role="progressbar"
                    aria-label="Percentual da renda comprometida com gastos planejados"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={totals.income > 0
                      ? Math.min(100, Math.max(0, Math.round(((totals.essentials + totals.other) / totals.income) * 100)))
                      : 0}
                    style={{
                      height: 12,
                      overflow: "hidden",
                      borderRadius: 999,
                      background: "#e2e8f0",
                    }}
                  >
                    <div style={{
                      width: `${totals.income > 0
                        ? Math.min(100, Math.max(0, ((totals.essentials + totals.other) / totals.income) * 100))
                        : 0}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: totals.available < 0 ? "#dc2626"
                        : totals.income > 0 && (totals.essentials + totals.other) / totals.income >= 0.8
                          ? "#f59e0b" : "#16a34a",
                      transition: "width 200ms ease",
                    }} />
                  </div>
                  <p style={{
                    color: "#64748b",
                    fontSize: 12,
                    margin: "9px 0 0",
                  }}>
                    Considera gastos essenciais e outros gastos previstos; a meta de dívidas é exibida separadamente.
                  </p>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                  gap: 10,
                  marginBottom: 16,
                }}>
                  <div style={{
                    padding: 14,
                    borderRadius: 12,
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                  }}>
                    <span style={{ color: "#1d4ed8", fontSize: 13 }}>Meta para dívidas</span>
                    <strong style={{ display: "block", color: "#1d4ed8", fontSize: 19, marginTop: 5 }}>
                      {money(totals.goal)}
                    </strong>
                  </div>
                  <div style={{
                    padding: 14,
                    borderRadius: 12,
                    background: totals.afterGoal < 0 ? "#fef2f2" : "#f0fdf4",
                    border: `1px solid ${totals.afterGoal < 0 ? "#fecaca" : "#bbf7d0"}`,
                  }}>
                    <span style={{
                      color: totals.afterGoal < 0 ? "#b91c1c" : "#15803d",
                      fontSize: 13,
                    }}>Saldo após a meta</span>
                    <strong style={{
                      display: "block",
                      color: totals.afterGoal < 0 ? "#b91c1c" : "#15803d",
                      fontSize: 19,
                      marginTop: 5,
                      overflowWrap: "anywhere",
                    }}>
                      {money(totals.afterGoal)}
                    </strong>
                  </div>
                </div>
                {[
                  ["Renda prevista", totals.income],
                  ["Gastos essenciais", -totals.essentials],
                  ["Outros gastos", -totals.other],
                ].map(([label, value]) => (
                  <div key={String(label)} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "13px 0", borderBottom: "1px solid #edf0f4" }}>
                    <span>{label}</span><strong>{money(Number(value))}</strong>
                  </div>
                ))}
                <div style={{ padding: "18px 0", borderBottom: "1px solid #edf0f4" }}>
                  <span style={{ color: "#64748b" }}>Disponível após gastos planejados</span>
                  <strong style={{ display: "block", fontSize: 28, color: totals.available < 0 ? "#b91c1c" : "#176b52", marginTop: 5 }}>{money(totals.available)}</strong>
                </div>
                 {totals.available < 0 && <p style={{ color: "#b91c1c" }}>Seus gastos planejados ultrapassam a renda prevista. Revise o orçamento antes de definir pagamentos extras.</p>}
                {totals.goal > totals.available && <p style={{ color: "#b45309" }}>A meta para dívidas é maior que o valor disponível calculado.</p>}
                <p style={{ color: "#64748b", fontSize: 12, marginTop: 20 }}>A simulação não movimenta dinheiro nem altera dívidas ou saldos. O saldo da Carteira é mostrado separadamente e não é somado à renda mensal.</p>
                </div>}
              </div>
            </section>


          </>
        )}
      </main>
    </>
  );
}
