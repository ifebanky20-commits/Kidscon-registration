"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Check, Download, LoaderCircle, Ticket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import RegistrationTicketPDF from "@/components/pages/registration/components/pdf/RegistrationTicketPDF";

import { readRegistrationReceipt } from "@/components/pages/registration/registrationReceipt";

export default function ConfirmationPage() {
  const [registration] = useState(readRegistrationReceipt);
  const {
    totalStudents = 0,
    schoolName = "",
    registrationId = "",
  } = registration ?? {};

  if (!schoolName || !registrationId) {
    return (
      <section className="mx-auto max-w-xl px-5 py-24 text-center font-display text-brand-ink">
        <Ticket
          size={40}
          strokeWidth={1.5}
          className="mx-auto mb-6 text-brand-primary"
          aria-hidden="true"
        />
        <h1 className="text-3xl font-medium tracking-tight">
          Looking for your registration?
        </h1>
        <p className="mt-4 text-sm leading-7 text-brand-muted">
          Your confirmation appears here after you register your school for an
          event.
        </p>
        <Link
          href="/events"
          className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-brand-action px-6 text-sm font-medium text-white hover:bg-brand-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
        >
          Browse events
        </Link>
      </section>
    );
  }

  return (
    <div className="font-display text-brand-ink">
      <header className="bg-brand-wash px-5 py-12 text-center sm:py-16">
        <span className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-brand-action text-white">
          <Check size={28} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-brand-primary">
          Registration complete
        </p>
        <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
          You’re on the list.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-brand-muted">
          We look forward to welcoming {schoolName}. Download your ticket and
          keep it handy for the event.
        </p>
      </header>
      <section
        aria-labelledby="ticket-heading"
        className="mx-auto grid max-w-4xl gap-8 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-[1.2fr_1fr] md:gap-12"
      >
        <div className="min-w-0 rounded-2xl border border-brand-line bg-brand-surface p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-dashed border-brand-line pb-6">
            <h2
              id="ticket-heading"
              className="text-lg font-medium tracking-tight"
            >
              Your registration
            </h2>
            <Ticket
              size={24}
              className="text-brand-primary"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
          <dl className="space-y-6">
            <div>
              <dt className="text-xs text-brand-muted">School</dt>
              <dd className="mt-2 break-words font-medium">{schoolName}</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted">Students registered</dt>
              <dd className="mt-2 text-3xl font-medium text-brand-primary">
                {totalStudents}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted">
                Registration reference
              </dt>
              <dd className="mt-2 break-all font-mono text-xs leading-6">
                {registrationId}
              </dd>
            </div>
          </dl>
        </div>
        <div className="self-center">
          <h2 className="text-2xl font-medium tracking-tight">
            Ready for the day.
          </h2>
          <p className="mt-4 text-sm leading-7 text-brand-muted">
            Save a copy of your PDF ticket. It includes your registration
            details and QR code for check-in.
          </p>
          <PDFDownloadLink
            document={
              <RegistrationTicketPDF
                schoolName={schoolName}
                totalStudents={totalStudents}
                registrationId={registrationId}
              />
            }
            fileName={`KIDSCON_Ticket_${schoolName.replace(/\s+/g, "_")}.pdf`}
            className="mt-6 flex min-h-12 items-center justify-center gap-3 rounded-xl bg-brand-action px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
          >
            {({ loading, error }) =>
              error ? (
                "Ticket unavailable — please refresh to retry"
              ) : loading ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="motion-safe:animate-spin"
                    aria-hidden="true"
                  />{" "}
                  Preparing ticket…
                </>
              ) : (
                <>
                  <Download size={18} aria-hidden="true" /> Download PDF ticket
                </>
              )
            }
          </PDFDownloadLink>
          <Link
            href="/events"
            className="mt-4 flex min-h-12 items-center justify-center rounded-xl border border-brand-line px-5 text-sm font-medium hover:bg-brand-wash focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
          >
            Explore more events
          </Link>
        </div>
      </section>
    </div>
  );
}
