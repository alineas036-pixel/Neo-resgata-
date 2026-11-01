
"use client";

import { useEffect, useState } from "react";
import type { FormEvent, CSSProperties } from "react";

const DEBT_KEY = "resgata-demo-dividas-v1";
const ACCOUNT_KEY = "resgata-demo-contas-v1";

type Debt = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  priority: string;
  paid: boolean;
};

type Account = {
  id: string;
  description: string;
  category: string;
  // Receita permanece apenas para compatibilidade com dados antigos.
  type: "Despesa" | "Receita";
  amount: number;
  dueDate: string;
  paid: boolean;
};

type Entry = {
  id: string;
  source: "debt" | "account";
  kind: "Dívida" | "Despesa";
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  priority: string;
  paid: boolean;
};

type EntryKind = Entry["kind"];

const debtCategories = [
  "Outra dívida",
  "Dívida pessoal / de boca",
  "Boleto",
  "Cartão",
  "Empréstimo",
  "Conta atrasada",
  "Financiamento",
  "Acordo / renegociação",
];

const accountCategories = [
  "Conta de consumo",
  "Cartão",
  "Assinatura",
  "Despesa",
  "Outro",
];

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 9,
  fontSize: 14,
  color: "#172033",
  background: "#fff",
};

function money(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function todayString() {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateLabel(value: string) {
  if (!value) return "Não informado";

  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

export default function PainelContas() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [ready, setReady] = useState(false);

  const [kind, setKind] = useState<EntryKind>("Despesa");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState(accountCategories[0]);
  const [priority, setPriority] = useState("Normal");
  const [editing, setEditing] = useState<string | null>(null);
  const [filter, setFilter] = useState("Todas");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const savedDebts = localStorage.getItem(DEBT_KEY);
      const savedAccounts = localStorage.getItem(ACCOUNT_KEY);

      if (savedDebts) {
        const parsed = JSON.parse(savedDebts);

        if (Array.isArray(parsed)) {
          setDebts(parsed);
        }
      }

      if (savedAccounts) {
        const parsed = JSON.parse(savedAccounts);

        if (Array.isArray(parsed)) {
          setAccounts(parsed);
        }
      }
    } catch {
      setMessage("Não foi possível carregar todos os registros salvos.");
    }

    setReady(true);
  }, []);

  function persist(
    nextDebts: Debt[],
    nextAccounts: Account[],
    successMessage: string
  ) {
    try {
      localStorage.setItem(DEBT_KEY, JSON.stringify(nextDebts));
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(nextAccounts));

      setDebts(nextDebts);
      setAccounts(nextAccounts);
      setMessage(successMessage);
    } catch {
      setMessage("Não foi possível salvar. Verifique o espaço disponível.");
    }
  }

  function resetForm() {
    setName("");
    setAmount("");
    setDueDate("");
    setEditing(null);
    setPriority("Normal");
    setCategory(
      kind === "Dívida" ? debtCategories[0] : accountCategories[0]
    );
  }

  const entries: Entry[] = [
    ...debts.map((item) => ({
      id: item.id,
      source: "debt" as const,
      kind: "Dívida" as const,
      name: item.name,
      amount: item.amount,
      dueDate: item.dueDate,
      category: item.category,
      priority: item.priority || "Normal",
      paid: item.paid,
    })),

    ...accounts
      .filter((item) => item.type !== "Receita")
      .map((item) => ({
        id: item.id,
        source: "account" as const,
        kind: "Despesa" as const,
        name: item.description,
        amount: item.amount,
        dueDate: item.dueDate,
        category: item.category,
        priority: "",
        paid: item.paid,
      })),
  ];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedAmount = amount.trim().replace(/\s/g, "").replace(",", ".");
    const value = Number(normalizedAmount);

    if (!name.trim() || !Number.isFinite(value) || value <= 0) {
      setMessage("Informe uma descrição e um valor válido.");
      return;
    }

    let nextDebts = [...debts];
    let nextAccounts = [...accounts];

    if (editing) {
      if (kind === "Dívida") {
        nextDebts = debts.map((item) =>
          item.id === editing
            ? {
                ...item,
                name: name.trim(),
                amount: value,
                dueDate,
                category,
                priority,
              }
            : item
        );
      } else {
        nextAccounts = accounts.map((item) =>
          item.id === editing
            ? {
                ...item,
                description: name.trim(),
                amount: value,
                dueDate,
                category,
                type: "Despesa",
              }
            : item
        );
      }
    } else {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      if (kind === "Dívida") {
        nextDebts.unshift({
          id,
          name: name.trim(),
          amount: value,
          dueDate,
          category,
          priority,
          paid: false,
        });
      } else {
        nextAccounts.unshift({
          id,
          description: name.trim(),
          amount: value,
          dueDate,
          category,
          type: "Despesa",
          paid: false,
        });
      }
    }

    const successMessage = editing
      ? "Registro atualizado com sucesso!"
      : "Registro cadastrado com sucesso!";

    persist(nextDebts, nextAccounts, successMessage);
    resetForm();
  }

  function editEntry(entry: Entry) {
    setKind(entry.kind);
    setName(entry.name);
    setAmount(String(entry.amount).replace(".", ","));
    setDueDate(entry.dueDate);
    setCategory(entry.category);
    setPriority(entry.priority || "Normal");
    setEditing(entry.id);
    setMessage("Edite os dados no formulário e salve as alterações.");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function togglePaid(entry: Entry) {
    const nextDebts = debts.map((item) =>
      entry.source === "debt" && item.id === entry.id
        ? { ...item, paid: !item.paid }
        : item
    );

    const nextAccounts = accounts.map((item) =>
      entry.source === "account" && item.id === entry.id
        ? { ...item, paid: !item.paid }
        : item
    );

    persist(
      nextDebts,
      nextAccounts,
      entry.paid
        ? "Registro reaberto."
        : "Registro marcado como pago."
    );
  }

  function removeEntry(entry: Entry) {
    const confirmed = window.confirm(
      `Deseja realmente excluir "${entry.name}"?`
    );

    if (!confirmed) return;

    const nextDebts =
      entry.source === "debt"
        ? debts.filter((item) => item.id !== entry.id)
        : debts;

    const nextAccounts =
      entry.source === "account"
        ? accounts.filter((item) => item.id !== entry.id)
        : accounts;

    persist(nextDebts, nextAccounts, "Registro excluído.");

    if (editing === entry.id) {
      resetForm();
    }
  }

  const today = todayString();

  const openEntries = entries.filter((item) => !item.paid);

  const overdueEntries = openEntries.filter(
    (item) => item.dueDate && item.dueDate < today
  );

  const upcomingEntries = openEntries.filter(
    (item) => !item.dueDate || item.dueDate >= today
  );

  const paidEntries = entries.filter((item) => item.paid);

  const totalOpen = openEntries.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalOverdue = overdueEntries.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalUpcoming = upcomingEntries.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalPaid = paidEntries.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const visible = entries
    .filter((item) => {
      if (filter === "Em aberto") {
        return (
          !item.paid &&
          (!item.dueDate || item.dueDate >= today)
        );
      }

      if (filter === "Vencidas") {
        return (
          !item.paid &&
          !!item.dueDate &&
          item.dueDate < today
        );
      }

      if (filter === "Pagas") {
        return item.paid;
      }

      return true;
    })
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      return a.dueDate.localeCompare(b.dueDate);
    });

  if (!ready) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
        Carregando seus registros...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto",
        padding: "20px 0",
        color: "#172033",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#64748b",
            letterSpacing: 1,
          }}
        >
          ORGANIZAÇÃO FINANCEIRA
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 800, margin: "8px 0" }}>
          Contas e Dívidas
        </h1>

        <p style={{ color: "#64748b", margin: 0 }}>
          Acompanhe seus compromissos, vencimentos e pagamentos em um só lugar.
        </p>
      </div>

      {message && (
        <div
          role="status"
          style={{
            padding: 12,
            marginBottom: 16,
            borderRadius: 10,
            background: "#eff6ff",
            color: "#1d4ed8",
            fontSize: 14,
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Em aberto", value: totalOpen, color: "#1d4ed8" },
          { label: "Vencidas", value: totalOverdue, color: "#dc2626" },
          {
            label: "Próximos vencimentos",
            value: totalUpcoming,
            color: "#d97706",
          },
          {
            label: "Contas pagas",
            value: totalPaid,
            color: "#059669",
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              padding: 18,
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              background: "#fff",
            }}
          >
            <div style={{ color: "#64748b", fontSize: 13 }}>
              {card.label}
            </div>

            <div
              style={{
                color: card.color,
                fontSize: 23,
                fontWeight: 800,
                marginTop: 8,
              }}
            >
              {money(card.value)}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={submit}
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 750, margin: "0 0 16px" }}>
          {editing ? "Editar registro" : "Adicionar conta ou dívida"}
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
          }}
        >
          <label
            style={{
              display: "grid",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Tipo de registro

            <select
              value={kind}
              disabled={!!editing}
              onChange={(e) => {
                const nextKind = e.target.value as EntryKind;

                setKind(nextKind);
                setCategory(
                  nextKind === "Dívida"
                    ? debtCategories[0]
                    : accountCategories[0]
                );
              }}
              style={{
                ...fieldStyle,
                opacity: editing ? 0.65 : 1,
              }}
            >
              <option value="Despesa">Conta / despesa</option>
              <option value="Dívida">Dívida</option>
            </select>
          </label>

          <label
            style={{
              display: "grid",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Descrição

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Conta de luz"
              style={fieldStyle}
            />
          </label>

          <label
            style={{
              display: "grid",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Valor (R$)

            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              inputMode="decimal"
              style={fieldStyle}
            />
          </label>

          <label
            style={{
              display: "grid",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Data de vencimento

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={fieldStyle}
            />
          </label>

          <label
            style={{
              display: "grid",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Categoria

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={fieldStyle}
            >
              {(kind === "Dívida" ? debtCategories : accountCategories).map(
                (item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                )
              )}
            </select>
          </label>

          {kind === "Dívida" && (
            <label
              style={{
                display: "grid",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Prioridade

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={fieldStyle}
              >
                <option value="Baixa">Baixa</option>
                <option value="Normal">Normal</option>
                <option value="Alta">Alta</option>
              </select>
            </label>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 18,
            flexWrap: "wrap",
          }}
        >
          <button
            type="submit"
            style={{
              border: 0,
              borderRadius: 10,
              padding: "12px 22px",
              background: "#1d4ed8",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {editing ? "Salvar alterações" : "Adicionar registro"}
          </button>

          {editing && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 10,
                padding: "12px 22px",
                background: "#fff",
                color: "#334155",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      <section
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 750, margin: 0 }}>
              Seus registros
            </h2>

            <p
              style={{
                color: "#64748b",
                fontSize: 13,
                margin: "5px 0 0",
              }}
            >
              {entries.length} registro(s) cadastrado(s)
            </p>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              ...fieldStyle,
              width: "auto",
              minWidth: 160,
            }}
          >
            <option value="Todas">Todas</option>
            <option value="Em aberto">Em aberto</option>
            <option value="Vencidas">Vencidas</option>
            <option value="Pagas">Pagas</option>
          </select>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {visible.map((item) => {
            const isOverdue =
              !item.paid &&
              !!item.dueDate &&
              item.dueDate < today;

            return (
              <article
                key={`${item.source}-${item.id}`}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 180, flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <strong style={{ fontSize: 15 }}>
                      {item.name}
                    </strong>

                    <span
                      style={{
                        fontSize: 11,
                        padding: "4px 8px",
                        borderRadius: 20,
                        background: item.paid
                          ? "#dcfce7"
                          : isOverdue
                            ? "#fee2e2"
                            : "#eff6ff",
                        color: item.paid
                          ? "#166534"
                          : isOverdue
                            ? "#b91c1c"
                            : "#1d4ed8",
                        fontWeight: 700,
                      }}
                    >
                      {item.paid
                        ? "Pago"
                        : isOverdue
                          ? "Vencido"
                          : "Em aberto"}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: "7px 0 0",
                      color: "#64748b",
                      fontSize: 13,
                    }}
                  >
                    {item.kind} · {item.category}
                    {item.kind === "Dívida"
                      ? ` · Prioridade ${item.priority}`
                      : ""}
                  </p>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b",
                      fontSize: 12,
                    }}
                  >
                    Vencimento: {dateLabel(item.dueDate)}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <strong style={{ fontSize: 18, color: "#172033" }}>
                    {money(item.amount)}
                  </strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => editEntry(item)}
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: 8,
                      padding: "8px 12px",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => togglePaid(item)}
                    style={{
                      border: 0,
                      borderRadius: 8,
                      padding: "8px 12px",
                      background: item.paid ? "#f1f5f9" : "#dcfce7",
                      color: item.paid ? "#334155" : "#166534",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {item.paid ? "Reabrir" : "Marcar como pago"}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeEntry(item)}
                    style={{
                      border: "1px solid #fecaca",
                      borderRadius: 8,
                      padding: "8px 12px",
                      background: "#fff",
                      color: "#b91c1c",
                      cursor: "pointer",
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {visible.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "32px 16px",
              color: "#64748b",
            }}
          >
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#334155",
                margin: 0,
              }}
            >
              Nenhum registro encontrado
            </p>

            <p style={{ fontSize: 13, margin: "8px 0 0" }}>
              Adicione uma conta ou dívida no formulário acima.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}