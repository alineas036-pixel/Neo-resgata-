"use client";

import AppHeader from "@/components/AppHeader";
import styles from "./lembretes.module.css";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Reminder = { id: string; kind: "Dívida" | "Conta"; name: string; amount: number; due_date: string; status: string };
const money = (v: number) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const dateLabel = (s: string) => { const [y,m,d] = s.split("-"); return `${d}/${m}/${y}`; };

type DebtRow = {
  id: string;
  name: string;
  amount: number | string | null;
  paid_amount: number | string | null;
  due_date: string | null;
  status: string | null;
};

type AccountRow = {
  id: string;
  name: string;
  amount: number | string | null;
  due_date: string | null;
  status: string | null;
  account_type: string | null;
};

export default function RemindersPage() {
  const router = useRouter();
  const [items, setItems] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  const load = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (!auth.user) {
      router.replace("/login");
      return;
    }
    if (authError) throw authError;
    const [debts, accounts] = await Promise.all([
      supabase.from("debts").select("id,name,amount,paid_amount,due_date,status").order("due_date", { ascending: true }),
      supabase.from("control_accounts").select("id,name,amount,due_date,status,account_type").order("due_date", { ascending: true }),
    ]);
    if (debts.error) throw debts.error;
    if (accounts.error) throw accounts.error;
    
    const debtRows = (debts.data ?? []) as DebtRow[];
const accountRows = (accounts.data ?? []) as AccountRow[];

const debtItems: Reminder[] = debtRows
  .filter(
    (d) =>
      d.due_date &&
      d.status !== "pago" &&
      Number(d.amount || 0) - Number(d.paid_amount || 0) > 0
  )
  .map((d) => ({
    id: d.id,
    kind: "Dívida",
    name: d.name,
    amount: Math.max(
      0,
      Number(d.amount || 0) - Number(d.paid_amount || 0)
    ),
    due_date: d.due_date!,
    status: d.status ?? "pendente",
  }));

const accountItems: Reminder[] = accountRows
  .filter(
    (a) =>
      a.due_date &&
      a.status === "pendente" &&
      a.account_type !== "receita"
  )
  .map((a) => ({
    id: a.id,
    kind: "Conta",
    name: a.name,
    amount: Number(a.amount || 0),
    due_date: a.due_date!,
    status: a.status ?? "pendente",
  }));

    setItems([...debtItems, ...accountItems].sort((a,b) => a.due_date.localeCompare(b.due_date)));
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) setPermission(Notification.permission);
    let active = true;
    void load().catch((e) => { if (active) setError(e instanceof Error ? e.message : "Não foi possível carregar os lembretes."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [load]);

  const today = todayKey();
  const upcoming = useMemo(() => items.filter(x => x.due_date >= today && x.due_date <= (() => { const d = new Date(); d.setDate(d.getDate()+7); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })()), [items, today]);
  const overdue = useMemo(() => items.filter(x => x.due_date < today), [items, today]);
  const todayItems = useMemo(() => items.filter(x => x.due_date === today), [items, today]);

  useEffect(() => {
    if (loading || permission !== "granted" || !("Notification" in window) || items.length === 0) return;
    const key = `resgata-reminders-shown-${today}`;
    if (window.localStorage.getItem(key)) return;
    const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate()+1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();
    const candidates = items.filter(x => x.due_date <= tomorrow).slice(0, 4);
    if (candidates.length === 0) return;
    new Notification("Resgata+ — lembrete financeiro", { body: candidates.map(x => `${x.name}: ${x.due_date < today ? "vencida" : x.due_date === today ? "vence hoje" : "vence amanhã"}`).join(" • ") });
    window.localStorage.setItem(key, "1");
  }, [items, loading, permission, today]);

  async function enableNotifications() {
    setError(""); setNotice("");
    if (!("Notification" in window)) { setPermission("unsupported"); setNotice("Este navegador não oferece notificações. Você ainda pode consultar os lembretes nesta página."); return; }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result !== "granted") { setNotice("As notificações não foram autorizadas. Você pode continuar vendo os vencimentos nesta página."); return; }
    const candidates = items.filter(x => x.due_date <= todayKey() || x.due_date <= (() => { const d = new Date(); d.setDate(d.getDate()+1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })()).slice(0, 4);
    if (candidates.length) {
      new Notification("Resgata+ — lembrete financeiro", { body: candidates.map(x => `${x.name}: ${x.due_date < todayKey() ? "vencida" : x.due_date === todayKey() ? "vence hoje" : "vence amanhã"}`).join(" • ") });
    } else {
      new Notification("Resgata+", { body: "Tudo certo: não há contas ou dívidas vencendo hoje ou amanhã." });
    }
    window.localStorage.setItem(`resgata-reminders-shown-${todayKey()}`, "1");
    setNotice("Avisos ativados neste navegador. Você receberá um resumo ao abrir esta página; para notificações com o aplicativo fechado, será necessária uma configuração adicional.");
  }

  return (
    <main className={styles.page}>
      <AppHeader />

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>RESGATA+ · ORGANIZAÇÃO FINANCEIRA</span>
          <h1>Seus vencimentos sob controle.</h1>
          <p>
            Acompanhe suas dívidas e contas, saiba o que precisa de atenção
            e organize seus próximos passos sem conectar seu banco.
          </p>
          <button className={styles.notificationButton} onClick={() => void enableNotifications()}>
            <span aria-hidden="true">♧</span>
            {permission === "granted" ? "Testar meus avisos" : "Ativar avisos neste dispositivo"}
          </button>
        </div>
        <div className={styles.heroDecoration} aria-hidden="true">
          <span>✓</span>
          <small>Mais clareza, um passo de cada vez.</small>
        </div>
      </section>

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className={styles.notice}>
          {notice}
        </p>
      )}
      {permission === "unsupported" && (
        <p className={styles.notice}>
          Notificações não são compatíveis com este navegador. Você ainda pode consultar seus vencimentos nesta página.
        </p>
      )}

      <section className={styles.summary}>
        <article className={`${styles.statCard} ${styles.overdue}`}>
          <span className={styles.statIcon}>!</span>
          <div>
            <p>Vencidas</p>
            <strong>{loading ? "—" : overdue.length}</strong>
            <small>Precisam de atenção</small>
          </div>
        </article>

        <article className={`${styles.statCard} ${styles.today}`}>
          <span className={styles.statIcon}>◷</span>
          <div>
            <p>Vencem hoje</p>
            <strong>{loading ? "—" : todayItems.length}</strong>
            <small>Seu foco de hoje</small>
          </div>
        </article>

        <article className={`${styles.statCard} ${styles.upcoming}`}>
          <span className={styles.statIcon}>▦</span>
          <div>
            <p>Próximos 7 dias</p>
            <strong>{loading ? "—" : upcoming.length}</strong>
            <small>Planeje com antecedência</small>
          </div>
        </article>
      </section>

      <section className={styles.agenda}>
        <div className={styles.agendaHeader}>
          <div>
            <span className={styles.sectionEyebrow}>SUA ROTINA FINANCEIRA</span>
            <h2>Agenda de vencimentos</h2>
            <p>Contas e dívidas organizadas pela data de vencimento.</p>
          </div>
          <span className={styles.totalBadge}>
            {loading ? "Carregando..." : `${items.length} ${items.length === 1 ? "compromisso" : "compromissos"}`}
          </span>
        </div>

        {loading ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>◷</span>
            <strong>Organizando sua agenda...</strong>
            <p>Estamos buscando suas contas e dívidas.</p>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>✓</span>
            <strong>Sua agenda está livre por enquanto!</strong>
            <p>
              Quando você cadastrar contas ou dívidas com data de vencimento,
              elas aparecerão aqui automaticamente.
            </p>
            <div className={styles.emptyActions}>
              <a href="/dividas">Organizar dívidas <span>↗</span></a>
              <a href="/controle-contas">Cadastrar contas <span>↗</span></a>
            </div>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Vencimento</th>
                  <th>Valor pendente</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isOverdue = item.due_date < today;
                  const isToday = item.due_date === today;
                  const tomorrow = (() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  })();
                  const label = isOverdue
                    ? "Atrasada"
                    : isToday
                    ? "Vence hoje"
                    : item.due_date === tomorrow
                    ? "Vence amanhã"
                    : "Programada";

                  return (
                    <tr key={`${item.kind}-${item.id}`}>
                      <td>
                        <span className={`${styles.kind} ${item.kind === "Dívida" ? styles.debtKind : styles.accountKind}`}>
                          {item.kind}
                        </span>
                      </td>
                      <td className={styles.description}>{item.name}</td>
                      <td>{dateLabel(item.due_date)}</td>
                      <td className={styles.amount}>{money(item.amount)}</td>
                      <td>
                        <span className={`${styles.status} ${isOverdue ? styles.statusOverdue : isToday ? styles.statusToday : styles.statusScheduled}`}>
                          {label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className={styles.tip}>
        <span aria-hidden="true">✦</span>
        <p>
          <strong>Uma dica para sua organização:</strong> mantenha as datas e os
          valores atualizados. Os avisos do navegador são exibidos quando você
          ativa as notificações e acessa esta página; alertas com o aplicativo
          fechado exigem configuração adicional.
        </p>
      </div>
    </main>
  );
}
