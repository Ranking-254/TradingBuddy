import { createClient } from "@/lib/supabase/server";
import { LandingView } from "@/components/landing/LandingView";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If visitor is not logged in, show the Landing Homepage
  if (!user) {
    return <LandingView />;
  }

  // If user is logged in, show their personal Command Center Dashboard
  return <DashboardContent />;
}
