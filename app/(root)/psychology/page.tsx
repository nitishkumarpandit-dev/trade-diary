import {
  getPsychologyInsights,
  getJournalEntries,
  getEmotionalStateVsPnL,
} from "@/lib/actions/psychology";
import PsychologyClient from "./PsychologyClient";

function getDefaultRange() {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 1);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

export default async function PsychologyPage() {
  const dateRange = getDefaultRange();
  const [insights, journals, emotionVsPnl] = await Promise.all([
    getPsychologyInsights(dateRange),
    getJournalEntries({ dateRange, page: 1, limit: 10 }),
    getEmotionalStateVsPnL(),
  ]);

  return (
    <PsychologyClient
      initialDateRange={dateRange}
      initialInsights={insights}
      initialJournals={journals}
      initialEmotionVsPnl={emotionVsPnl}
    />
  );
}
