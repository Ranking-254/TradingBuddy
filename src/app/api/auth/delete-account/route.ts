import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Delete all accounts and cascading trades/reports in Prisma
    await prisma.account.deleteMany({
      where: { userId: user.id },
    });

    // 2. Delete user from Supabase auth.users using Service Role key
    const adminAuthClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { error: deleteError } = await adminAuthClient.auth.admin.deleteUser(
      user.id,
    );
    if (deleteError) {
      console.warn(
        "Could not delete from auth.users via admin API:",
        deleteError.message,
      );
    }

    // Sign out session
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete account" },
      { status: 500 },
    );
  }
}
