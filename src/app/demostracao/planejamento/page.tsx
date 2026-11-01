
"use client";

import DemoMenu from "@/components/DemoMenu";
import { useMemo, useState } from "react";

type Plan = {
  income: string;
  essentials: string;
  otherExpenses: string;
  debtGoal: string;
  actualIncome: string;
  actualExpenses: string;
  actualDebt: string;
};

const initialPlan: Plan = {
  income: "3500",
  essentials: "1400",
  otherExpenses: "600",
  debtGoal: "500",
  actualIncome: "3500",
  actualExpenses: "1850",
  actualDebt: "400",
};

const money = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const number = (value: string) => {
  const normalized = value.trim().replace(/\s/g, "").replace(/^R\$/i, "");

  if (!normalized) return 0;

  const parsedValue = normalized.includes(",")
    ? normalized.replace(/\./g, "").replace(",", ".")
    : normalized;

  const parsed = Number(parsedValue);

  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

const currentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const monthLabel = (value: string) => {
  if (!value) return "";

  const [year, month] = value.split("-");

  return new Date(Number(year), Number(month) - 1, 15).toLocaleDateString(
    "pt-BR",
    { month: "long", year: "numeric" }
  );
};

export default function PlanejamentoDemoPage() {
  const [plan, setPlan] = useState<Plan>({ ...initialPlan });
  const [month, setMonth] = useState(currentMonth);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const totals = useMemo(() => {
    const income = number(plan.income);
    const essentials = number(plan.essentials);
    const other = number(plan.otherExpenses);
    const debtGoal = number(plan.debtGoal);

    const plannedExpenses = essentials + other;
    const plannedBalance = income - plannedExpenses;
    const afterGoal = plannedBalance - debtGoal;

    const actualIncome = number(plan.actualIncome);
    const actualExpenses = number(plan.actualExpenses);
    const actualDebt = number(plan.actualDebt);

    const actualBalance = actualIncome - actualExpenses - actualDebt;

    const committed = income > 0 ? (plannedExpenses / income) * 100 : 0;
    const debtCommitted = income > 0 ? (debtGoal / income) * 100 : 0;
    const totalCommitted = committed + debtCommitted;

    const difference = actualBalance - afterGoal;

    return {
      income,
      essentials,
      other,
      debtGoal,
      plannedExpenses,
      plannedBalance,
      afterGoal,
      committed,
      debtCommitted,
      totalCommitted,
      actualIncome,
      actualExpenses,
      actualDebt,
      actualBalance,
      difference,
    };
  }, [plan]);

  const financialInsight = useMemo(() => {
    if (totals.income <= 0) {
      return {
        title: "Comece informando sua renda",
        description:
          "Informe quanto você espera receber para começar a organizar seu orçamento e definir suas prioridades.",
        tone: "blue",
        recommendation:
          "O primeiro passo é entender quanto dinheiro estará disponível durante o mês.",
      };
    }

    if (totals.afterGoal < 0) {
      return {
        title: "Seu planejamento precisa de ajustes",
        description:
          "Os gastos previstos e a meta para dívidas ultrapassam sua renda. Revise os valores e veja o que pode ser ajustado.",
        tone: "red",
        recommendation:
          "Considere revisar despesas variáveis e adaptar sua meta de pagamento para um valor que caiba no orçamento.",
      };
    }

    if (totals.totalCommitted >= 100) {
      return {
        title: "Sua renda está totalmente comprometida",
        description:
          "Todo o valor previsto já está destinado aos gastos e à meta de dívidas. Procure criar uma margem para imprevistos.",
        tone: "red",
        recommendation:
          "Revise suas prioridades e evite assumir novos compromissos financeiros antes de reorganizar o orçamento.",
      };
    }

    if (totals.totalCommitted >= 80) {
      return {
        title: "Atenção ao comprometimento da renda",
        description:
          "Boa parte da sua renda já está destinada aos gastos e às dívidas. É importante acompanhar os valores durante o mês.",
        tone: "orange",
        recommendation:
          "Observe principalmente os gastos variáveis e procure preservar uma reserva para situações inesperadas.",
      };
    }

    return {
      title: "Você tem espaço no orçamento",
      description:
        "Seu planejamento apresenta saldo positivo após a meta de dívidas. Continue acompanhando os gastos reais durante o mês.",
      tone: "green",
      recommendation:
        "Mantenha o acompanhamento e use o saldo disponível com consciência, considerando também os imprevistos.",
    };
  }, [totals]);

  function update(field: keyof Plan, value: string) {
    setPlan((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
  }

  function save() {
    setMessage(
      "Planejamento atualizado nesta demonstração. Seus dados são temporários."
    );
    setMessageType("success");
  }

  function restoreExamples() {
    if (
      !window.confirm(
        "Deseja restaurar os valores fictícios? Os valores atuais serão substituídos."
      )
    ) {
      return;
    }

    setPlan({ ...initialPlan });
    setMessage("Valores de demonstração restaurados com sucesso.");
    setMessageType("success");
  }

  function exportCsv() {
    const rows = [
      ["Planejamento e Relatórios", monthLabel(month)],
      [],
      ["Indicador", "Planejado", "Realizado"],
      ["Renda", money(totals.income), money(totals.actualIncome)],
      ["Gastos essenciais", money(totals.essentials), ""],
      ["Outros gastos", money(totals.other), ""],
      [
        "Despesas totais",
        money(totals.plannedExpenses),
        money(totals.actualExpenses),
      ],
      ["Meta de dívidas", money(totals.debtGoal), money(totals.actualDebt)],
      ["Saldo após meta", money(totals.afterGoal), money(totals.actualBalance)],
      ["Diferença entre saldos", "", money(totals.difference)],
      ["Renda comprometida com gastos", `${Math.round(totals.committed)}%`, ""],
      ["Renda comprometida com dívidas", `${Math.round(totals.debtCommitted)}%`, ""],
      ["Renda comprometida no total", `${Math.round(totals.totalCommitted)}%`, ""],
    ];

    const csv =
      "\uFEFF" +
      rows
        .map((row) =>
          row
            .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
            .join(";")
        )
        .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = `planejamento-${month}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  const plannedFields: {
    key: keyof Plan;
    label: string;
    description: string;
  }[] = [
    {
      key: "income",
      label: "Renda prevista",
      description: "Quanto você espera receber no mês.",
    },
    {
      key: "essentials",
      label: "Gastos essenciais previstos",
      description: "Moradia, alimentação, contas e transporte.",
    },
    {
      key: "otherExpenses",
      label: "Outros gastos previstos",
      description: "Lazer, compras e despesas variáveis.",
    },
    {
      key: "debtGoal",
      label: "Meta para pagamento de dívidas",
      description: "Valor que pretende reservar para quitar dívidas.",
    },
  ];

  const actualFields: {
    key: keyof Plan;
    label: string;
    description: string;
  }[] = [
    {
      key: "actualIncome",
      label: "Renda recebida",
      description: "Total que realmente entrou no mês.",
    },
    {
      key: "actualExpenses",
      label: "Despesas realizadas",
      description: "Total efetivamente gasto no período.",
    },
    {
      key: "actualDebt",
      label: "Dívidas pagas",
      description: "Total efetivamente destinado às dívidas.",
    },
  ];

  const styles = `
    .plan-page {
      min-height: 100vh;
      padding: 0 18px 48px;
      color: #172033;
      background:
        radial-gradient(ellipse at 5% 0%, rgba(37,99,235,.10), transparent 32%),
        radial-gradient(ellipse at 95% 12%, rgba(124,58,237,.09), transparent 30%),
        #f5f8fd;
    }

    .plan-wrap {
      max-width: 1180px;
      margin: 0 auto;
    }

    .plan-hero {
      position: relative;
      overflow: hidden;
      margin: 24px 0;
      padding: 34px;
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 22px;
      color: #fff;
      background: linear-gradient(120deg, #123c78 0%, #2459ad 55%, #6541a5 100%);
      box-shadow: 0 15px 35px rgba(30,64,130,.16);
    }

    .plan-hero::after {
      content: "";
      position: absolute;
      width: 280px;
      height: 280px;
      right: -85px;
      top: -150px;
      border: 1px solid rgba(255,255,255,.17);
      border-radius: 50%;
      box-shadow: 0 0 0 30px rgba(255,255,255,.035),
                  0 0 0 65px rgba(255,255,255,.025);
      pointer-events: none;
    }

    .plan-hero > * {
      position: relative;
      z-index: 1;
    }

    .plan-eyebrow {
      display: inline-flex;
      align-items: center;
      padding: 7px 11px;
      border: 1px solid rgba(255,255,255,.25);
      border-radius: 30px;
      color: #e1efff;
      background: rgba(255,255,255,.11);
      font-size: 10px;
      font-weight: 850;
      letter-spacing: 1px;
    }

    .plan-hero h1 {
      margin: 14px 0 10px;
      color: #fff;
      font-size: clamp(28px, 4vw, 39px);
      font-weight: 850;
      letter-spacing: -1.1px;
    }

    .plan-hero p {
      max-width: 720px;
      color: #e2eaff;
      line-height: 1.7;
      margin: 0;
    }

    .plan-month {
      display: grid;
      gap: 7px;
      max-width: 250px;
      margin-top: 23px;
      color: #fff;
      font-size: 13px;
      font-weight: 750;
    }

    .plan-month input,
    .plan-field input {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      padding: 12px 13px;
      border: 1px solid #d5deeb;
      border-radius: 10px;
      background: #fff;
      color: #172033;
      font: inherit;
      outline: none;
      transition: border-color .2s ease, box-shadow .2s ease;
    }

    .plan-month input:focus,
    .plan-field input:focus {
      border-color: #3978df;
      box-shadow: 0 0 0 4px rgba(37,99,235,.11);
    }

    .plan-hero .plan-muted {
      color: #d8e5fb;
    }

    .plan-section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 29px 0 15px;
      color: #17345d;
      font-size: 21px;
      font-weight: 850;
      letter-spacing: -.4px;
    }

    .plan-section-title::before {
      content: "";
      display: block;
      width: 5px;
      height: 24px;
      flex: 0 0 5px;
      border-radius: 5px;
      background: linear-gradient(180deg, #2563eb, #8b5cf6);
    }

    .plan-muted {
      color: #64748b;
      font-size: 13px;
      line-height: 1.65;
    }

    .plan-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 22px;
    }

    .plan-card,
    .plan-panel {
      min-width: 0;
      padding: 21px;
      border: 1px solid #e1e8f2;
      border-radius: 17px;
      background: rgba(255,255,255,.96);
      box-shadow: 0 5px 18px rgba(15,23,42,.045);
    }

    .plan-card {
      position: relative;
      overflow: hidden;
      transition: transform .22s ease, box-shadow .22s ease;
    }

    .plan-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: #2563eb;
    }

    .plan-card:nth-child(2)::before { background: #f59e0b; }
    .plan-card:nth-child(3)::before { background: #8b5cf6; }
    .plan-card:nth-child(4)::before { background: #10b981; }

    .plan-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 25px rgba(15,23,42,.09);
    }

    .plan-card span {
      display: block;
      color: #64748b;
      font-size: 12px;
      font-weight: 750;
    }

    .plan-card strong {
      display: block;
      margin-top: 11px;
      font-size: clamp(19px, 2.2vw, 26px);
      font-weight: 850;
      letter-spacing: -.5px;
      overflow-wrap: anywhere;
    }

    .plan-card small {
      display: block;
      margin-top: 8px;
      color: #94a3b8;
      font-size: 11px;
    }

    .plan-blue { color: #2563eb; }
    .plan-green { color: #059669; }
    .plan-orange { color: #d97706; }
    .plan-purple { color: #7c3aed; }
    .plan-red { color: #dc2626; }

    .plan-insight {
      position: relative;
      margin: 19px 0 27px;
      padding: 23px;
      border: 1px solid #dce5f0;
      border-left: 5px solid #2563eb;
      border-radius: 16px;
      background: #eff6ff;
      box-shadow: 0 5px 18px rgba(15,23,42,.035);
    }

    .plan-insight-label {
      display: block;
      margin-bottom: 9px;
      color: #64748b;
      font-size: 10px;
      font-weight: 850;
      letter-spacing: .9px;
    }

    .plan-insight h2 {
      margin: 0 0 9px;
      color: #17345d;
      font-size: 20px;
      font-weight: 850;
    }

    .plan-insight p {
      margin: 0;
      color: #53657d;
      font-size: 13px;
      line-height: 1.75;
    }

    .plan-insight-recommendation {
      margin-top: 14px !important;
      padding-top: 14px;
      border-top: 1px solid rgba(100,116,139,.2);
    }

    .plan-insight.green {
      border-left-color: #059669;
      background: #ecfdf5;
    }

    .plan-insight.orange {
      border-left-color: #d97706;
      background: #fffbeb;
    }

    .plan-insight.red {
      border-left-color: #dc2626;
      background: #fef2f2;
    }

    .plan-insight.blue {
      border-left-color: #2563eb;
      background: #eff6ff;
    }

    .plan-forms {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      align-items: start;
    }

    .plan-panel {
      transition: box-shadow .2s ease;
    }

    .plan-panel h2 {
      margin: 0 0 8px;
      color: #17345d;
      font-size: 19px;
      font-weight: 850;
      letter-spacing: -.3px;
    }

    .plan-fields {
      display: grid;
      gap: 17px;
      margin-top: 20px;
    }

    .plan-field {
      display: grid;
      gap: 8px;
      color: #334155;
      font-size: 13px;
      font-weight: 750;
    }

    .plan-field small {
      color: #94a3b8;
      font-size: 11px;
      font-weight: 400;
      line-height: 1.5;
    }

    .plan-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 21px;
    }

    .plan-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      padding: 12px 17px;
      border: 1px solid transparent;
      border-radius: 10px;
      background: linear-gradient(110deg, #1d4ed8, #2563eb);
      color: #fff;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 5px 12px rgba(37,99,235,.16);
      transition: filter .2s ease, transform .2s ease, box-shadow .2s ease;
    }

    .plan-button:hover {
      filter: brightness(1.06);
      transform: translateY(-2px);
      box-shadow: 0 8px 17px rgba(37,99,235,.23);
    }

    .plan-button:focus-visible {
      outline: 3px solid #2563eb55;
      outline-offset: 3px;
    }

    .plan-button.secondary {
      border-color: #dbe3ed;
      background: #fff;
      color: #334155;
      box-shadow: none;
    }

    .plan-button.secondary:hover {
      border-color: #94a3b8;
      background: #f8fafc;
      box-shadow: 0 5px 12px rgba(15,23,42,.06);
    }

    .plan-button.purple {
      background: linear-gradient(110deg, #6d28d9, #8b5cf6);
      box-shadow: 0 5px 12px rgba(124,58,237,.17);
    }

    .plan-status {
      margin: 14px 0;
      padding: 12px 15px;
      border-radius: 10px;
      font-size: 12px;
      line-height: 1.6;
    }

    .plan-status.success {
      border: 1px solid #bbf7d0;
      background: #f0fdf4;
      color: #15803d;
    }

    .plan-status.error {
      border: 1px solid #fecaca;
      background: #fef2f2;
      color: #dc2626;
    }

    .plan-result {
      margin-top: 20px;
    }

    .plan-result-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin-top: 21px;
    }

    .plan-result-item {
      min-width: 0;
      padding: 15px;
      border: 1px solid #e5eaf2;
      border-radius: 12px;
      background: #f8fafc;
    }

    .plan-result-item:nth-child(1) { background: #eff6ff; }
    .plan-result-item:nth-child(2) { background: #fffbeb; }
    .plan-result-item:nth-child(3) { background: #f5f3ff; }
    .plan-result-item:nth-child(4) { background: #ecfdf5; }

    .plan-result-item span {
      display: block;
      color: #64748b;
      font-size: 12px;
    }

    .plan-result-item strong {
      display: block;
      margin-top: 8px;
      font-size: clamp(17px, 2vw, 22px);
      font-weight: 850;
      overflow-wrap: anywhere;
    }

    .plan-progress {
      margin-top: 24px;
    }

    .plan-progress-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 10px;
      color: #334155;
      font-size: 13px;
      font-weight: 750;
    }

    .plan-progress-track {
      height: 12px;
      overflow: hidden;
      border-radius: 20px;
      background: #e9eef5;
    }

    .plan-progress-fill {
      height: 100%;
      border-radius: 20px;
      transition: width .3s ease;
    }

    .plan-difference {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 22px;
      padding: 18px;
      border: 1px solid #dce5f0;
      border-radius: 13px;
      background: linear-gradient(110deg, #f8fafc, #eff6ff);
    }

    .plan-difference span {
      color: #64748b;
      font-size: 13px;
      line-height: 1.5;
    }

    .plan-difference strong {
      font-size: clamp(19px, 3vw, 25px);
      font-weight: 850;
    }

    .plan-footer {
      margin-top: 27px;
      padding: 22px 16px;
      border: 1px solid #e1e8f0;
      border-radius: 15px;
      color: #64748b;
      background: rgba(255,255,255,.7);
      font-size: 12px;
      line-height: 1.8;
      text-align: center;
    }

    .plan-footer strong {
      color: #17345d;
    }

    @media(max-width: 850px) {
      .plan-grid,
      .plan-result-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media(max-width: 650px) {
      .plan-page {
        padding: 0 11px 35px;
      }

      .plan-hero {
        padding: 25px 19px;
        border-radius: 17px;
      }

      .plan-forms {
        grid-template-columns: 1fr;
      }

      .plan-card,
      .plan-panel {
        padding: 17px;
      }

      .plan-insight {
        padding: 19px;
      }

      .plan-button {
        width: 100%;
      }

      .plan-actions {
        flex-direction: column;
      }

      .plan-month {
        max-width: 100%;
      }
    }

    @media(max-width: 380px) {
      .plan-grid,
      .plan-result-grid {
        grid-template-columns: 1fr;
      }

      .plan-hero h1 {
        font-size: 27px;
      }
    }

    @media(prefers-reduced-motion: reduce) {
      .plan-card,
      .plan-button,
      .plan-progress-fill {
        transition: none;
      }

      .plan-card:hover,
      .plan-button:hover {
        transform: none;
      }
    }
  `;

  const progressValue = Math.min(100, Math.max(0, totals.totalCommitted));

  return (
    <>
      <DemoMenu />

      <main className="plan-page">
        <style>{styles}</style>

        <div className="plan-wrap">
          <section className="plan-hero">
            <span className="plan-eyebrow">
              DEMONSTRAÇÃO · ORGANIZAÇÃO FINANCEIRA
            </span>

            <h1>Planejamento & Relatórios</h1>

            <p>
              Organize seu orçamento, acompanhe seus resultados e compare
              o que você planejou com o que realmente aconteceu.
            </p>

            <label className="plan-month">
              Mês de referência
              <input
                type="month"
                value={month}
                onChange={(event) =>
                  setMonth(event.target.value || currentMonth())
                }
              />
            </label>

            <p className="plan-muted" style={{ marginTop: 9 }}>
              Visualizando: {monthLabel(month)}
            </p>
          </section>

          <h2 className="plan-section-title">
            Resumo do planejamento
          </h2>

          <div className="plan-grid">
            <article className="plan-card">
              <span>Renda prevista</span>
              <strong className="plan-blue">{money(totals.income)}</strong>
              <small>Entrada esperada no mês</small>
            </article>

            <article className="plan-card">
              <span>Gastos planejados</span>
              <strong className="plan-orange">
                {money(totals.plannedExpenses)}
              </strong>
              <small>Essenciais e outros gastos</small>
            </article>

            <article className="plan-card">
              <span>Meta para dívidas</span>
              <strong className="plan-purple">
                {money(totals.debtGoal)}
              </strong>
              <small>Reserva para quitar dívidas</small>
            </article>

            <article className="plan-card">
              <span>Saldo após a meta</span>
              <strong className={totals.afterGoal < 0 ? "plan-red" : "plan-green"}>
                {money(totals.afterGoal)}
              </strong>
              <small>Disponibilidade planejada</small>
            </article>
          </div>

          <section
            className={`plan-insight ${financialInsight.tone}`}
            aria-live="polite"
          >
            <span className="plan-insight-label">
              ANÁLISE DO SEU PLANEJAMENTO
            </span>

            <h2>{financialInsight.title}</h2>

            <p>{financialInsight.description}</p>

            <p className="plan-insight-recommendation">
              <strong>Próximo passo: </strong>
              {financialInsight.recommendation}
            </p>
          </section>

          <h2 className="plan-section-title">
            Orçamento e acompanhamento
          </h2>

          <p className="plan-muted" style={{ marginTop: -5, marginBottom: 16 }}>
            Edite os valores abaixo. Os indicadores e comparações são
            recalculados automaticamente.
          </p>

          <div className="plan-forms">
            <section className="plan-panel">
              <h2>Planejamento mensal</h2>

              <p className="plan-muted">
                Defina quanto pretende receber, gastar e reservar para
                o pagamento de dívidas.
              </p>

              <div className="plan-fields">
                {plannedFields.map((field) => (
                  <label className="plan-field" key={field.key}>
                    {field.label}

                    <input
                      type="text"
                      inputMode="decimal"
                      value={plan[field.key]}
                      onChange={(event) =>
                        update(field.key, event.target.value)
                      }
                      placeholder="0,00"
                    />

                    <small>{field.description}</small>
                  </label>
                ))}
              </div>

              <div className="plan-actions">
                <button className="plan-button" type="button" onClick={save}>
                  Salvar planejamento
                </button>
              </div>
            </section>

            <section className="plan-panel">
              <h2>Valores realizados</h2>

              <p className="plan-muted">
                Informe o que realmente entrou, saiu e foi pago durante
                o mês selecionado.
              </p>

              <div className="plan-fields">
                {actualFields.map((field) => (
                  <label className="plan-field" key={field.key}>
                    {field.label}

                    <input
                      type="text"
                      inputMode="decimal"
                      value={plan[field.key]}
                      onChange={(event) =>
                        update(field.key, event.target.value)
                      }
                      placeholder="0,00"
                    />

                    <small>{field.description}</small>
                  </label>
                ))}
              </div>

              <div className="plan-actions">
                <button
                  className="plan-button purple"
                  type="button"
                  onClick={save}
                >
                  Salvar valores realizados
                </button>
              </div>
            </section>
          </div>

          {message && (
            <p
              className={`plan-status ${messageType}`}
              role="status"
              aria-live="polite"
            >
              {message}
            </p>
          )}

          <section className="plan-panel plan-result">
            <h2>Resultado do mês</h2>

            <p className="plan-muted">
              Resumo dos valores realizados em {monthLabel(month)}.
            </p>

            <div className="plan-result-grid">
              <div className="plan-result-item">
                <span>Renda recebida</span>
                <strong className="plan-blue">
                  {money(totals.actualIncome)}
                </strong>
              </div>

              <div className="plan-result-item">
                <span>Despesas realizadas</span>
                <strong className="plan-orange">
                  {money(totals.actualExpenses)}
                </strong>
              </div>

              <div className="plan-result-item">
                <span>Dívidas pagas</span>
                <strong className="plan-purple">
                  {money(totals.actualDebt)}
                </strong>
              </div>

              <div className="plan-result-item">
                <span>Saldo realizado</span>
                <strong className={totals.actualBalance < 0 ? "plan-red" : "plan-green"}>
                  {money(totals.actualBalance)}
                </strong>
              </div>
            </div>

            <div className="plan-progress">
              <div className="plan-progress-head">
                <span>Renda comprometida com gastos e dívidas</span>
                <strong>{Math.round(totals.totalCommitted)}%</strong>
              </div>

              <div
                className="plan-progress-track"
                role="progressbar"
                aria-label="Renda comprometida com gastos e dívidas"
                aria-valuenow={Math.round(progressValue)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="plan-progress-fill"
                  style={{
                    width: `${progressValue}%`,
                    background:
                      totals.totalCommitted >= 100
                        ? "#dc2626"
                        : totals.totalCommitted >= 80
                          ? "#d97706"
                          : "#159477",
                  }}
                />
              </div>

              <p className="plan-muted">
                Considera os gastos essenciais, outros gastos previstos
                e a meta de pagamento de dívidas.
              </p>
            </div>

            <div className="plan-progress">
              <div className="plan-progress-head">
                <span>
                  Meta de pagamento de dívidas em relação à renda
                </span>
                <strong>{Math.round(totals.debtCommitted)}%</strong>
              </div>

              <div
                className="plan-progress-track"
                role="progressbar"
                aria-label="Meta de pagamento de dívidas em relação à renda"
                aria-valuenow={Math.round(Math.min(100, totals.debtCommitted))}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="plan-progress-fill"
                  style={{
                    width: `${Math.min(100, totals.debtCommitted)}%`,
                    background: "#7c3aed",
                  }}
                />
              </div>
            </div>

            <div className="plan-difference">
              <span>
                Diferença entre saldo realizado e saldo planejado
              </span>

              <strong className={totals.difference < 0 ? "plan-red" : "plan-green"}>
                {totals.difference > 0 ? "+" : ""}
                {money(totals.difference)}
              </strong>
            </div>

            <p className="plan-muted">
              O saldo planejado considera renda prevista, gastos previstos
              e a meta de pagamento de dívidas. O saldo realizado considera
              renda recebida, despesas realizadas e dívidas efetivamente pagas.
            </p>
          </section>

          <section className="plan-panel" style={{ marginTop: 16 }}>
            <h2>Relatório do período</h2>

            <p className="plan-muted">
              Exporte os valores planejados e realizados do mês selecionado
              para guardar ou analisar em uma planilha.
            </p>

            <div className="plan-actions">
              <button className="plan-button" type="button" onClick={exportCsv}>
                Exportar relatório CSV
              </button>

              <button
                className="plan-button secondary"
                type="button"
                onClick={restoreExamples}
              >
                Restaurar exemplos iniciais
              </button>
            </div>
          </section>

          <footer className="plan-footer">
            <strong>Resgata+ · Planejamento & Relatórios</strong>
            <br />
            Demonstração independente · Dados fictícios e temporários.
            <br />
            Seus dados não são enviados ao Supabase nem alteram sua carteira real.
            <br />
            Ao sair ou atualizar a página, os valores da demonstração serão reiniciados.
          </footer>
        </div>
      </main>
    </>
  );
}
