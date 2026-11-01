import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import styles from "../admin.module.css";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

const numberLabel = (value: number) =>
  value.toLocaleString("pt-BR");

const monthLabel = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export default async function AdminReportsPage() {
  const supabase = await getSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login?next=/admin/relatorios");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    redirect("/dashboard");
  }

  const statuses = [
    { value: "trial", label: "Em período de teste" },
    { value: "active", label: "Ativas" },
    { value: "past_due", label: "Com pagamento pendente" },
    { value: "canceled", label: "Canceladas" },
    { value: "expired", label: "Expiradas" },
  ];

  const now = new Date();

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - index), 1)
    );

    const nextMonth = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)
    );

    return {
      date,
      label: monthLabel(date),
      start: date.toISOString(),
      end: nextMonth.toISOString(),
    };
  });

  const [
    usersResult,
    debtsResult,
    paymentsResult,
    subscriptionsResult,
    ...remainingResults
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("debts").select("id", { count: "exact", head: true }),
    supabase.from("debt_payments").select("id", { count: "exact", head: true }),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }),

    ...statuses.map(({ value }) =>
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", value)
    ),

    ...months.map(({ start, end }) =>
      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .gte("created_at", start)
        .lt("created_at", end)
    ),
  ]);

  const subscriptionStatusResults = remainingResults.slice(
    0,
    statuses.length
  );

  const monthlyResults = remainingResults.slice(statuses.length);

  const errors = [
    usersResult.error,
    debtsResult.error,
    paymentsResult.error,
    subscriptionsResult.error,
    ...remainingResults.map((result) => result.error),
  ].filter(Boolean);

  const subscriptionRows = statuses.map((status, index) => ({
    ...status,
    count: subscriptionStatusResults[index]?.count ?? 0,
  }));

  const monthlyRows = months.map((month, index) => ({
    ...month,
    count: monthlyResults[index]?.count ?? 0,
  }));

  const maxMonthlyCount = Math.max(
    1,
    ...monthlyRows.map((month) => month.count)
  );

  const totalUsers = usersResult.count ?? 0;
  const totalDebts = debtsResult.count ?? 0;
  const totalPayments = paymentsResult.count ?? 0;
  const totalSubscriptions = subscriptionsResult.count ?? 0;

  return (
    <AdminShell>
      <div className={styles.dashboardContent}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              RESGATA+ · ADMINISTRAÇÃO
            </span>
            <h1>Relatórios</h1>
            <p>
              Acompanhe os principais indicadores e a evolução
              dos cadastros na plataforma.
            </p>
          </div>

          <a href="/admin" className={styles.back}>
            Voltar à visão geral
          </a>
        </header>

        {errors.length > 0 ? (
          <section className={styles.panel}>
            <p className={styles.error}>
              Não foi possível carregar todos os relatórios.
              Verifique as permissões administrativas e a conexão
              com o Supabase.
            </p>
          </section>
        ) : (
          <>
            <section className={styles.cards}>
              <article className={styles.card}>
                <span>Usuários cadastrados</span>
                <strong>{numberLabel(totalUsers)}</strong>
                <small>Total de contas registradas</small>
              </article>

              <article className={styles.card}>
                <span>Dívidas cadastradas</span>
                <strong>{numberLabel(totalDebts)}</strong>
                <small>Registros na plataforma</small>
              </article>

              <article className={styles.card}>
                <span>Pagamentos registrados</span>
                <strong>{numberLabel(totalPayments)}</strong>
                <small>Movimentações de pagamento</small>
              </article>

              <article className={styles.card}>
                <span>Assinaturas</span>
                <strong>{numberLabel(totalSubscriptions)}</strong>
                <small>Registros de assinatura</small>
              </article>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Cadastros nos últimos seis meses</h2>
                  <p>
                    Quantidade de novos usuários por mês,
                    considerando a data de cadastro.
                  </p>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Mês</th>
                      <th>Novos usuários</th>
                      <th>Representação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyRows.map((month) => (
                      <tr key={month.start}>
                        <td>
                          {month.label.charAt(0).toUpperCase() +
                            month.label.slice(1)}
                        </td>
                        <td>{numberLabel(month.count)}</td>
                        <td>
                          <div
                            style={{
                              width: "100%",
                              maxWidth: "220px",
                              height: "9px",
                              borderRadius: "20px",
                              background: "#edf1f3",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${(month.count / maxMonthlyCount) * 100}%`,
                                height: "100%",
                                borderRadius: "20px",
                                background: "#238b76",
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Situação das assinaturas</h2>
                  <p>
                    Distribuição dos registros conforme o status
                    armazenado no Supabase.
                  </p>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Situação</th>
                      <th>Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptionRows.map((item) => (
                      <tr key={item.value}>
                        <td>{item.label}</td>
                        <td>{numberLabel(item.count)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <footer className={styles.footer}>
              Relatório administrativo somente para leitura.
              As quantidades são consultas exatas ao banco de dados.
              Os cadastros mensais consideram os últimos seis meses.
            </footer>
          </>
        )}
      </div>
    </AdminShell>
  );
}
