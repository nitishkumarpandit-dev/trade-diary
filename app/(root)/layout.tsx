import DashboardWrapper from "@/components/shared/DashboardWrapper";
import { TradeProvider } from "@/context/TradeContext";
import { auth } from "@/lib/auth";
import { getUserSettings } from "@/lib/actions/settings";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user ? await getUserSettings() : undefined;

  return (
    <TradeProvider>
      <DashboardWrapper user={user || session?.user}>{children}</DashboardWrapper>
    </TradeProvider>
  );
}
