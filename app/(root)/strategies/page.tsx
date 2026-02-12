import { getStrategies } from "@/lib/actions/strategies";
import StrategiesClient from "./StrategiesClient";

export default async function StrategiesPage() {
  const strategies = await getStrategies();
  return <StrategiesClient initialStrategies={strategies} />;
}
