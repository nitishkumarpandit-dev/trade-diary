import { getTrades } from "@/lib/actions/trades";
import { getStrategies } from "@/lib/actions/strategies";
import TradesClient from "./TradesClient";

export default async function TradesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const page = typeof sp.page === "string" ? parseInt(sp.page) : 1;
  const symbol = typeof sp.symbol === "string" ? sp.symbol : undefined;
  const status =
    typeof sp.status === "string"
      ? (sp.status as "OPEN" | "CLOSED")
      : undefined;
  const strategy = typeof sp.strategy === "string" ? sp.strategy : undefined;

  const [tradesData, strategies] = await Promise.all([
    getTrades({
      page,
      limit: 10,
      symbol,
      status,
      strategy,
    }),
    getStrategies(),
  ]);

  return (
    <TradesClient
      initialTrades={tradesData.trades}
      strategies={strategies}
      metadata={tradesData.metadata}
    />
  );
}
