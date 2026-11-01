import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import styles from "../admin.module.css";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

const currency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const dateLabel = (value: string) =>
  new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR");

export default async function AdminDebtsPage() {
  const supabase = await getSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login?next=/admin/dividas");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    redirect("/dashboard");
  }

  const [
    { data: debts, error: debtsError },
    { data: payments, error: paymentsError },
  ] = await Promise.all([
    supabase
      .from("debts")
      .select(
        "id,user_id,name,creditor,amount,due_date,status,paid_amount,category,priority,payment_reported,created_at"
      )
      .order("due_date", { ascending: true }),

    supabase
      .from("debt_payments")
      .select("id,user_id,debt_id,account_id,amount,paid_at,created_at")
      .order("paid_at", { ascending: false }),
  ]);

  const debtItems = debts ?? [];
  const paymentItems = payments ?? [];

  const userIds = [
    ...new Set([
      ...debtItems.map((item) => item.user_id),
      ...paymentItems.map((item) => item.user_id),
    ]),
  ];

  const accountIds = [
    ...new Set(
      paymentItems
        .map((item) => item.account_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const [{ data: users, error: usersError }, { data: accounts }] =
    await Promise.all([
      userIds.length
        ? supabase
            .from("users")
            .select("id,name,email")
            .in("id", userIds)
        : Promise.resolve({ data: [], error: null }),

      accountIds.length
        ? supabase
            .from("wallet_accounts")
            .select("id,name")
            .in("id", accountIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  const usersById = new Map(
    (users ?? []).map((user) => [user.id, user])
  );

  const accountsById = new Map(
    (accounts ?? []).map((account) => [account.id, account.name])
  );

  const today = new Date().toISOString().slice(0, 10);

  const getPaid = (item: (typeof debtItems)[number]) =>
    Math.min(Number(item.paid_amount ?? 0), Number(item.amount));

  const getRemaining = (item: (typeof debtItems)[number]) =>
    Math.max(Number(item.amount) - getPaid(item), 0);

  const getStatus = (item: (typeof debtItems)[number]) => {
    if (getRemaining(item) <= 0) return "Quitada";
    if (item.due_date < today) return "Atrasada";
    return "Pendente";
  };

  const totalDebt = debtItems.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const totalPaid = debtItems.reduce(
    (sum, item) => sum + getPaid(item),
    0
  );

  const totalRemaining = debtItems.reduce(
    (sum, item) => sum + getRemaining(item),
    0
  );

  const pendingCount = debtItems.filter(
    (item) => getStatus(item) === "Pendente"
  ).length;

  const overdueCount = debtItems.filter(
    (item) => getStatus(item) === "Atrasada"
  ).length;

  const paidCount = debtItems.filter(
    (item) => getStatus(item) === "Quitada"
  ).length;

  const paymentTotal = paymentItems.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const loadError = debtsError || paymentsError;

  return (
    <AdminShell>
      <div className={styles.dashboardContent}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              RESGATA+ · ADMINISTRAÇÃO
            </span>
            <h1>Dívidas e pagamentos</h1>
            <p>
              Acompanhe os valores cadastrados, pagamentos realizados
              e pendências dos usuários.
            </p>
          </div>
          <a href="/admin" className={styles.back}>
            Voltar à visão geral
          </a>
        </header>

        {loadError ? (
          <section className={styles.panel}>
            <p className={styles.error}>
              Não foi possível carregar as dívidas e os pagamentos.
              Verifique as permissões administrativas no Supabase.
            </p>
          </section>
        ) : (
          <>
            <section className={styles.cards}>
              <article className={styles.card}>
                <span>Total de dívidas</span>
                <strong>{currency(totalDebt)}</strong>
                <small>{debtItems.length} registros cadastrados</small>
              </article>

              <article className={styles.card}>
                <span>Valor pago</span>
                <strong>{currency(totalPaid)}</strong>
                <small>Acumulado informado nas dívidas</small>
              </article>

              <article className={styles.card}>
                <span>Valor pendente</span>
                <strong>{currency(totalRemaining)}</strong>
                <small>Saldo restante das dívidas</small>
              </article>

              <article className={styles.card}>
                <span>Pagamentos registrados</span>
                <strong>{currency(paymentTotal)}</strong>
                <small>{paymentItems.length} movimentações</small>
              </article>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Situação das dívidas</h2>
                  <p>Classificação calculada a partir dos valores e vencimentos.</p>
                </div>
              </div>

              <div className={styles.cards}>
                <article className={styles.card}>
                  <span>Pendentes</span>
                  <strong>{pendingCount}</strong>
                </article>
                <article className={styles.card}>
                  <span>Atrasadas</span>
                  <strong>{overdueCount}</strong>
                </article>
                <article className={styles.card}>
                  <span>Quitadas</span>
                  <strong>{paidCount}</strong>
                </article>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Dívidas cadastradas</h2>
                  <p>Lista das dívidas e seus valores atualizados.</p>
                </div>
                <span className={styles.count}>
                  {debtItems.length} registros
                </span>
              </div>

              {debtItems.length === 0 ? (
                <p className={styles.empty}>
                  Nenhuma dívida encontrada.
                </p>
              ) : (
                <div className={styles.tableWrap}>
                  <table>
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Dívida / credor</th>
                        <th>Valor</th>
                        <th>Pago</th>
                        <th>Restante</th>
                        <th>Vencimento</th>
                        <th>Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debtItems.slice(0, 100).map((item) => {
                        const user = usersById.get(item.user_id);
                        const status = getStatus(item);

                        return (
                          <tr key={item.id}>
                            <td>
                              {user?.name ?? "Usuário não encontrado"}
                              <br />
                              <small>{user?.email ?? ""}</small>
                            </td>
                            <td>
                              {item.name}
                              <br />
                              <small>{item.creditor}</small>
                            </td>
                            <td>{currency(Number(item.amount))}</td>
                            <td>{currency(getPaid(item))}</td>
                            <td>{currency(getRemaining(item))}</td>
                            <td>{dateLabel(item.due_date)}</td>
                            <td>
                              <span className={styles.status}>
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {usersError && (
                <p className={styles.error}>
                  Não foi possível carregar os dados dos usuários.
                </p>
              )}
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Histórico de pagamentos</h2>
                  <p>Os 50 pagamentos mais recentes registrados.</p>
                </div>
                <span className={styles.count}>
                  {paymentItems.length} pagamentos
                </span>
              </div>

              {paymentItems.length === 0 ? (
                <p className={styles.empty}>
                  Nenhum pagamento registrado.
                </p>
              ) : (
                <div className={styles.tableWrap}>
                  <table>
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Valor</th>
                        <th>Carteira</th>
                        <th>Data do pagamento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentItems.slice(0, 50).map((item) => {
                        const user = usersById.get(item.user_id);

                        return (
                          <tr key={item.id}>
                            <td>
                              {user?.name ?? "Usuário não encontrado"}
                              <br />
                              <small>{user?.email ?? ""}</small>
                            </td>
                            <td>{currency(Number(item.amount))}</td>
                            <td>
                              {item.account_id
                                ? accountsById.get(item.account_id) ?? "Carteira não encontrada"
                                : "Não informada"}
                            </td>
                            <td>{dateLabel(item.paid_at)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <footer className={styles.footer}>
              Consulta administrativa somente para leitura. Os valores
              pagos nas dívidas vêm de paid_amount; o histórico de
              pagamentos é apresentado separadamente para conferência.
            </footer>
          </>
        )}
      </div>
    </AdminShell>
  );
}
