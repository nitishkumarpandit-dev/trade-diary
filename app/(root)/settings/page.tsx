import { auth } from "@/lib/auth";
import { getUserSettings } from "@/lib/actions/settings";
import { getStrategies } from "@/lib/actions/strategies";
import type { IStrategy } from "@/types";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const user = await getUserSettings();
  const strategies = await getStrategies();
  return (
    <SettingsClient
      user={user}
      strategies={strategies.map((s: Pick<IStrategy, "_id" | "name">) => ({
        _id: s._id as unknown as string,
        name: s.name,
      }))}
    />
  );
}
