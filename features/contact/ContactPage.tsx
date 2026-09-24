import ContactForm from "@/features/contact/ContactForm";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <section className="mx-auto grid w-full max-w-2xl gap-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Admission Enquiry
          </h1>
          <p className="text-muted-foreground">
            Share your details and the counselling team will follow up.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm sm:p-6">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
