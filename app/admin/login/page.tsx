import { signIn, auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/admin");

  return (
    <div className="min-h-[100svh] flex items-center justify-center px-6">
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/admin" });
        }}
        className="max-w-sm w-full text-center"
      >
        <div className="eyebrow mb-4">Manager Access</div>
        <h1 className="font-serif text-4xl font-light mb-2">Villa <em className="text-[var(--amber)]">Cottages</em></h1>
        <p className="text-sm text-cream/55 mb-10">Sign in to manage availability across all three huts.</p>
        <button className="w-full py-3.5 border border-[var(--amber)]/35 text-[0.65rem] tracking-[0.22em] uppercase text-[var(--amber)] hover:bg-[var(--amber)] hover:text-[#080705] transition-colors">
          Continue with Google
        </button>
        <p className="text-[0.6rem] text-cream/30 mt-6">Only emails on the allowlist can sign in.</p>
      </form>
    </div>
  );
}
