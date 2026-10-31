"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, Loader2 } from "lucide-react";
import { setupBoardingHouse } from "@/app/(dashboard)/dashboard/actions";
import { createClient } from "@/lib/supabase/client";
import { StepDataKos } from "./onboarding/StepDataKos";
import { StepKamar } from "./onboarding/StepKamar";
import { StepFotoFasilitas } from "./onboarding/StepFotoFasilitas";
import { KosSavedDialog } from "./onboarding/KosSavedDialog";
import { buildPayload, initialForm, stepTitles, validateStep, type Errors, type WizardForm } from "./onboarding/types";

const LAST_STEP = stepTitles.length - 1;

/** Wizard tiga langkah untuk mendaftarkan kos pertama: Data Kos, Kamar Kos, lalu Foto & Fasilitas. */
export function OnboardingWizard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardForm>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Nama kos yang baru tersimpan. Selama terisi, yang tampil adalah popup "berhasil disimpan", bukan formulir.
  const [savedName, setSavedName] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Menutup popup berhasil: baru sekarang halaman dimuat ulang. Dashboard lalu menampilkan status menunggu admin.
  // (Dimuat ulang lebih awal akan melepas wizard ini, dan popupnya ikut hilang.)
  const finish = useCallback(() => {
    onClose();
    router.refresh();
  }, [onClose, router]);

  // Escape menutup wizard (atau popup berhasil), kecuali saat data sedang dikirim.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      // Esc yang sudah dipakai komponen di dalam (misalnya menutup saran lokasi) tidak ikut menutup wizard.
      if (e.key !== "Escape" || submitting || e.defaultPrevented) return;
      if (savedName) finish();
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, submitting, savedName, finish, onClose]);

  // Pindah langkah: gulir ke atas dan pindahkan fokus ke judul langkah.
  useEffect(() => {
    if (!isOpen) return;
    bodyRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus();
  }, [step, isOpen]);

  if (!isOpen) return null;

  const set = (patch: Partial<WizardForm>) => {
    setForm((f) => ({ ...f, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  };

  const showErrors = (errs: Errors) => {
    setErrors(errs);
    // Setelah galat tampil, bawa pengguna ke isian pertama yang bermasalah.
    requestAnimationFrame(() => {
      const target = bodyRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]');
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      if (target && "focus" in target && target.matches("input, select, textarea")) target.focus({ preventScroll: true });
    });
  };

  function next() {
    const errs = validateStep(form, step);
    if (Object.keys(errs).length) return showErrors(errs);
    setErrors({});
    setStep((s) => Math.min(s + 1, LAST_STEP));
  }

  async function submit() {
    for (let s = 0; s <= LAST_STEP; s++) {
      const errs = validateStep(form, s);
      if (Object.keys(errs).length) {
        setStep(s);
        return showErrors(errs);
      }
    }

    setSubmitting(true);
    setSubmitError(null);
    const supabase = createClient();
    const uploaded: string[] = [];

    try {
      const files = [...form.photos.building, ...form.photos.common, ...form.photos.street];
      const urls: string[] = [];

      if (files.length) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Sesi Anda berakhir. Silakan masuk lagi.");

        for (const [i, file] of files.entries()) {
          setProgress(`Mengunggah foto ${i + 1} dari ${files.length}...`);
          // Foto sudah digambar ulang menjadi JPEG di langkah 3. Nama berkas dibuat sendiri, bukan dari nama kiriman,
          // dan disimpan di folder milik pengguna (syarat kebijakan penyimpanan).
          const path = `${user.id}/onboarding/${crypto.randomUUID()}.jpg`;
          const { error } = await supabase.storage.from("tenant-assets").upload(path, file, { contentType: "image/jpeg" });
          if (error) throw new Error(`Foto ${file.name} gagal diunggah: ${error.message}`);
          uploaded.push(path);
          urls.push(supabase.storage.from("tenant-assets").getPublicUrl(path).data.publicUrl);
        }
      }

      setProgress("Menyimpan data kos...");
      const result = await setupBoardingHouse(buildPayload(form, urls));

      if (result.error) {
        if (uploaded.length) await supabase.storage.from("tenant-assets").remove(uploaded);
        setSubmitError(result.error);
        if (/link website/i.test(result.error)) {
          setStep(0);
          showErrors({ subdomain: result.error });
        }
        return;
      }

      setSavedName(form.name.trim());
    } catch (err) {
      if (uploaded.length) void supabase.storage.from("tenant-assets").remove(uploaded);
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
      setProgress(null);
    }
  }

  if (savedName) return <KosSavedDialog name={savedName} onDone={finish} />;

  const StepView = [StepDataKos, StepKamar, StepFotoFasilitas][step];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/30 p-3 text-left sm:p-6"
    >
      {/* overflow-clip (bukan hidden) agar fokus pada isian tidak menggeser kepala modal ke atas */}
      <div className="relative flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-clip rounded-xl bg-white shadow-pop">
        {/* Kepala: judul dan penanda langkah, tidak ikut digulir */}
        <div className="shrink-0 border-b border-gray-200 bg-primary-soft px-5 py-5 sm:px-8">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <Building2 className="size-6" />
            </span>
            <div>
              <h2 id="onboarding-title" className="font-display text-2xl font-bold tracking-tight text-gray-900">
                Daftarkan Kos Anda
              </h2>
              <p className="mt-0.5 text-sm text-gray-700">Lengkapi informasi kos Anda. Data ini bisa diubah lagi nanti.</p>
            </div>
          </div>

          <ol aria-label="Langkah pendaftaran" className="mt-5 flex items-center gap-2">
            {stepTitles.map((title, i) => {
              const done = i < step;
              const current = i === step;
              return (
                <li key={title} aria-current={current ? "step" : undefined} className="flex flex-1 items-center gap-2 last:flex-none">
                  <span
                    aria-hidden
                    className={`grid size-7 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${
                      done
                        ? "border-primary bg-primary text-white"
                        : current
                          ? "border-primary bg-white text-primary"
                          : "border-gray-300 bg-white text-gray-600"
                    }`}
                  >
                    {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={`text-sm font-semibold ${current ? "text-gray-900" : "hidden text-gray-600 sm:inline"}`}>
                    {title}
                    <span className="sr-only">{done ? " (selesai)" : current ? " (langkah saat ini)" : ""}</span>
                  </span>
                  {i < LAST_STEP && <span aria-hidden className={`h-0.5 flex-1 rounded ${done ? "bg-primary" : "bg-gray-300"}`} />}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Isi langkah: bisa digulir */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          <h3 ref={headingRef} tabIndex={-1} className="mb-5 font-display text-xl font-bold tracking-tight text-gray-900 outline-none">
            {stepTitles[step]}
          </h3>

          {submitError && (
            <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
              {submitError}
            </div>
          )}

          <form
            id="onboarding-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (step < LAST_STEP) next();
              else void submit();
            }}
          >
            <StepView form={form} set={set} errors={errors} />
          </form>
        </div>

        {/* Tombol: tetap di bawah */}
        <div className="flex shrink-0 flex-col gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p aria-live="polite" className="text-sm text-gray-600 sm:order-2 sm:ml-auto sm:mr-4">
            {progress}
          </p>
          <div className="flex gap-3 sm:order-3">
            <button
              type="button"
              onClick={step === 0 ? onClose : () => setStep((s) => s - 1)}
              disabled={submitting}
              className="btn btn-secondary btn-lg flex-1 sm:flex-none"
            >
              {step === 0 ? "Batal" : "Kembali"}
            </button>
            <button type="submit" form="onboarding-form" disabled={submitting} className="btn btn-primary btn-lg flex-1 sm:flex-none">
              {submitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Memproses...
                </>
              ) : step < LAST_STEP ? (
                "Lanjut"
              ) : (
                "Daftarkan Kos"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
