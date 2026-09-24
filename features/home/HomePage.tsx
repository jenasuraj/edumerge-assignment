import Link from "next/link";
import { ArrowRight, LogIn, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground">
          <MessageSquareText className="size-4" />
          Admission enquiry to admission
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Admission Lead Management
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground">
            Manage enquiries, counselling and admissions efficiently.
          </p>
        </div>

        <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <Button asChild className="h-11 flex-1">
            <Link href="/contact">
              <MessageSquareText className="size-4" />
              Contact / Admission Enquiry
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 flex-1">
            <Link href="/login">
              <LogIn className="size-4" />
              Admin / Counsellor Login
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
