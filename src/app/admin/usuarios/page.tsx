import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import styles from "../admin.module.css";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await getSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login?next=/admin/usuarios");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    redirect("/dashboard");
  }

  const { data: users, error, count } = await supabase
    .from("users")
    .select("id, name, email, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <AdminShell>
      <div className={styles.dashboardContent}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              RESGATA+ · ADMINISTRAÇÃO
            </span>
            <h1>Usuários cadastrados</h1>
            <p>
              Consulte os perfis registrados na plataforma.
            </p>
          </div>
          <a href="/admin" className={styles.back}>
            Voltar à visão geral
          </a>
        </header>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Lista de usuários</h2>
              <p>Exibindo os 50 cadastros mais recentes.</p>
            </div>
            <span className={styles.count}>
              {count ?? 0} usuários
            </span>
          </div>

          {error ? (
            <p className={styles.error}>
              Não foi possível carregar os usuários.
            </p>
          ) : !users || users.length === 0 ? (
            <p className={styles.empty}>
              Nenhum usuário encontrado.
            </p>
          ) : (
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Data de cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        {new Date(user.created_at).toLocaleDateString(
                          "pt-BR",
                          { timeZone: "UTC" }
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className={styles.footer}>
          Dados consultados com a proteção administrativa do Supabase.
        </footer>
      </div>
    </AdminShell>
  );
}
