"use client";

import { useState, type FormEvent } from "react";
import { logica } from "@neup/logica";

interface PropertyInquiryFormProps {
  slug: string;
}

// Submit a viewing request for the current property through Logica.
export default function PropertyInquiryForm({ slug }: PropertyInquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Send the validated contact fields and property slug to the estate inquiry module.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);
    setMessage("");
    setIsSuccess(false);

    const formData = new FormData(form);
    try {
      const response = await logica.estate.inquiry.create({
        slug,
        name: String(formData.get("name") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        message: String(formData.get("message") ?? "").trim(),
      });

      console.info("[property-inquiry] Logica inquiry API response", {
        ok: response.ok,
        status: response.status,
        body: response.body,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        setMessage("We couldn’t send your request. Please try again.");
        return;
      }

      setIsSuccess(true);
      setMessage("Your viewing request has been sent. Our team will contact you soon.");
      form.reset();
    } catch (error) {
      const details = error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { value: error };
      console.warn("[property-inquiry] Inquiry API threw an error", details);
      setMessage("We couldn’t send your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="inquiry-name" className="mb-2 block text-xs font-medium uppercase tracking-wider text-charcoal">Full Name</label>
        <input id="inquiry-name" name="name" type="text" required autoComplete="name" className="w-full rounded border border-platinum bg-platinum/30 px-4 py-3 text-sm transition-colors focus:border-russian-purple focus:outline-none" placeholder="John Doe" />
      </div>
      <div>
        <label htmlFor="inquiry-phone" className="mb-2 block text-xs font-medium uppercase tracking-wider text-charcoal">Phone Number</label>
        <input id="inquiry-phone" name="phone" type="tel" required autoComplete="tel" className="w-full rounded border border-platinum bg-platinum/30 px-4 py-3 text-sm transition-colors focus:border-russian-purple focus:outline-none" placeholder="+977 984 0518336" />
      </div>
      <div>
        <label htmlFor="inquiry-message" className="mb-2 block text-xs font-medium uppercase tracking-wider text-charcoal">Message</label>
        <textarea id="inquiry-message" name="message" required className="h-24 w-full resize-none rounded border border-platinum bg-platinum/30 px-4 py-3 text-sm transition-colors focus:border-russian-purple focus:outline-none" placeholder="I would like to view this property..." />
      </div>
      <button type="submit" disabled={isSubmitting} className="mt-2 w-full rounded-xl bg-russian-purple px-6 py-3.5 font-semibold text-white shadow-lg shadow-russian-purple/20 transition hover:bg-[#251138] disabled:cursor-wait disabled:opacity-60">
        {isSubmitting ? "Sending request…" : "Request a viewing"}
      </button>
      {message && <p role={isSuccess ? "status" : "alert"} className={`text-sm ${isSuccess ? "text-green-700" : "text-red-700"}`}>{message}</p>}
    </form>
  );
}
