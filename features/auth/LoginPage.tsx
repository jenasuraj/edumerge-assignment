import LoginForm from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <section className="w-full max-w-sm rounded-lg border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin / Counsellor Login
          </h1>
          <p className="text-sm text-muted-foreground">
            Use your registered email and password.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
