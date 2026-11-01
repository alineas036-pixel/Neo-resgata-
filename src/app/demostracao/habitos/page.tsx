"use client";

import DemoMenu from "@/components/DemoMenu";
import { useMemo, useState } from "react";

type Habit = {
  id: string;
  name: string;
  category: string;
  goal: number;
  active: boolean;
};

type Entry = {
  id: string;
  habitId: string;
  date: string;
  status: "occurred" | "not_occurred" | "prefer_not_to_say";
  amount: number;
  avoided: number;
  notes: string;
};

type Expense = {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  notes: string;
};

type DemoData = {
  habits: Habit[];
  entries: Entry[];
  expenses: Expense[];
};

type HistoryItem = {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  notes: string;
  origin: string;
};

const categories = [
  "Alimentação",
  "Transporte",
  "Casa",
  "Saúde",
  "Lazer",
  "Compras",
  "Educação",
  "Hábitos",
  "Outros",
];

function todayString() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function money(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dateLabel(value: string) {
  if (!value) return "Não informada";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function parseAmount(value: string) {
  const normalized = value.trim().replace(/\s/g, "").replace(/^R\$/i, "");

  if (!normalized) return NaN;

  const parsedValue = normalized.includes(",")
    ? normalized.replace(/\./g, "").replace(",", ".")
    : normalized;

  return Number(parsedValue);
}

function daysAgo(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

const initialData: DemoData = {
  habits: [
    {
      id: "h1",
      name: "Café fora de casa",
      category: "Alimentação",
      goal: 120,
      active: true,
    },
    {
      id: "h2",
      name: "Compras por impulso",
      category: "Compras",
      goal: 100,
      active: true,
    },
    {
      id: "h3",
      name: "Delivery",
      category: "Alimentação",
      goal: 180,
      active: true,
    },
  ],
  entries: [
    {
      id: "e1",
      habitId: "h1",
      date: todayString(),
      status: "occurred",
      amount: 12,
      avoided: 0,
      notes: "Café da manhã",
    },
    {
      id: "e2",
      habitId: "h2",
      date: todayString(),
      status: "not_occurred",
      amount: 0,
      avoided: 35,
      notes: "Evitei uma compra",
    },
    {
      id: "e3",
      habitId: "h3",
      date: todayString(),
      status: "occurred",
      amount: 42,
      avoided: 0,
      notes: "",
    },
    {
      id: "e4",
      habitId: "h1",
      date: daysAgo(2),
      status: "occurred",
      amount: 15,
      avoided: 0,
      notes: "",
    },
  ],
  expenses: [
    {
      id: "x1",
      name: "Mercado",
      category: "Alimentação",
      date: todayString(),
      amount: 145,
      notes: "Exemplo",
    },
    {
      id: "x2",
      name: "Transporte",
      category: "Transporte",
      date: daysAgo(1),
      amount: 25,
      notes: "Exemplo",
    },
  ],
};

const suggestions = [
  ["☕", "Café e lanches", "Alimentação"],
  ["🛵", "Delivery", "Alimentação"],
  ["🛍️", "Compras por impulso", "Compras"],
  ["🎮", "Jogos e serviços digitais", "Lazer"],
  ["🚗", "Transporte por aplicativo", "Transporte"],
  ["🎬", "Passeios e lazer", "Lazer"],
];

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "12px 13px",
  border: "1px solid #d7e0e9",
  borderRadius: 10,
  fontSize: 14,
  color: "#172033",
  background: "#fff",
  outlineColor: "#0f766e",
};

const labelStyle = {
  display: "grid",
  gap: 7,
  fontSize: 13,
  fontWeight: 650 as const,
  color: "#475569",
};

const primaryButton = {
  border: 0,
  borderRadius: 10,
  padding: "12px 18px",
  background: "#0f766e",
  color: "#fff",
  fontWeight: 700 as const,
  cursor: "pointer",
};

const secondaryButton = {
  border: "1px solid #d7e0e9",
  borderRadius: 10,
  padding: "10px 13px",
  background: "#fff",
  color: "#334155",
  fontWeight: 650 as const,
  cursor: "pointer",
};

export default function DemoHabitosPage() {
  // Os dados existem somente enquanto esta página estiver aberta.
  // Não usamos localStorage, sessionStorage nem Supabase.
  const [data, setData] = useState<DemoData>(() => ({
    habits: initialData.habits.map((item) => ({ ...item })),
    entries: initialData.entries.map((item) => ({ ...item })),
    expenses: initialData.expenses.map((item) => ({ ...item })),
  }));

  const [tab, setTab] = useState("overview");
  const [period, setPeriod] = useState("30");
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Alimentação");
  const [goal, setGoal] = useState("");
  const [editingHabit, setEditingHabit] = useState<string | null>(null);

  const [habitId, setHabitId] = useState("h1");
  const [status, setStatus] = useState<Entry["status"]>("occurred");
  const [amount, setAmount] = useState("");
  const [avoided, setAvoided] = useState("");
  const [entryDate, setEntryDate] = useState(todayString());
  const [notes, setNotes] = useState("");

  const [expenseName, setExpenseName] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Alimentação");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(todayString());
  const [expenseNotes, setExpenseNotes] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todas");

  const today = todayString();

  const cutoff = useMemo(() => {
    return daysAgo(Number(period));
  }, [period]);

  const entries = useMemo(
    () =>
      data.entries.filter(
        (entry) => entry.date >= cutoff && entry.date <= today
      ),
    [data.entries, cutoff, today]
  );

  const expenses = useMemo(
    () =>
      data.expenses.filter(
        (expense) => expense.date >= cutoff && expense.date <= today
      ),
    [data.expenses, cutoff, today]
  );

  const habitSpending = entries.reduce(
    (sum, entry) => sum + entry.amount,
    0
  );

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const savings = entries.reduce(
    (sum, entry) => sum + entry.avoided,
    0
  );

  const total = habitSpending + totalExpenses;

  const activeHabits = data.habits.filter((habit) => habit.active);

  const completedToday = data.entries.filter(
    (entry) => entry.date === today && entry.status === "occurred"
  ).length;

  const history: HistoryItem[] = useMemo(() => {
    const expenseItems: HistoryItem[] = data.expenses.map((expense) => ({
      id: expense.id,
      name: expense.name,
      category: expense.category,
      date: expense.date,
      amount: expense.amount,
      notes: expense.notes,
      origin: "Despesa",
    }));

    const habitItems: HistoryItem[] = data.entries
      .filter((entry) => entry.amount > 0)
      .map((entry) => {
        const habit = data.habits.find(
          (item) => item.id === entry.habitId
        );

        return {
          id: entry.id,
          name: habit?.name ?? "Hábito",
          category: habit?.category ?? "Hábitos",
          date: entry.date,
          amount: entry.amount,
          notes: entry.notes,
          origin: "Hábito",
        };
      });

    return [...expenseItems, ...habitItems]
      .filter(
        (item) =>
          item.date >= cutoff &&
          item.date <= today &&
          item.name.toLowerCase().includes(search.toLowerCase()) &&
          (filter === "Todas" || item.category === filter)
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data, cutoff, today, search, filter]);

  const categoryTotals = useMemo(
    () =>
      categories.map((item) => {
        const expenseValue = expenses
          .filter((expense) => expense.category === item)
          .reduce((sum, expense) => sum + expense.amount, 0);

        const habitValue = entries
          .filter(
            (entry) =>
              data.habits.find((habit) => habit.id === entry.habitId)
                ?.category === item
          )
          .reduce((sum, entry) => sum + entry.amount, 0);

        return {
          category: item,
          value: expenseValue + habitValue,
        };
      }),
    [data.habits, entries, expenses]
  );

  const maxCategoryValue = Math.max(
    1,
    ...categoryTotals.map((item) => item.value)
  );

  const averageExpense = history.length ? total / history.length : 0;

  const tabs = [
    ["overview", "Visão geral"],
    ["habits", "Hábitos"],
    ["expenses", "Despesas"],
    ["charts", "Gráficos"],
    ["reports", "Relatórios"],
  ];

  const panelStyle = {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    boxShadow: "0 4px 14px rgba(15,23,42,0.035)",
  };

  function notify(text: string) {
    setMessage(text);
  }

  function resetHabitForm() {
    setName("");
    setCategory("Alimentação");
    setGoal("");
    setEditingHabit(null);
  }

  function saveHabit() {
    if (!name.trim()) {
      notify("Informe o nome do hábito.");
      return;
    }

    const goalValue = goal.trim() ? parseAmount(goal) : 0;

    if (!Number.isFinite(goalValue) || goalValue < 0) {
      notify("Informe uma meta mensal válida.");
      return;
    }

    if (editingHabit) {
      setData((current) => ({
        ...current,
        habits: current.habits.map((habit) =>
          habit.id === editingHabit
            ? {
                ...habit,
                name: name.trim(),
                category,
                goal: goalValue,
              }
            : habit
        ),
      }));

      notify("Hábito atualizado com sucesso!");
    } else {
      const habit: Habit = {
        id: uid(),
        name: name.trim(),
        category,
        goal: goalValue,
        active: true,
      };

      setData((current) => ({
        ...current,
        habits: [...current.habits, habit],
      }));

      notify("Hábito cadastrado com sucesso!");
    }

    resetHabitForm();
  }

  function editHabit(habit: Habit) {
    setName(habit.name);
    setCategory(habit.category);
    setGoal(String(habit.goal));
    setEditingHabit(habit.id);
    setTab("habits");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleHabit(habit: Habit) {
    setData((current) => ({
      ...current,
      habits: current.habits.map((item) =>
        item.id === habit.id
          ? { ...item, active: !item.active }
          : item
      ),
    }));

    notify(habit.active ? "Hábito pausado." : "Hábito reativado.");
  }

  function removeHabit(habit: Habit) {
    if (
      !window.confirm(
        `Deseja excluir "${habit.name}" e seu histórico de demonstração?`
      )
    ) {
      return;
    }

    setData((current) => ({
      ...current,
      habits: current.habits.filter((item) => item.id !== habit.id),
      entries: current.entries.filter(
        (entry) => entry.habitId !== habit.id
      ),
    }));

    notify("Hábito e histórico relacionado excluídos.");

    if (editingHabit === habit.id) {
      resetHabitForm();
    }
  }

  function addEntry() {
    if (
      !habitId ||
      !data.habits.some(
        (habit) => habit.id === habitId && habit.active
      )
    ) {
      notify("Selecione um hábito ativo.");
      return;
    }

    if (!entryDate) {
      notify("Informe a data do acompanhamento.");
      return;
    }

    const amountValue =
      status === "occurred" ? parseAmount(amount || "0") : 0;

    const avoidedValue =
      status === "not_occurred" ? parseAmount(avoided || "0") : 0;

    if (
      !Number.isFinite(amountValue) ||
      !Number.isFinite(avoidedValue) ||
      amountValue < 0 ||
      avoidedValue < 0
    ) {
      notify("Informe valores válidos, iguais ou maiores que zero.");
      return;
    }

    const entry: Entry = {
      id: uid(),
      habitId,
      date: entryDate,
      status,
      amount: amountValue,
      avoided: avoidedValue,
      notes: notes.trim(),
    };

    setData((current) => ({
      ...current,
      entries: [...current.entries, entry],
    }));

    setAmount("");
    setAvoided("");
    setNotes("");

    notify("Acompanhamento registrado com sucesso!");
  }

  function addExpense() {
    const value = parseAmount(expenseAmount);

    if (
      !expenseName.trim() ||
      !Number.isFinite(value) ||
      value <= 0 ||
      !expenseDate
    ) {
      notify("Informe descrição, data e um valor maior que zero.");
      return;
    }

    const expense: Expense = {
      id: uid(),
      name: expenseName.trim(),
      category: expenseCategory,
      date: expenseDate,
      amount: value,
      notes: expenseNotes.trim(),
    };

    setData((current) => ({
      ...current,
      expenses: [...current.expenses, expense],
    }));

    setExpenseName("");
    setExpenseAmount("");
    setExpenseNotes("");

    notify("Despesa cadastrada com sucesso!");
  }

  function removeExpense(expense: Expense) {
    if (
      !window.confirm(
        `Deseja excluir a despesa "${expense.name}"?`
      )
    ) {
      return;
    }

    setData((current) => ({
      ...current,
      expenses: current.expenses.filter(
        (item) => item.id !== expense.id
      ),
    }));

    notify("Despesa excluída.");
  }

  function removeEntry(entry: Entry) {
    if (!window.confirm("Deseja excluir este acompanhamento?")) {
      return;
    }

    setData((current) => ({
      ...current,
      entries: current.entries.filter(
        (item) => item.id !== entry.id
      ),
    }));

    notify("Acompanhamento excluído.");
  }

  function exportCsv() {
    const rows = [
      ["Data", "Descrição", "Categoria", "Valor", "Origem"],
      ...history.map((item) => [
        dateLabel(item.date),
        item.name,
        item.category,
        String(item.amount).replace(".", ","),
        item.origin,
      ]),
    ];

    const csv =
      "\uFEFF" +
      rows
        .map((row) =>
          row
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(";")
        )
        .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    );

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "relatorio-habitos-demo.csv";
    anchor.click();

    URL.revokeObjectURL(url);
    notify("Relatório CSV preparado para exportação.");
  }

  function restoreExamples() {
    if (
      !window.confirm(
        "Restaurar os exemplos iniciais? Seus registros desta demonstração serão apagados."
      )
    ) {
      return;
    }

    setData({
      habits: initialData.habits.map((item) => ({ ...item })),
      entries: initialData.entries.map((item) => ({ ...item })),
      expenses: initialData.expenses.map((item) => ({ ...item })),
    });

    resetHabitForm();
    notify("Exemplos iniciais restaurados.");
  }

  // A partir daqui entra a interface visual da parte 2.

  return (
    <>
      <DemoMenu />

      <main className="habit-demo">
        <div className="habit-container">
          <header className="habit-hero">
            <div className="habit-hero-content">
              <span className="habit-eyebrow">
                RESGATA+ · ORGANIZAÇÃO FINANCEIRA
              </span>

              <h1>Controle & Hábitos</h1>

              <p>
                Pequenas escolhas podem transformar sua vida financeira.
                Descubra seus hábitos, acompanhe seus gastos e avance no
                seu próprio ritmo.
              </p>

              <div className="habit-hero-tags">
                <span>✓ Acompanhe seus hábitos</span>
                <span>✓ Entenda seus gastos</span>
                <span>✓ Crie metas possíveis</span>
              </div>
            </div>

            <div className="habit-hero-illustration">
              <span>🌱</span>
              <strong>Seu progresso começa com pequenos passos.</strong>
              <small>Um dia de cada vez.</small>
            </div>
          </header>

          <div className="demo-notice">
            <span>✨</span>
            <div>
              <strong>Você está experimentando o Resgata+.</strong>
              <p>
                Esta demonstração usa dados fictícios e temporários.
                Ao atualizar ou sair da página, seus registros de teste
                serão reiniciados. Para manter seu histórico, conheça
                a versão completa.
              </p>
            </div>
          </div>

          <section className="habit-period">
            <div>
              <strong>Seu período de análise</strong>
              <small>Escolha o intervalo para visualizar seus indicadores.</small>
            </div>

            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Últimos 12 meses</option>
            </select>
          </section>

          <nav className="habit-tabs" aria-label="Seções do Controle e Hábitos">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={tab === key ? "active" : ""}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </nav>

          {message && (
            <div className="habit-message" role="status">
              <span>{message}</span>
              <button
                type="button"
                onClick={() => setMessage("")}
                aria-label="Fechar mensagem"
              >
                ×
              </button>
            </div>
          )}

          {tab === "overview" && (
            <>
              <section className="habit-welcome">
                <div>
                  <span className="section-eyebrow">SUA JORNADA</span>
                  <h2>Vamos cuidar melhor do seu dinheiro?</h2>
                  <p>
                    Visualize o que está acontecendo e descubra onde
                    pequenas mudanças podem fazer diferença.
                  </p>
                </div>
                <span className="welcome-icon">🌿</span>
              </section>

              <div className="habit-metrics">
                <article className="metric-card">
                  <span className="metric-icon blue">💳</span>
                  <span className="metric-label">Gastos registrados</span>
                  <strong>{money(total)}</strong>
                  <small>No período selecionado</small>
                </article>

                <article className="metric-card">
                  <span className="metric-icon green">🌱</span>
                  <span className="metric-label">Economia estimada</span>
                  <strong>{money(savings)}</strong>
                  <small>Valores que você informou ter evitado</small>
                </article>

                <article className="metric-card">
                  <span className="metric-icon orange">🎯</span>
                  <span className="metric-label">Hábitos ativos</span>
                  <strong>{activeHabits.length}</strong>
                  <small>Em acompanhamento</small>
                </article>

                <article className="metric-card">
                  <span className="metric-icon purple">📅</span>
                  <span className="metric-label">Realizados hoje</span>
                  <strong>{completedToday}</strong>
                  <small>Hábitos marcados como realizados</small>
                </article>
              </div>

              <section className="habit-panel">
                <div className="section-heading">
                  <div>
                    <span className="section-eyebrow">VISÃO FINANCEIRA</span>
                    <h2>Resumo do acompanhamento</h2>
                    <p>Veja como seus registros estão distribuídos.</p>
                  </div>
                </div>

                <div className="summary-grid">
                  <div className="summary-item">
                    <span>Gastos nos hábitos</span>
                    <strong>{money(habitSpending)}</strong>
                  </div>

                  <div className="summary-item">
                    <span>Despesas gerais</span>
                    <strong>{money(totalExpenses)}</strong>
                  </div>

                  <div className="summary-item savings-item">
                    <span>Economia estimada</span>
                    <strong>{money(savings)}</strong>
                  </div>
                </div>

                <p className="habit-disclaimer">
                  A economia estimada é informativa. Ela não representa
                  dinheiro efetivamente recebido nem altera o saldo de
                  qualquer conta.
                </p>
              </section>

              <section className="habit-panel">
                <div className="section-heading">
                  <div>
                    <span className="section-eyebrow">ACOMPANHAMENTO</span>
                    <h2>Seus hábitos e metas</h2>
                    <p>
                      Acompanhe seus gastos em relação às metas mensais.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="habit-primary-button"
                    onClick={() => setTab("habits")}
                  >
                    + Novo hábito
                  </button>
                </div>

                {activeHabits.length === 0 ? (
                  <div className="habit-empty">
                    <span>🌱</span>
                    <strong>Nenhum hábito ativo por enquanto.</strong>
                    <p>Cadastre um hábito para começar seu acompanhamento.</p>
                  </div>
                ) : (
                  <div className="habit-progress-list">
                    {activeHabits.slice(0, 6).map((habit) => {
                      const spent = entries
                        .filter((entry) => entry.habitId === habit.id)
                        .reduce((sum, entry) => sum + entry.amount, 0);

                      const percentage =
                        habit.goal > 0
                          ? Math.min(100, (spent / habit.goal) * 100)
                          : 0;

                      const remaining = Math.max(0, habit.goal - spent);

                      return (
                        <article className="habit-progress-card" key={habit.id}>
                          <div className="progress-card-top">
                            <div>
                              <strong>{habit.name}</strong>
                              <small>{habit.category}</small>
                            </div>

                            <span
                              className={
                                percentage >= 100
                                  ? "progress-status exceeded"
                                  : percentage >= 80
                                    ? "progress-status attention"
                                    : "progress-status normal"
                              }
                            >
                              {habit.goal <= 0
                                ? "Sem meta"
                                : percentage >= 100
                                  ? "Meta atingida"
                                  : percentage >= 80
                                    ? "Atenção à meta"
                                    : "Em acompanhamento"}
                            </span>
                          </div>

                          {habit.goal > 0 ? (
                            <>
                              <div className="progress-values">
                                <span>Gasto: {money(spent)}</span>
                                <span>Meta: {money(habit.goal)}</span>
                              </div>

                              <div
                                className="progress-track"
                                role="progressbar"
                                aria-valuenow={Math.round(percentage)}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`Progresso da meta de ${habit.name}`}
                              >
                                <div
                                  className={
                                    percentage >= 100
                                      ? "progress-fill exceeded-fill"
                                      : percentage >= 80
                                        ? "progress-fill attention-fill"
                                        : "progress-fill"
                                  }
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>

                              <small className="progress-footnote">
                                {percentage >= 100
                                  ? "Você alcançou ou ultrapassou sua meta."
                                  : `Restam ${money(remaining)} até sua meta.`}
                              </small>
                            </>
                          ) : (
                            <small className="progress-footnote">
                              Cadastre uma meta mensal para acompanhar seus limites.
                            </small>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="habit-cta">
                <div>
                  <span>🚀</span>
                  <div>
                    <strong>Quer acompanhar sua evolução de verdade?</strong>
                    <p>
                      Na versão completa do Resgata+, você poderá manter
                      seus registros e acompanhar seu histórico.
                    </p>
                  </div>
                </div>

                <a href="/register">Conhecer o Resgata+</a>
              </section>
            </>
          )}

          {tab === "habits" && (
            <>
              <section className="habit-panel">
                <div className="section-heading">
                  <div>
                    <span className="section-eyebrow">PERSONALIZE</span>
                    <h2>
                      {editingHabit ? "Editar hábito" : "Cadastre seus hábitos"}
                    </h2>
                    <p>
                      Escolha uma sugestão ou crie um hábito que faça
                      sentido para sua rotina.
                    </p>
                  </div>
                </div>

                <div className="suggestion-grid">
                  {suggestions.map(([emoji, label, cat]) => (
                    <button
                      key={label}
                      type="button"
                      className="suggestion-button"
                      onClick={() => {
                        setName(label);
                        setCategory(cat);
                      }}
                    >
                      <span>{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>

                <div className="habit-form-grid">
                  <label>
                    Nome do hábito
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Ex.: Compras por impulso"
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    Categoria
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      style={inputStyle}
                    >
                      {categories.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Meta mensal de gastos (R$)
                    <input
                      type="text"
                      inputMode="decimal"
                      value={goal}
                      onChange={(event) => setGoal(event.target.value)}
                      placeholder="Ex.: 150,00"
                      style={inputStyle}
                    />
                  </label>
                </div>

                <div className="habit-actions">
                  <button
                    type="button"
                    onClick={saveHabit}
                    className="habit-primary-button"
                  >
                    {editingHabit ? "Salvar alterações" : "Cadastrar hábito"}
                  </button>

                  {editingHabit && (
                    <button
                      type="button"
                      onClick={resetHabitForm}
                      className="habit-secondary-button"
                    >
                      Cancelar edição
                    </button>
                  )}
                </div>
              </section>

              <section className="habit-panel">
                <div className="section-heading">
                  <div>
                    <span className="section-eyebrow">REGISTRE SEU DIA</span>
                    <h2>Como foi seu acompanhamento?</h2>
                    <p>
                      Registre o que aconteceu sem julgamentos.
                      O objetivo é conhecer seus hábitos.
                    </p>
                  </div>
                </div>

                <div className="habit-form-grid">
                  <label>
                    Hábito
                    <select
                      value={habitId}
                      onChange={(event) => setHabitId(event.target.value)}
                      style={inputStyle}
                    >
                      {activeHabits.map((habit) => (
                        <option key={habit.id} value={habit.id}>
                          {habit.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Data
                    <input
                      type="date"
                      value={entryDate}
                      onChange={(event) => setEntryDate(event.target.value)}
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    O que aconteceu?
                    <select
                      value={status}
                      onChange={(event) =>
                        setStatus(event.target.value as Entry["status"])
                      }
                      style={inputStyle}
                    >
                      <option value="occurred">Aconteceu</option>
                      <option value="not_occurred">Não aconteceu</option>
                      <option value="prefer_not_to_say">
                        Prefiro não informar
                      </option>
                    </select>
                  </label>

                  {status === "occurred" && (
                    <label>
                      Quanto gastou? (R$)
                      <input
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        placeholder="Ex.: 25,00"
                        style={inputStyle}
                      />
                    </label>
                  )}

                  {status === "not_occurred" && (
                    <label>
                      Economia estimada (R$)
                      <input
                        type="text"
                        inputMode="decimal"
                        value={avoided}
                        onChange={(event) => setAvoided(event.target.value)}
                        placeholder="Ex.: 35,00"
                        style={inputStyle}
                      />
                    </label>
                  )}

                  <label className="full-field">
                    Observações
                    <input
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Opcional: conte um pouco sobre seu dia."
                      style={inputStyle}
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={addEntry}
                  disabled={activeHabits.length === 0}
                  className="habit-primary-button"
                  style={{ marginTop: 18 }}
                >
                  Registrar acompanhamento
                </button>

                <p className="habit-disclaimer">
                  Seus registros nesta demonstração não alteram sua Carteira
                  nem seu saldo real.
                </p>
              </section>

              <section className="habit-panel">
                <div className="section-heading">
                  <div>
                    <span className="section-eyebrow">SEUS CADASTROS</span>
                    <h2>Meus hábitos</h2>
                  </div>
                </div>

                {data.habits.length === 0 ? (
                  <div className="habit-empty">
                    <span>🌱</span>
                    <strong>Você ainda não cadastrou hábitos.</strong>
                    <p>Comece criando seu primeiro acompanhamento.</p>
                  </div>
                ) : (
                  <div className="habit-list">
                    {data.habits.map((habit) => {
                      const spent = data.entries
                        .filter((entry) => entry.habitId === habit.id)
                        .reduce((sum, entry) => sum + entry.amount, 0);

                      const percentage =
                        habit.goal > 0
                          ? Math.min(100, (spent / habit.goal) * 100)
                          : 0;

                      return (
                        <article className="habit-list-card" key={habit.id}>
                          <div className="habit-list-info">
                            <div className="habit-list-title">
                              <strong>{habit.name}</strong>
                              <span
                                className={
                                  habit.active
                                    ? "habit-pill active-pill"
                                    : "habit-pill paused-pill"
                                }
                              >
                                {habit.active ? "ATIVO" : "PAUSADO"}
                              </span>
                            </div>

                            <small>
                              {habit.category}
                              {habit.goal > 0
                                ? ` · Meta: ${money(habit.goal)}`
                                : " · Sem meta mensal"}
                            </small>

                            {habit.goal > 0 && (
                              <>
                                <div className="progress-values">
                                  <span>Gasto registrado: {money(spent)}</span>
                                  <span>{Math.round(percentage)}%</span>
                                </div>

                                <div className="progress-track">
                                  <div
                                    className="progress-fill"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </>
                            )}
                          </div>

                          <div className="habit-actions">
                            <button
                              type="button"
                              className="habit-secondary-button"
                              onClick={() => editHabit(habit)}
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className="habit-secondary-button"
                              onClick={() => toggleHabit(habit)}
                            >
                              {habit.active ? "Pausar" : "Reativar"}
                            </button>

                            <button
                              type="button"
                              className="habit-danger-button"
                              onClick={() => removeHabit(habit)}
                            >
                              Excluir
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="habit-panel">
                <div className="section-heading">
                  <div>
                    <span className="section-eyebrow">SEU HISTÓRICO</span>
                    <h2>Últimos acompanhamentos</h2>
                  </div>
                </div>

                <div className="habit-history">
                  {data.entries
                    .slice()
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 15)
                    .map((entry) => {
                      const habit = data.habits.find(
                        (item) => item.id === entry.habitId
                      );

                      const statusLabel =
                        entry.status === "occurred"
                          ? "Aconteceu"
                          : entry.status === "not_occurred"
                            ? "Não aconteceu"
                            : "Prefiro não informar";

                      return (
                        <article className="history-card" key={entry.id}>
                          <div>
                            <strong>{habit?.name ?? "Hábito removido"}</strong>
                            <small>
                              {dateLabel(entry.date)} · {statusLabel}
                            </small>

                            {entry.notes && <p>{entry.notes}</p>}
                          </div>

                          <div className="history-actions">
                            {entry.amount > 0 && (
                              <strong>{money(entry.amount)}</strong>
                            )}

                            {entry.avoided > 0 && (
                              <strong className="green-text">
                                Economizou {money(entry.avoided)}
                              </strong>
                            )}

                            <button
                              type="button"
                              className="habit-danger-button"
                              onClick={() => removeEntry(entry)}
                            >
                              Excluir
                            </button>
                          </div>
                        </article>
                      );
                    })}

                  {data.entries.length === 0 && (
                    <p className="habit-muted">
                      Nenhum acompanhamento registrado.
                    </p>
                  )}
                </div>
              </section>
            </>
          )}

          {tab === "expenses" && (
            <>
              <section className="habit-panel">
                <div className="section-heading">
                  <div>
                    <span className="section-eyebrow">ORGANIZE SEUS GASTOS</span>
                    <h2>Registrar uma despesa</h2>
                    <p>
                      Anote gastos do dia a dia para entender melhor
                      para onde seu dinheiro está indo.
                    </p>
                  </div>
                  <span className="welcome-icon">🧾</span>
                </div>

                <div className="habit-form-grid">
                  <label>
                    Descrição
                    <input
                      value={expenseName}
                      onChange={(event) => setExpenseName(event.target.value)}
                      placeholder="Ex.: Conta de internet"
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    Categoria
                    <select
                      value={expenseCategory}
                      onChange={(event) =>
                        setExpenseCategory(event.target.value)
                      }
                      style={inputStyle}
                    >
                      {categories.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Valor (R$)
                    <input
                      type="text"
                      inputMode="decimal"
                      value={expenseAmount}
                      onChange={(event) =>
                        setExpenseAmount(event.target.value)
                      }
                      placeholder="Ex.: 89,90"
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    Data
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={(event) => setExpenseDate(event.target.value)}
                      style={inputStyle}
                    />
                  </label>

                  <label className="full-field">
                    Observações
                    <input
                      value={expenseNotes}
                      onChange={(event) => setExpenseNotes(event.target.value)}
                      placeholder="Opcional"
                      style={inputStyle}
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={addExpense}
                  className="habit-primary-button"
                  style={{ marginTop: 18 }}
                >
                  + Adicionar despesa
                </button>
              </section>

              <section className="habit-panel">
                <div className="section-heading">
                  <div>
                    <span className="section-eyebrow">LANÇAMENTOS</span>
                    <h2>Despesas cadastradas</h2>
                  </div>
                  <strong>{data.expenses.length} registro(s)</strong>
                </div>

                {data.expenses.length === 0 ? (
                  <div className="habit-empty">
                    <span>🧾</span>
                    <strong>Nenhuma despesa cadastrada.</strong>
                    <p>Seus lançamentos aparecerão aqui.</p>
                  </div>
                ) : (
                  <div className="habit-list">
                    {data.expenses
                      .slice()
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((expense) => (
                        <article className="expense-card" key={expense.id}>
                          <div className="expense-icon">💸</div>

                          <div className="expense-info">
                            <strong>{expense.name}</strong>
                            <small>
                              {expense.category} · {dateLabel(expense.date)}
                            </small>
                            {expense.notes && <p>{expense.notes}</p>}
                          </div>

                          <strong className="expense-value">
                            {money(expense.amount)}
                          </strong>

                          <button
                            type="button"
                            className="habit-danger-button"
                            onClick={() => removeExpense(expense)}
                          >
                            Excluir
                          </button>
                        </article>
                      ))}
                  </div>
                )}
              </section>
            </>
          )}

          {tab === "charts" && (
            <section className="habit-panel">
              <div className="section-heading">
                <div>
                  <span className="section-eyebrow">ANÁLISE VISUAL</span>
                  <h2>Gastos por categoria</h2>
                  <p>
                    Entenda quais categorias concentram seus gastos no período.
                  </p>
                </div>
                <span className="welcome-icon">📊</span>
              </div>

              {categoryTotals.some((item) => item.value > 0) ? (
                <div className="category-chart">
                  {categoryTotals
                    .filter((item) => item.value > 0)
                    .sort((a, b) => b.value - a.value)
                    .map((item) => (
                      <div className="category-row" key={item.category}>
                        <div className="category-label">
                          <strong>{item.category}</strong>
                          <span>{money(item.value)}</span>
                        </div>

                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${(item.value / maxCategoryValue) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="habit-empty">
                  <span>📊</span>
                  <strong>Seus gráficos aparecerão aqui.</strong>
                  <p>Registre hábitos e despesas para visualizar os resultados.</p>
                </div>
              )}

              <div className="chart-total">
                <span>Total de gastos no período</span>
                <strong>{money(total)}</strong>
              </div>

              <p className="habit-disclaimer">
                Os gráficos consideram os gastos registrados em despesas
                e acompanhamentos de hábitos. A economia estimada não
                é somada aos gastos.
              </p>
            </section>
          )}

          {tab === "reports" && (
            <>
              <div className="habit-metrics report-metrics">
                <article className="metric-card">
                  <span className="metric-label">Total registrado</span>
                  <strong>{money(total)}</strong>
                  <small>Gastos no período</small>
                </article>

                <article className="metric-card">
                  <span className="metric-label">Lançamentos</span>
                  <strong>{history.length}</strong>
                  <small>Registros encontrados</small>
                </article>

                <article className="metric-card">
                  <span className="metric-label">Média por lançamento</span>
                  <strong>{money(averageExpense)}</strong>
                  <small>Valor médio</small>
                </article>

                <article className="metric-card">
                  <span className="metric-label">Economia estimada</span>
                  <strong className="green-text">{money(savings)}</strong>
                  <small>Valores informados como evitados</small>
                </article>
              </div>

              <section className="habit-panel">
                <div className="section-heading">
                  <div>
                    <span className="section-eyebrow">CONSULTA</span>
                    <h2>Histórico de gastos</h2>
                    <p>Pesquise e filtre seus registros.</p>
                  </div>
                </div>

                <div className="habit-form-grid">
                  <label>
                    Buscar descrição
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Digite para pesquisar"
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    Categoria
                    <select
                      value={filter}
                      onChange={(event) => setFilter(event.target.value)}
                      style={inputStyle}
                    >
                      <option value="Todas">Todas as categorias</option>
                      {categories.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="report-toolbar">
                  <span>
                    {history.length} registro(s) encontrado(s).
                  </span>

                  <button
                    type="button"
                    onClick={exportCsv}
                    className="habit-primary-button"
                    disabled={history.length === 0}
                  >
                    ↓ Exportar CSV
                  </button>
                </div>

                <div className="table-wrapper">
                  <table className="habit-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Valor</th>
                        <th>Origem</th>
                      </tr>
                    </thead>

                    <tbody>
                      {history.map((item) => (
                        <tr key={`${item.origin}-${item.id}`}>
                          <td>{dateLabel(item.date)}</td>
                          <td>{item.name}</td>
                          <td>{item.category}</td>
                          <td>
                            <strong>{money(item.amount)}</strong>
                          </td>
                          <td>
                            <span className="origin-pill">{item.origin}</span>
                          </td>
                        </tr>
                      ))}

                      {history.length === 0 && (
                        <tr>
                          <td colSpan={5} className="table-empty">
                            Nenhum lançamento encontrado com esses filtros.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          <footer className="habit-footer">
            <div>
              <strong>Resgata+</strong>
              <p>
                Sua jornada financeira começa com um pequeno passo.
              </p>
            </div>

            <div className="footer-actions">
              <button
                type="button"
                onClick={restoreExamples}
                className="habit-secondary-button"
              >
                Restaurar demonstração
              </button>

              <a href="/register">Conhecer a versão completa →</a>
            </div>

            <small>
              Demonstração independente · Dados temporários · Não altera
              sua Carteira real.
            </small>
          </footer>
        </div>
      </main>

      <style jsx>{`
        .habit-demo {
          min-height: 100vh;
          padding: 28px 16px 55px;
          color: #172033;
          background: linear-gradient(
            180deg,
            #f0f7f7 0%,
            #f8fafc 45%,
            #f2f7f5 100%
          );
        }

        .habit-container {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
        }

        .habit-hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 28px;
          padding: 34px;
          margin-bottom: 18px;
          border: 1px solid #d9e9e5;
          border-radius: 22px;
          background: linear-gradient(120deg, #dff5e9, #e5efff 68%, #f1ebff);
        }

        .habit-hero-content {
          max-width: 690px;
        }

        .habit-eyebrow,
        .section-eyebrow {
          color: #0f766e;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .habit-hero h1 {
          margin: 10px 0;
          color: #173c70;
          font-size: clamp(29px, 5vw, 42px);
          letter-spacing: -1.2px;
        }

        .habit-hero p {
          max-width: 650px;
          margin: 0;
          color: #435873;
          line-height: 1.7;
          font-size: 15px;
        }

        .habit-hero-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 20px;
        }

        .habit-hero-tags span {
          padding: 7px 10px;
          border: 1px solid #d3e8dc;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.65);
          color: #27644d;
          font-size: 11px;
          font-weight: 700;
        }

        .habit-hero-illustration {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-width: 190px;
          max-width: 210px;
          padding: 22px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.65);
          text-align: center;
        }

        .habit-hero-illustration span {
          font-size: 48px;
        }

        .habit-hero-illustration strong {
          color: #245548;
          line-height: 1.4;
          font-size: 14px;
        }

        .habit-hero-illustration small {
          color: #64748b;
        }

        .demo-notice {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px 17px;
          margin-bottom: 18px;
          border: 1px solid #d8e7fa;
          border-radius: 13px;
          background: #f0f7ff;
          color: #294b72;
        }

        .demo-notice > span {
          font-size: 21px;
        }

        .demo-notice strong {
          display: block;
          font-size: 13px;
        }

        .demo-notice p {
          margin: 5px 0 0;
          color: #536b87;
          font-size: 12px;
          line-height: 1.6;
        }

        .habit-period {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 16px 18px;
          margin-bottom: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: white;
        }

        .habit-period strong,
        .habit-period small {
          display: block;
        }

        .habit-period strong {
          font-size: 14px;
        }

        .habit-period small {
          margin-top: 4px;
          color: #64748b;
          font-size: 12px;
        }

        .habit-period select {
          min-width: 190px;
          padding: 10px;
          border: 1px solid #d7e0e9;
          border-radius: 9px;
          background: white;
          color: #334155;
        }

        .habit-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 18px;
        }

        .habit-tabs button {
          padding: 11px 16px;
          border: 1px solid #dbe4ef;
          border-radius: 10px;
          background: white;
          color: #475569;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .habit-tabs button:hover {
          border-color: #9dcfc0;
          color: #0f766e;
        }

        .habit-tabs button.active {
          border-color: #b9d1ff;
          background: #e8efff;
          color: #234fc5;
        }

        .habit-message {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 13px 15px;
          margin-bottom: 16px;
          border: 1px solid #bfdbfe;
          border-radius: 10px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 13px;
        }

        .habit-message button {
          border: 0;
          background: transparent;
          color: inherit;
          font-size: 20px;
          cursor: pointer;
        }

        .habit-welcome {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 22px;
          margin-bottom: 17px;
          border: 1px solid #dcece6;
          border-radius: 16px;
          background: #f5fbf7;
        }

        .habit-welcome h2 {
          margin: 7px 0;
          color: #173c70;
          font-size: 20px;
        }

        .habit-welcome p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
        }

        .welcome-icon {
          font-size: 35px;
        }

        .habit-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }

        .metric-card {
          min-width: 0;
          padding: 18px;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          background: white;
          box-shadow: 0 3px 12px rgba(15, 23, 42, 0.025);
        }

        .metric-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          margin-bottom: 12px;
          border-radius: 10px;
          font-size: 18px;
        }

        .metric-icon.blue {
          background: #eaf1ff;
        }

        .metric-icon.green {
          background: #e6f8ee;
        }

        .metric-icon.orange {
          background: #fff3e4;
        }

        .metric-icon.purple {
          background: #f1eaff;
        }

        .metric-label {
          display: block;
          color: #64748b;
          font-size: 12px;
          font-weight: 650;
        }

        .metric-card > strong {
          display: block;
          overflow-wrap: anywhere;
          margin: 9px 0 6px;
          color: #173c70;
          font-size: clamp(19px, 2.5vw, 25px);
        }

        .metric-card small {
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.5;
        }

        .habit-panel {
          padding: 22px;
          margin-bottom: 18px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: white;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.035);
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 17px;
        }

        .section-heading h2 {
          margin: 6px 0;
          color: #173c70;
          font-size: 20px;
        }

        .section-heading p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.6;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .summary-item {
          padding: 16px;
          border-radius: 12px;
          background: #f8fafc;
        }

        .summary-item span {
          display: block;
          color: #64748b;
          font-size: 12px;
        }

        .summary-item strong {
          display: block;
          margin-top: 8px;
          color: #173c70;
          font-size: 20px;
        }

        .summary-item.savings-item {
          background: #f0fdf4;
        }

        .summary-item.savings-item strong {
          color: #15803d;
        }

        .habit-disclaimer {
          margin: 15px 0 0;
          color: #8491a3;
          font-size: 11px;
          line-height: 1.6;
        }

        .habit-progress-list,
        .habit-list,
        .habit-history {
          display: grid;
          gap: 11px;
        }

        .habit-progress-card,
        .habit-list-card {
          padding: 16px;
          border: 1px solid #e6edf2;
          border-radius: 13px;
          background: #fff;
        }

        .progress-card-top,
        .progress-values {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .progress-card-top strong,
        .progress-card-top small {
          display: block;
        }

        .progress-card-top strong {
          color: #253b59;
          font-size: 14px;
        }

        .progress-card-top small {
          margin-top: 4px;
          color: #8491a3;
          font-size: 11px;
        }

        .progress-status {
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 750;
        }

        .progress-status.normal {
          background: #e8f7ee;
          color: #166534;
        }

        .progress-status.attention {
          background: #fff7df;
          color: #a16207;
        }

        .progress-status.exceeded {
          background: #fff0e8;
          color: #c2410c;
        }

        .progress-values {
          margin-top: 12px;
          color: #64748b;
          font-size: 11px;
        }

        .progress-track {
          width: 100%;
          height: 9px;
          margin-top: 7px;
          overflow: hidden;
          border-radius: 30px;
          background: #edf2f7;
        }

        .progress-fill {
          height: 100%;
          border-radius: 30px;
          background: #159477;
          transition: width 0.3s ease;
        }

        .attention-fill {
          background: #d69b28;
        }

        .exceeded-fill {
          background: #dc6b36;
        }

        .progress-footnote {
          display: block;
          margin-top: 7px;
          color: #8491a3;
          font-size: 11px;
        }

        .habit-primary-button,
        .habit-secondary-button,
        .habit-danger-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 38px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .habit-primary-button {
          border: 1px solid #0f766e;
          background: #0f766e;
          color: white;
        }

        .habit-primary-button:hover {
          background: #115e59;
        }

        .habit-primary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .habit-secondary-button {
          border: 1px solid #d7e0e9;
          background: white;
          color: #334155;
        }

        .habit-secondary-button:hover {
          border-color: #0f766e;
          color: #0f766e;
        }

        .habit-danger-button {
          border: 1px solid #fecaca;
          background: white;
          color: #b91c1c;
        }

        .habit-danger-button:hover {
          background: #fff1f2;
        }

        .habit-cta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 18px;
          padding: 22px;
          margin-bottom: 18px;
          border: 1px solid #cce9dc;
          border-radius: 16px;
          background: linear-gradient(110deg, #e8f8ee, #edf4ff);
        }

        .habit-cta > div {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .habit-cta > div > span {
          font-size: 30px;
        }

        .habit-cta strong {
          color: #245548;
          font-size: 14px;
        }

        .habit-cta p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.6;
        }

        .habit-cta a,
        .footer-actions a {
          color: #0f766e;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }

        .habit-cta a:hover,
        .footer-actions a:hover {
          text-decoration: underline;
        }

        .suggestion-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 9px;
          margin-bottom: 20px;
        }

        .suggestion-button {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 11px;
          background: #f8fafc;
          color: #334155;
          font-size: 12px;
          font-weight: 650;
          text-align: left;
          cursor: pointer;
        }

        .suggestion-button:hover {
          border-color: #9dcfc0;
          background: #f0faf5;
        }

        .suggestion-button span {
          font-size: 19px;
        }

        .habit-form-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
        }

        .habit-form-grid label {
          display: grid;
          gap: 7px;
          color: #475569;
          font-size: 12px;
          font-weight: 700;
        }

        .habit-form-grid .full-field {
          grid-column: 1 / -1;
        }

        .habit-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 15px;
        }

        .habit-list-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .habit-list-info {
          flex: 1;
          min-width: 190px;
        }

        .habit-list-title {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
        }

        .habit-list-title strong {
          color: #253b59;
          font-size: 14px;
        }

        .habit-list-info > small {
          display: block;
          margin-top: 6px;
          color: #8491a3;
          font-size: 11px;
        }

        .habit-pill,
        .origin-pill {
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
        }

        .active-pill {
          background: #dcfce7;
          color: #166534;
        }

        .paused-pill {
          background: #f1f5f9;
          color: #475569;
        }

        .habit-history {
          gap: 9px;
        }

        .history-card {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 12px;
          padding: 13px;
          border: 1px solid #e6edf2;
          border-radius: 11px;
        }

        .history-card strong {
          color: #253b59;
          font-size: 13px;
        }

        .history-card small,
        .history-card p {
          display: block;
          margin: 5px 0 0;
          color: #8491a3;
          font-size: 11px;
        }

        .history-actions {
          display: grid;
          justify-items: end;
          gap: 6px;
        }

        .green-text {
          color: #15803d !important;
        }

        .expense-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 14px;
          border: 1px solid #e6edf2;
          border-radius: 12px;
        }

        .expense-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 12px;
          background: #eff6ff;
          font-size: 21px;
        }

        .expense-info {
          flex: 1;
          min-width: 120px;
        }

        .expense-info strong,
        .expense-info small {
          display: block;
        }

        .expense-info strong {
          color: #253b59;
          font-size: 13px;
        }

        .expense-info small,
        .expense-info p {
          margin: 5px 0 0;
          color: #8491a3;
          font-size: 11px;
        }

        .expense-value {
          color: #173c70;
          font-size: 15px;
        }

        .category-chart {
          display: grid;
          gap: 19px;
          padding: 5px 0;
        }

        .category-label {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 7px;
          font-size: 12px;
        }

        .category-label strong {
          color: #475569;
        }

        .category-label span {
          color: #173c70;
          font-weight: 750;
        }

        .chart-total {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding-top: 17px;
          margin-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #475569;
          font-size: 13px;
        }

        .chart-total strong {
          color: #173c70;
          font-size: 17px;
        }

        .report-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin: 18px 0 12px;
          color: #64748b;
          font-size: 12px;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .habit-table {
          width: 100%;
          min-width: 570px;
          border-collapse: collapse;
          font-size: 12px;
        }

        .habit-table th {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 10px;
          text-align: left;
          text-transform: uppercase;
        }

        .habit-table td {
          padding: 13px 12px;
          border-bottom: 1px solid #edf2f7;
          color: #475569;
        }

        .origin-pill {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .table-empty {
          padding: 25px !important;
          color: #94a3b8 !important;
          text-align: center;
        }

        .habit-empty {
          display: grid;
          justify-items: center;
          gap: 8px;
          padding: 35px 15px;
          border: 1px dashed #d7e0e9;
          border-radius: 13px;
          background: #fafcfd;
          text-align: center;
        }

        .habit-empty span {
          font-size: 30px;
        }

        .habit-empty strong {
          color: #334155;
          font-size: 14px;
        }

        .habit-empty p,
        .habit-muted {
          margin: 0;
          color: #8491a3;
          font-size: 12px;
        }

        .habit-footer {
          display: grid;
          justify-items: center;
          gap: 14px;
          padding: 25px 10px 5px;
          text-align: center;
        }

        .habit-footer strong {
          color: #173c70;
          font-size: 17px;
        }

        .habit-footer p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 12px;
        }

        .footer-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .habit-footer > small {
          color: #94a3b8;
          font-size: 10px;
        }

        @media (max-width: 850px) {
          .habit-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .habit-form-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .suggestion-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .habit-hero-illustration {
            min-width: 150px;
          }
        }

        @media (max-width: 600px) {
          .habit-demo {
            padding: 16px 11px 35px;
          }

          .habit-hero {
            flex-direction: column;
            align-items: flex-start;
            padding: 23px 19px;
            border-radius: 17px;
          }

          .habit-hero-illustration {
            display: none;
          }

          .habit-hero h1 {
            font-size: 30px;
          }

          .habit-hero p {
            font-size: 13px;
          }

          .habit-hero-tags {
            gap: 6px;
          }

          .habit-hero-tags span {
            font-size: 10px;
          }

          .demo-notice {
            padding: 12px;
          }

          .habit-period {
            align-items: stretch;
            flex-direction: column;
          }

          .habit-period select {
            width: 100%;
          }

          .habit-tabs {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .habit-tabs button {
            padding: 11px 7px;
            font-size: 11px;
          }

          .habit-tabs button:last-child {
            grid-column: 1 / -1;
          }

          .habit-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          .metric-card {
            padding: 13px;
          }

          .metric-card > strong {
            font-size: 19px;
          }

          .metric-card small {
            font-size: 10px;
          }

          .habit-panel {
            padding: 16px 13px;
          }

          .section-heading {
            align-items: flex-start;
          }

          .section-heading h2 {
            font-size: 18px;
          }

          .section-heading > button {
            padding: 9px;
            font-size: 10px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .habit-welcome {
            padding: 17px;
          }

          .habit-welcome h2 {
            font-size: 17px;
          }

          .welcome-icon {
            font-size: 27px;
          }

          .habit-form-grid {
            grid-template-columns: 1fr;
          }

          .habit-form-grid .full-field {
            grid-column: auto;
          }

          .suggestion-grid {
            grid-template-columns: 1fr 1fr;
          }

          .suggestion-button {
            padding: 10px 8px;
            font-size: 10px;
          }

          .habit-list-card {
            align-items: flex-start;
          }

          .habit-list-card > .habit-actions {
            width: 100%;
          }

          .habit-list-card > .habit-actions button {
            flex: 1;
          }

          .expense-card {
            flex-wrap: wrap;
          }

          .expense-info {
            min-width: calc(100% - 60px);
          }

          .expense-value {
            margin-left: 54px;
          }

          .report-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .habit-cta {
            align-items: flex-start;
            flex-direction: column;
          }

          .habit-cta a {
            margin-left: 43px;
          }

          .history-actions {
            justify-items: start;
          }

          .footer-actions {
            flex-direction: column;
          }
        }
                    
          /* =========================================
            RESGATA+ — VISUAL COLORIDO E ELEGANTE
          ========================================= */

          .habit-demo {
            background:
              radial-gradient(circle at 5% 5%, rgba(96, 165, 250, .10), transparent 25%),
              radial-gradient(circle at 95% 15%, rgba(168, 85, 247, .09), transparent 25%),
              linear-gradient(180deg, #f3f7ff 0%, #f8fafc 55%, #f5f8ff 100%);
          }

          /* Hero */
          .habit-hero {
            position: relative;
            overflow: hidden;
            border: 1px solid #cbdcfb;
            background: linear-gradient(120deg, #dbeafe 0%, #e9e4ff 55%, #dcfce7 100%);
            box-shadow: 0 12px 35px rgba(37, 76, 145, .08);
          }

          .habit-hero::after {
            content: "";
            position: absolute;
            width: 220px;
            height: 220px;
            right: -65px;
            top: -95px;
            border-radius: 50%;
            background: rgba(255, 255, 255, .28);
            pointer-events: none;
          }

          /* Títulos */
          .habit-eyebrow,
          .section-eyebrow {
            color: #5365d8;
          }

          .habit-hero h1,
          .habit-welcome h2,
          .section-heading h2 {
            color: #193b70;
          }

          /* Aviso da demonstração */
          .demo-notice {
            border-color: #bfdbfe;
            background: linear-gradient(110deg, #eff6ff, #f5f3ff);
            box-shadow: 0 4px 14px rgba(59, 130, 246, .05);
          }

          /* Abas */
          .habit-tabs button {
            transition: transform .2s ease, box-shadow .2s ease,
              background .2s ease, border-color .2s ease;
          }

          .habit-tabs button:hover {
            transform: translateY(-2px);
            border-color: #a5b4fc;
            background: #f5f3ff;
            box-shadow: 0 5px 13px rgba(79, 70, 229, .08);
          }

          .habit-tabs button.active {
            border-color: #a5b4fc;
            background: linear-gradient(120deg, #e0e7ff, #ede9fe);
            color: #4338ca;
            box-shadow: 0 4px 12px rgba(99, 102, 241, .10);
          }

          /* Mensagens */
          .habit-message {
            border-color: #c4b5fd;
            background: #f5f3ff;
            color: #5b21b6;
          }

          /* Cards de métricas */
          .habit-metrics {
            gap: 14px;
          }

          .metric-card {
            position: relative;
            overflow: hidden;
            border-radius: 16px;
            transition: transform .22s ease, box-shadow .22s ease;
          }

          .metric-card::before {
            content: "";
            position: absolute;
            inset: 0 0 auto;
            height: 4px;
            background: #3b82f6;
          }

          .metric-card:nth-child(4n + 1)::before {
            background: #3b82f6;
          }

          .metric-card:nth-child(4n + 2)::before {
            background: #16a34a;
          }

          .metric-card:nth-child(4n + 3)::before {
            background: #e9a23b;
          }

          .metric-card:nth-child(4n + 4)::before {
            background: #9333ea;
          }

          .metric-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 25px rgba(30, 64, 175, .09);
          }

          .metric-card:nth-child(4n + 1) .metric-label {
            color: #2563eb;
          }

          .metric-card:nth-child(4n + 2) .metric-label {
            color: #15803d;
          }

          .metric-card:nth-child(4n + 3) .metric-label {
            color: #b45309;
          }

          .metric-card:nth-child(4n + 4) .metric-label {
            color: #7e22ce;
          }

          /* Ícones */
          .metric-icon.blue {
            background: #dbeafe;
            color: #2563eb;
          }

          .metric-icon.green {
            background: #dcfce7;
            color: #15803d;
          }

          .metric-icon.orange {
            background: #fef3c7;
            color: #b45309;
          }

          .metric-icon.purple {
            background: #f3e8ff;
            color: #9333ea;
          }

          /* Painéis */
          .habit-panel {
            border-color: #dce5f2;
            box-shadow: 0 7px 22px rgba(30, 64, 175, .045);
            transition: box-shadow .2s ease;
          }

          .habit-panel:hover {
            box-shadow: 0 10px 28px rgba(30, 64, 175, .075);
          }

          /* Resumos */
          .summary-item {
            border: 1px solid #e2e8f0;
            transition: transform .2s ease;
          }

          .summary-item:hover {
            transform: translateY(-2px);
          }

          .summary-item:nth-child(1) {
            border-color: #bfdbfe;
            background: #eff6ff;
          }

          .summary-item:nth-child(2) {
            border-color: #fde68a;
            background: #fffbeb;
          }

          .summary-item:nth-child(3),
          .summary-item.savings-item {
            border-color: #bbf7d0;
            background: #f0fdf4;
          }

          /* Barras de progresso */
          .progress-track {
            background: #e8edf5;
          }

          .progress-fill {
            background: linear-gradient(90deg, #2563eb, #0d9488);
          }

          .attention-fill {
            background: linear-gradient(90deg, #f59e0b, #fbbf24);
          }

          .exceeded-fill {
            background: linear-gradient(90deg, #ef4444, #f97316);
          }

          /* Cards de hábitos */
          .habit-progress-card,
          .habit-list-card,
          .history-card,
          .expense-card {
            transition: transform .2s ease, box-shadow .2s ease,
              border-color .2s ease;
          }

          .habit-progress-card:hover,
          .habit-list-card:hover,
          .history-card:hover,
          .expense-card:hover {
            transform: translateY(-2px);
            border-color: #c7d2fe;
            box-shadow: 0 7px 17px rgba(30, 64, 175, .06);
          }

          /* Sugestões */
          .suggestion-button {
            border-color: #ddd6fe;
            background: linear-gradient(135deg, #faf5ff, #f5f3ff);
            transition: transform .2s ease, box-shadow .2s ease;
          }

          .suggestion-button:hover {
            transform: translateY(-3px);
            border-color: #a78bfa;
            background: #ede9fe;
            box-shadow: 0 7px 16px rgba(124, 58, 237, .09);
          }

          /* Botões */
          .habit-primary-button {
            border-color: #2563eb;
            background: linear-gradient(110deg, #2563eb, #4f46e5);
            box-shadow: 0 4px 11px rgba(37, 99, 235, .16);
          }

          .habit-primary-button:hover {
            transform: translateY(-2px);
            background: linear-gradient(110deg, #1d4ed8, #4338ca);
            box-shadow: 0 7px 16px rgba(37, 99, 235, .22);
          }

          .habit-secondary-button:hover {
            background: #eff6ff;
            border-color: #93c5fd;
          }

          .habit-danger-button:hover {
            border-color: #fca5a5;
            background: #fff1f2;
          }

          /* CTA */
          .habit-cta {
            border-color: #c7d2fe;
            background: linear-gradient(110deg, #e0f2fe, #ede9fe, #dcfce7);
            box-shadow: 0 7px 20px rgba(79, 70, 229, .06);
          }

          .habit-cta strong {
            color: #3730a3;
          }

          .habit-cta a,
          .footer-actions a {
            color: #4338ca;
          }

          /* Despesas */
          .expense-icon {
            background: linear-gradient(135deg, #dbeafe, #ede9fe);
            color: #4338ca;
          }

          /* Gráfico */
          .category-label strong {
            color: #334155;
          }

          .category-label span {
            color: #4338ca;
            font-weight: 800;
          }

          .category-row:nth-child(4n + 1) .progress-fill {
            background: linear-gradient(90deg, #2563eb, #60a5fa);
          }

          .category-row:nth-child(4n + 2) .progress-fill {
            background: linear-gradient(90deg, #7c3aed, #c084fc);
          }

          .category-row:nth-child(4n + 3) .progress-fill {
            background: linear-gradient(90deg, #d97706, #fbbf24);
          }

          .category-row:nth-child(4n + 4) .progress-fill {
            background: linear-gradient(90deg, #16a34a, #4ade80);
          }

          /* Relatórios */
          .habit-table th {
            background: #f1f5ff;
            color: #4f46e5;
          }

          .habit-table tbody tr:hover {
            background: #f8faff;
          }

          .origin-pill {
            background: #ede9fe;
            color: #6d28d9;
          }

          /* Rodapé */
          .habit-footer {
            border-top: 1px solid #dce5f2;
          }

          .habit-footer strong {
            color: #3730a3;
          }

          /* Foco acessível */
          .habit-demo button:focus-visible,
          .habit-demo input:focus-visible,
          .habit-demo select:focus-visible,
          .habit-demo a:focus-visible {
            outline: 3px solid rgba(99, 102, 241, .35);
            outline-offset: 3px;
          }

          /* Animações respeitando acessibilidade */
          @media (prefers-reduced-motion: reduce) {
            .habit-demo *,
            .habit-demo *::before,
            .habit-demo *::after {
              scroll-behavior: auto !important;
              animation-duration: .01ms !important;
              transition-duration: .01ms !important;
            }
          }

          /* Ajustes para celulares */
          @media (max-width: 600px) {
            .habit-hero {
              background: linear-gradient(145deg, #dbeafe, #ede9fe 65%, #dcfce7);
            }

            .metric-card:hover,
            .habit-progress-card:hover,
            .habit-list-card:hover,
            .history-card:hover,
            .expense-card:hover {
              transform: none;
            }

            .habit-panel {
              box-shadow: 0 4px 13px rgba(30, 64, 175, .045);
            }

            .habit-cta {
              background: linear-gradient(135deg, #e0f2fe, #ede9fe);
            }
          }

        


      `}</style>
    </>
  );
}