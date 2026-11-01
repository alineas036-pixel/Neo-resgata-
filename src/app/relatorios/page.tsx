"use client";

import AppHeader from "@/components/AppHeader";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Debt = { id: string; name: string; amount: number | string; paid_amount?: number | string | null; due_date: string; status: string };
type Wallet = { id: string; name: string; balance: number | string; account_type: string };
type Payment = { id: string; debt_id: string; account_id: string; amount: number | string; paid_at: string; created_at?: string };
type Account = { id: string; name: string; account_type: string; amount: number | string; due_date: string | null; paid_at: string | null; status: string; created_at: string };

const num = (v: number | string | null | undefined) => Number(v ?? 0) || 0;
const money = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const localDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const currentMonth = () => localDate().slice(0, 7);

export default function RelatoriosPage() {
  const router = useRouter();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [start, setStart] = useState(`${currentMonth()}-01`);
  const [end, setEnd] = useState(localDate());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        const [d, w, p, a] = await Promise.all([
          supabase.from("debts").select("id,name,amount,paid_amount,due_date,status").eq("user_id", auth.user.id),
          supabase.from("wallet_accounts").select("id,name,balance,account_type").eq("user_id", auth.user.id),
          supabase.from("debt_payments").select("id,debt_id,account_id,amount,paid_at,created_at").eq("user_id", auth.user.id),
          supabase.from("control_accounts").select("id,name,account_type,amount,due_date,paid_at,status,created_at").eq("user_id", auth.user.id),
        ]);
        if (d.error) throw d.error;
        if (w.error) throw w.error;
        if (p.error) throw p.error;
        if (a.error) throw a.error;
        if (!active) return;
        setDebts((d.data ?? []) as Debt[]);
        setWallets((w.data ?? []) as Wallet[]);
        setPayments((p.data ?? []) as Payment[]);
        setAccounts((a.data ?? []) as Account[]);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Não foi possível carregar os relatórios.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [router]);

  const totals = useMemo(() => {
    const walletBalance = wallets.reduce((s, w) => s + num(w.balance), 0);
    const debtTotal = debts.reduce((s, d) => s + num(d.amount), 0);
    const debtPaid = debts.reduce((s, d) => s + Math.min(num(d.amount), Math.max(0, num(d.paid_amount))), 0);
    const debtOpen = debts.reduce((s, d) => s + Math.max(0, num(d.amount) - num(d.paid_amount)), 0);
    const filteredPayments = payments.filter(p => {
      const date = (p.paid_at || p.created_at || "").slice(0, 10);
      return date >= start && date <= end;
    });
    const periodAccounts = accounts.filter(a => {
      if (a.status === "cancelado") return false;
      const date = (a.status === "pago"
        ? a.paid_at || a.due_date || a.created_at
        : a.due_date || a.created_at || "").slice(0, 10);
      return date >= start && date <= end;
    });
    const incomeReceived = periodAccounts
      .filter(a => a.account_type === "receita" && a.status === "pago")
      .reduce((s, a) => s + num(a.amount), 0);
    const incomePending = periodAccounts
      .filter(a => a.account_type === "receita" && a.status === "pendente")
      .reduce((s, a) => s + num(a.amount), 0);
    const expensesPaid = periodAccounts
      .filter(a => a.account_type !== "receita" && a.status === "pago")
      .reduce((s, a) => s + num(a.amount), 0);
    const expensesPending = periodAccounts
      .filter(a => a.account_type !== "receita" && a.status === "pendente")
      .reduce((s, a) => s + num(a.amount), 0);
    const paymentTotal = filteredPayments.reduce((s, p) => s + num(p.amount), 0);
    return { walletBalance, debtTotal, debtPaid, debtOpen, filteredPayments, incomeReceived, incomePending, expensesPaid, expensesPending, paymentTotal };
  }, [debts, wallets, payments, accounts, start, end]);

  const card: React.CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20, minWidth: 0 };
  const field: React.CSSProperties = { padding: 11, border: "1px solid #cbd5e1", borderRadius: 9, background: "#fff" };

  const financialCharts = (() => {
              const money = (value: number) =>
                value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL"
                });

              const percent = (value: number, total: number) =>
                total > 0 ? (value / total) * 100 : 0;

              const donut = (
                parts: { value: number; color: string }[],
                total: number
              ) => {
                let cursor = 0;
                const stops = parts.map((part) => {
                  const start = cursor;
                  cursor += total > 0 ? (part.value / total) * 100 : 0;
                  return `${part.color} ${start}% ${cursor}%`;
                });

                if (total <= 0) return "#e5e7eb";

                return `conic-gradient(${stops.join(", ")})`;
              };

              const cardStyle: React.CSSProperties = {
                background: "var(--card, #fff)",
                border: "1px solid var(--border, #e5e7eb)",
                borderRadius: 18,
                padding: 20,
                minWidth: 0,
                boxShadow: "0 4px 18px rgba(15,23,42,.05)"
              };

              const legend = (
                label: string,
                value: number,
                total: number,
                color: string
              ) => (
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 9,
                  marginBottom: 14
                }}>
                  <span style={{
                    width: 10,
                    height: 10,
                    minWidth: 10,
                    borderRadius: "50%",
                    background: color,
                    marginTop: 5
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, opacity: .8 }}>{label}</div>
                    <strong style={{ display: "block", marginTop: 3 }}>
                      {money(value)}
                    </strong>
                    <small style={{ opacity: .65 }}>
                      {percent(value, total).toLocaleString("pt-BR", {
                        maximumFractionDigits: 1
                      })}%
                    </small>
                  </div>
                </div>
              );

              const chart = (
                title: string,
                subtitle: string,
                total: number,
                parts: { label: string; value: number; color: string }[],
                note: string
              ) => (
                <div style={{
                  ...cardStyle,
                  borderTop: `4px solid ${title.includes("Dívidas") ? "#7c3aed" : "#2563eb"}`
                }}>
                  <div style={{
                    background: title.includes("Dívidas") ? "#f5f3ff" : "#eff6ff",
                    color: title.includes("Dívidas") ? "#6d28d9" : "#1d4ed8",
                    padding: "12px 14px",
                    borderRadius: 10,
                    marginBottom: 16
                  }}>
                    <h3 style={{ margin: "0 0 5px", fontSize: 18, fontWeight: 800 }}>
                      {title}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: 13,
                      opacity: .85
                    }}>
                      {subtitle}
                    </p>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(115px, .9fr) minmax(120px, 1fr)",
                    alignItems: "center",
                    gap: 16
                  }}>
                    <div style={{
                      width: "100%",
                      maxWidth: 175,
                      aspectRatio: "1",
                      borderRadius: "50%",
                      background: donut(parts, total),
                      display: "grid",
                      placeItems: "center",
                      margin: "0 auto"
                    }}>
                      <div style={{
                        width: "58%",
                        aspectRatio: "1",
                        borderRadius: "50%",
                        background: "var(--card, #fff)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        padding: 4,
                        boxSizing: "border-box"
                      }}>
                        <strong style={{
                          fontSize: 15,
                          overflowWrap: "anywhere"
                        }}>
                          {money(total)}
                        </strong>
                        <small style={{ opacity: .65 }}>Total</small>
                      </div>
                    </div>

                    <div>
                      {parts.map((part) => (
                        <div key={part.label}>
                          {legend(part.label, part.value, total, part.color)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <p style={{
                    background: "var(--muted, #f8fafc)",
                    borderRadius: 10,
                    padding: 12,
                    margin: "18px 0 0",
                    fontSize: 12,
                    lineHeight: 1.5,
                    opacity: .8
                  }}>
                    {note}
                  </p>
                </div>
              );

              const debtTotal = Math.max(0, totals.debtTotal);
              const debtPaid = Math.min(debtTotal, Math.max(0, totals.debtPaid));
              const debtOpen = Math.max(0, debtTotal - debtPaid);

              const income = Math.max(0, totals.incomeReceived);
              const expenses = Math.max(0, totals.expensesPaid);
              const payments = Math.max(0, totals.paymentTotal);
              const movementTotal = income + expenses + payments;

              const accounts = Array.isArray(wallets) ? wallets : [];

              return [
                  <div key="debt-chart">{chart(
                    "💳 Dívidas",
                    "Original, pago e saldo em aberto",
                    debtTotal,
                    [
                      { label: "Total pago", value: debtPaid, color: "#10b981" },
                      { label: "Em aberto", value: debtOpen, color: "#ef4444" }
                    ],
                    "O valor pago e o saldo em aberto são partes do valor original."
                  )}</div>,

                  <div key="movement-chart">{chart(
                    "🔄 Movimentações",
                    "Receitas, despesas e pagamentos no período",
                    movementTotal,
                    [
                      { label: "Receitas recebidas", value: income, color: "#10b981" },
                      { label: "Despesas pagas", value: expenses, color: "#ef4444" },
                      { label: "Pagamentos de dívidas", value: payments, color: "#2563eb" }
                    ],
                    "Os pagamentos de dívidas ficam separados das despesas para evitar dupla contagem."
                  )}</div>,

                  <div key="wallet-chart" style={{
                    ...cardStyle,
                    borderTop: "4px solid #059669"
                  }}>
                    <div style={{
                      background: "#ecfdf5",
                      color: "#166534",
                      padding: "12px 14px",
                      borderRadius: 10,
                      marginBottom: 16
                    }}>
                      <h3 style={{ margin: "0 0 5px", fontSize: 18, fontWeight: 800 }}>
                        👛 Saldo por conta
                      </h3>
                      <p style={{
                        margin: 0,
                        fontSize: 13,
                        opacity: .85
                      }}>
                        Comparação dos saldos atuais
                      </p>
                    </div>

                    {accounts.length === 0 ? (
                      <p style={{ opacity: .7 }}>
                        Nenhuma conta encontrada.
                      </p>
                    ) : (
                      <>
                        {accounts.map((account: Record<string, unknown>, index: number) => {
                          const name = String(
                            account.name ?? `Conta ${index + 1}`
                          );
                          const value = Math.max(
                            0,
                            Number(account.balance ?? 0)
                          );
                          const accountTotal = accounts.reduce(
                            (sum: number, item: Record<string, unknown>) =>
                              sum + Math.max(
                                0,
                                Number(item.balance ?? 0)
                              ),
                            0
                          );
                          const colors = ["#059669", "#7c3aed", "#f97316", "#2563eb", "#db2777"];
                          const color = colors[index % colors.length];
                          const share = percent(value, accountTotal);

                          return (
                            <div key={name} style={{ marginBottom: 20 }}>
                              <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 10,
                                marginBottom: 8,
                                fontSize: 13
                              }}>
                                <strong>{name}</strong>
                                <strong>{money(value)}</strong>
                              </div>
                              <div style={{
                                height: 12,
                                background: "#e5e7eb",
                                borderRadius: 99,
                                overflow: "hidden"
                              }}>
                                <div style={{
                                  height: "100%",
                                  width: `${Math.min(100, share)}%`,
                                  background: color,
                                  borderRadius: 99,
                                  transition: "width .3s ease"
                                }} />
                              </div>
                              <small style={{ opacity: .65 }}>
                                {share.toLocaleString("pt-BR", {
                                  maximumFractionDigits: 1
                                })}% do saldo
                              </small>
                            </div>
                          );
                        })}
                        <div style={{
                          padding: 15,
                          borderRadius: 12,
                          background: "#f3e8ff",
                          color: "#6b21a8"
                        }}>
                          <small>Saldo total da Carteira</small>
                          <div style={{ fontSize: 23, fontWeight: 800 }}>
                            {money(accounts.reduce(
                              (sum: number, account: Record<string, unknown>) =>
                                sum + Number(
                                  account.balance ?? 0
                                ),
                              0
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
              ];
  })();



  return (
    <>
      <AppHeader />
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 18px 50px", color: "#172033" }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ color: "#64748b", margin: "0 0 6px" }}></p>
          <h1 style={{ fontSize: "clamp(26px,4vw,36px)", margin: 0 }}>Relatórios Financeiros</h1>
          <p style={{ color: "#64748b" }}>Indicadores calculados a partir dos registros da sua conta.</p>
        </div>

        <section style={{ ...card, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "end", marginBottom: 20 }}>
          <label style={{ display: "grid", gap: 6, fontWeight: 600 }}>Data inicial<input type="date" value={start} max={end} onChange={e => setStart(e.target.value)} style={field} /></label>
          <label style={{ display: "grid", gap: 6, fontWeight: 600 }}>Data final<input type="date" value={end} min={start} onChange={e => setEnd(e.target.value)} style={field} /></label>
          <button type="button" onClick={() => { setStart(`${currentMonth()}-01`); setEnd(localDate()); }} style={{ padding: "11px 15px", borderRadius: 9, border: 0, background: "#e2e8f0", fontWeight: 700, cursor: "pointer" }}>Mês atual</button>
        </section>

        {error && <p role="alert" style={{ background: "#fef2f2", color: "#991b1b", padding: 12, borderRadius: 10 }}>{error}</p>}
        {loading ? <p>Carregando relatórios...</p> : !error && <>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14, marginBottom: 20 }}>
            {[
              ["Total geral das dívidas", money(totals.debtTotal), "Valor original cadastrado", "#2563eb", "#eff6ff", "#bfdbfe"],
              ["Total pago nas dívidas", money(totals.debtPaid), "Calculado pelos valores pagos nas dívidas", "#15803d", "#f0fdf4", "#bbf7d0"],
              ["Dívidas em aberto", money(totals.debtOpen), "Saldo restante", "#b91c1c", "#fef2f2", "#fecaca"],
              ["Saldo total da Carteira", money(totals.walletBalance), "Saldos atuais das contas", "#176b52", "#ecfdf5", "#a7f3d0"],
            ].map(([title, value, note, accent, background, borderColor]) => <article key={title} style={{
              ...card,
              background,
              border: `1px solid ${borderColor}`,
              borderTop: `4px solid ${accent}`,
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
            }}>
              <div style={{ color: accent, fontSize: 14, fontWeight: 700 }}>{title}</div>
              <strong style={{ display: "block", color: accent, fontSize: 27, margin: "12px 0 8px", overflowWrap: "anywhere" }}>{value}</strong>
              <small style={{ color: "#64748b", lineHeight: 1.5 }}>{note}</small>
            </article>)}
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 18 }}>
            <details open style={{ ...card, padding: 0, overflow: "hidden" }}>
              <summary style={{ cursor: "pointer", padding: "18px 20px", background: "#eff6ff", color: "#1d4ed8", fontWeight: 800, fontSize: 20, borderBottom: "1px solid #bfdbfe" }}>Movimentações no período <span style={{ fontSize: 12, fontWeight: 500 }}>— clique para abrir ou fechar</span></summary>
              <div style={{ padding: 20 }}>
              <p style={{ color: "#64748b", fontSize: 13 }}>De {start} até {end}</p>
              {[
                ["Pagamentos de dívidas registrados", money(totals.paymentTotal)],
                ["Quantidade de pagamentos", String(totals.filteredPayments.length)],
                ["Receitas recebidas", money(totals.incomeReceived)],
                ["Receitas pendentes", money(totals.incomePending)],
                ["Despesas marcadas como pagas", money(totals.expensesPaid)],
                ["Despesas ainda pendentes", money(totals.expensesPending)],
              ].map(([label, value]) => {
                const isIncome = label.startsWith("Receitas");
                const isExpense = label.startsWith("Despesas");
                const isPayment = label.startsWith("Pagamentos");
                const accent = isIncome ? "#15803d" : isExpense ? "#b91c1c" : isPayment ? "#1d4ed8" : "#475569";
                const tint = isIncome ? "#f0fdf4" : isExpense ? "#fef2f2" : isPayment ? "#eff6ff" : "#f8fafc";
                return <div key={label} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 14px",
                  marginBottom: 8,
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  background: tint,
                }}>
                  <span style={{ color: "#334155", fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>{label}</span>
                  <strong style={{ textAlign: "right", color: accent, fontSize: 15, whiteSpace: "nowrap" }}>{value}</strong>
                </div>;
              })}
              <p style={{ color: "#64748b", fontSize: 12, marginBottom: 0 }}>O histórico de pagamentos é apresentado separadamente do total pago nas dívidas para evitar dupla contagem.</p>
              {financialCharts[1]}
              </div>
            </details>

            <details open style={{ ...card, padding: 0, overflow: "hidden" }}>
              <summary style={{ cursor: "pointer", padding: "18px 20px", background: "#ecfdf5", color: "#176b52", fontWeight: 800, fontSize: 20, borderBottom: "1px solid #a7f3d0" }}>Saldo por conta <span style={{ fontSize: 12, fontWeight: 500 }}>— clique para abrir ou fechar</span></summary>
              <div style={{ padding: 20 }}>
              {wallets.length === 0 ? <p style={{ color: "#64748b", padding: 12 }}>Nenhuma conta cadastrada na Carteira.</p> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))", gap: 12 }}>
                {wallets.map(w => <div key={w.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  minWidth: 0,
                  padding: 15,
                  border: "1px solid #bbf7d0",
                  borderRadius: 14,
                  background: "#f0fdf4",
                }}>
                  <div aria-hidden="true" style={{
                    width: 42,
                    height: 42,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 12,
                    background: "#dcfce7",
                    color: "#166534",
                    fontSize: 20,
                    fontWeight: 800,
                  }}>R$</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: "#166534", fontWeight: 800, overflowWrap: "anywhere" }}>{w.name}</div>
                    <small style={{ display: "block", color: "#64748b", marginTop: 3 }}>{w.account_type}</small>
                    <strong style={{ display: "block", color: "#15803d", fontSize: 17, marginTop: 7, overflowWrap: "anywhere" }}>{money(num(w.balance))}</strong>
                  </div>
                </div>)}
              </div>}
              {financialCharts[2]}
              </div>
            </details>
          </section>

          <details open style={{ ...card, marginTop: 18, padding: 0, overflow: "hidden" }}>
            <summary style={{ cursor: "pointer", padding: "18px 20px", background: "#f5f3ff", color: "#6d28d9", fontWeight: 800, fontSize: 20, borderBottom: "1px solid #ddd6fe" }}>Dívidas por situação <span style={{ fontSize: 12, fontWeight: 500 }}>— clique para abrir ou fechar</span></summary>
            <div style={{ padding: 20 }}>
            {debts.length === 0 ? <p>Nenhuma dívida cadastrada.</p> : <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560, fontSize: 14 }}>
                <thead><tr>{["Dívida", "Vencimento", "Valor original", "Pago", "Em aberto"].map(h => <th key={h} style={{ textAlign: "left", padding: 12, borderBottom: "2px solid #111827", background: "#f1f5f9", color: "#111827", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
                <tbody>{debts.slice().sort((a,b) => a.due_date.localeCompare(b.due_date)).map(d => {
                  const amount = num(d.amount);
                  const paid = Math.min(amount, Math.max(0, num(d.paid_amount)));
                  return <tr key={d.id}>
                    <td style={{ padding: 12, borderBottom: "1px solid #edf0f4", color: "#111827", fontWeight: 800 }}>{d.name}</td>
                    <td style={{ padding: 12, borderBottom: "1px solid #edf0f4", color: "#334155", fontWeight: 600, whiteSpace: "nowrap" }}>{d.due_date ? new Date(`${d.due_date}T12:00:00`).toLocaleDateString("pt-BR") : "—"}</td>
                    <td style={{ padding: 12, borderBottom: "1px solid #edf0f4", color: "#1e3a8a", fontWeight: 800, whiteSpace: "nowrap" }}>{money(amount)}</td>
                    <td style={{ padding: 12, borderBottom: "1px solid #edf0f4", color: "#15803d", fontWeight: 800, whiteSpace: "nowrap" }}>{money(paid)}</td>
                    <td style={{ padding: 12, borderBottom: "1px solid #edf0f4", color: Math.max(0, amount - paid) > 0 ? "#dc2626" : "#15803d", fontWeight: 800, whiteSpace: "nowrap" }}>{money(Math.max(0, amount - paid))}</td>
                  </tr>;
                })}</tbody>
              </table>
            </div>}
            {financialCharts[0]}
            </div>
          </details>
        </>}
      </main>
    </>
  );
}
