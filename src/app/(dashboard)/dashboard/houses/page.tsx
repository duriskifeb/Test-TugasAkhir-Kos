"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building,
  Building2,
  PlusCircle,
  Check,
  CheckCircle,
  CheckCircle2,
  Clock,
  Loader2,
  ArrowLeft,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { setupBoardingHouse } from "@/app/(dashboard)/dashboard/actions";
import { createClient } from "@/lib/supabase/client";
import { StepDataKos } from "@/components/dashboard/onboarding/StepDataKos";
import { StepKamar } from "@/components/dashboard/onboarding/StepKamar";
import { StepFotoFasilitas } from "@/components/dashboard/onboarding/StepFotoFasilitas";
import { removeSkuDocument, uploadSkuDocument } from "@/lib/sku-document";
import {
  buildPayload,
  initialForm,
  stepTitles,
  validateStep,
  type Errors,
  type WizardForm,
} from "@/components/dashboard/onboarding/types";
import { getOwnerTenants, type TenantSummary } from "./actions";

const LAST_STEP = stepTitles.length - 1;

export default function DaftarKosCabangPage() {
  const router = useRouter();

  // State untuk data cabang yang sudah ada
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);

  // State untuk form tambah cabang (In-Page Wizard)
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardForm>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);

  const bodyRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Ambil daftar cabang kos milik pemilik
  useEffect(() => {
    async function fetchTenants() {
      try {
        const data = await getOwnerTenants();
        setTenants(data);
      } catch (err) {
        console.error("Gagal memuat daftar cabang:", err);
      } finally {
        setLoadingTenants(false);
      }
    }
    fetchTenants();
  }, []);

  // Pindah langkah pada wizard: gulir ke atas
  useEffect(() => {
    if (!isAddingBranch) return;
    bodyRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus();
  }, [step, isAddingBranch]);

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
    requestAnimationFrame(() => {
      const target = bodyRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]');
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      if (target && "focus" in target && target.matches("input, select, textarea")) {
        target.focus({ preventScroll: true });
      }
    });
  };

  const next = () => {
    const errs = validateStep(form, step);
    if (Object.keys(errs).length) return showErrors(errs);
    setErrors({});
    setStep((s) => Math.min(s + 1, LAST_STEP));
  };

  const handleCancel = () => {
    setIsAddingBranch(false);
    setStep(0);
    setForm(initialForm);
    setErrors({});
    setSubmitError(null);
    setSavedName(null);
  };

  const handleFinish = async () => {
    handleCancel();
    setLoadingTenants(true);
    const data = await getOwnerTenants();
    setTenants(data);
    setLoadingTenants(false);
    router.refresh();
  };

  const submit = async () => {
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
    let uploadedSkuDocument: string | null = null;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi Anda berakhir. Silakan masuk lagi.");

      const skuFile = form.skuDocument;
      if (!skuFile) throw new Error("Bukti SKU wajib diunggah.");
      setProgress("Mengunggah bukti SKU...");
      uploadedSkuDocument = await uploadSkuDocument(supabase, user.id, skuFile);

      const files = [...form.photos.building, ...form.photos.common, ...form.photos.street];
      const urls: string[] = [];

      if (files.length) {
        for (const [i, file] of files.entries()) {
          setProgress(`Mengunggah foto ${i + 1} dari ${files.length}...`);
          const path = `${user.id}/onboarding/${crypto.randomUUID()}.jpg`;
          const { error } = await supabase.storage.from("tenant-assets").upload(path, file, { contentType: "image/jpeg" });
          if (error) throw new Error(`Foto ${file.name} gagal diunggah: ${error.message}`);
          uploaded.push(path);
          urls.push(supabase.storage.from("tenant-assets").getPublicUrl(path).data.publicUrl);
        }
      }

      setProgress("Menyimpan data cabang kos...");
      const result = await setupBoardingHouse(buildPayload(form, urls, uploadedSkuDocument));

      if (result.error) {
        if (uploaded.length) await supabase.storage.from("tenant-assets").remove(uploaded);
        if (uploadedSkuDocument) await removeSkuDocument(supabase, uploadedSkuDocument);
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
      if (uploadedSkuDocument) void removeSkuDocument(supabase, uploadedSkuDocument);
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
      setProgress(null);
    }
  };

  // -------------------------------------------------------------
  // TAMPILAN 1: SUKSES PENDAFTARAN CABANG (IN-PAGE)
  // -------------------------------------------------------------
  if (savedName) {
    return (
      <div className="p-6 sm:p-8 max-w-2xl mx-auto">
        <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 text-center shadow-sm">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-50 text-green-700 mb-5">
            <CheckCircle2 className="size-8" />
          </span>
          <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900">
            Pendaftaran Cabang Berhasil Dikirim
          </h2>
          <p className="mt-2 text-gray-700">
            Cabang kos &quot;{savedName}&quot; sudah berhasil didaftarkan dan datanya telah dikirim ke sistem.
          </p>

          <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-left">
            <Clock className="mt-0.5 size-5 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-bold text-amber-900">Menunggu konfirmasi admin</p>
              <p className="mt-1 text-sm text-amber-900">
                Mohon tunggu. Admin Super akan memeriksa dan memverifikasi data cabang kos Anda.
                Setelah dikonfirmasi, cabang kos akan aktif dan bisa langsung Anda kelola.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="btn btn-primary btn-lg mt-6 w-full sm:w-auto px-8"
          >
            Kembali ke Manajemen Cabang
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TAMPILAN 2: FORM WIZARD CABANG BARU (IN-PAGE)
  // -------------------------------------------------------------
  if (isAddingBranch) {
    const StepView = [StepDataKos, StepKamar, StepFotoFasilitas][step];

    return (
      <div className="p-4 sm:p-8 max-w-3xl mx-auto">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Header Wizard In-Page */}
          <div className="border-b border-gray-200 bg-primary-soft p-5 sm:p-8">
            <div className="mb-4">
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 inline-flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Batal / Kembali ke Daftar Cabang
              </button>
            </div>

            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                <Building2 className="size-6" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900">
                  Daftarkan Cabang Kos Baru
                </h2>
                <p className="mt-0.5 text-sm text-gray-700">
                  Lengkapi informasi cabang kos baru Anda. Data ini bisa diubah lagi nanti.
                </p>
              </div>
            </div>

            {/* Stepper Indikator */}
            <ol aria-label="Langkah pendaftaran cabang" className="mt-6 flex items-center gap-2">
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

          {/* Body Form Wizard */}
          <div ref={bodyRef} className="p-5 sm:p-8">
            <h3 ref={headingRef} tabIndex={-1} className="mb-5 font-display text-xl font-bold tracking-tight text-gray-900 outline-none">
              {stepTitles[step]}
            </h3>

            {submitError && (
              <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                {submitError}
              </div>
            )}

            <form
              id="branch-wizard-form"
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

          {/* Footer Wizard Controls */}
          <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p aria-live="polite" className="text-sm text-gray-600 sm:order-2 sm:ml-auto sm:mr-4">
              {progress}
            </p>
            <div className="flex gap-3 sm:order-3">
              <button
                type="button"
                onClick={step === 0 ? handleCancel : () => setStep((s) => s - 1)}
                disabled={submitting}
                className="btn btn-secondary btn-lg flex-1 sm:flex-none"
              >
                {step === 0 ? "Batal" : "Kembali"}
              </button>
              <button
                type="submit"
                form="branch-wizard-form"
                disabled={submitting}
                className="btn btn-primary btn-lg flex-1 sm:flex-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Memproses...
                  </>
                ) : step < LAST_STEP ? (
                  "Lanjut"
                ) : (
                  "Daftarkan Cabang Kos"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TAMPILAN 3: HALAMAN UTAMA /dashboard/houses
  // -------------------------------------------------------------
  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-6 h-6 text-primary" /> Daftarkan Kos Cabang Baru
          </h1>
          <p className="text-gray-500 mt-1">
            Tambahkan cabang baru untuk memperluas pengelolaan properti kos Anda.
          </p>
        </div>
        <button
          onClick={() => setIsAddingBranch(true)}
          className="btn btn-primary inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          Tambahkan Cabang Baru
        </button>
      </div>

      {/* Konten Cabang Kos */}
      {loadingTenants ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
          Memuat data cabang kos...
        </div>
      ) : tenants.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Daftar Properti & Cabang Kos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenants.map((tenant, idx) => (
              <div
                key={tenant.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary font-bold text-sm">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base leading-tight">
                          {tenant.name}
                        </h3>
                        {idx === 0 && (
                          <span className="text-[11px] font-medium text-primary">Properti Utama</span>
                        )}
                      </div>
                    </div>

                    {tenant.status === "VERIFIED" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle className="w-3 h-3" /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" /> Menunggu Verifikasi
                      </span>
                    )}
                  </div>

                  {tenant.address && (
                    <div className="flex items-start gap-1.5 text-xs text-gray-500 mt-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-400" />
                      <span className="line-clamp-2">{tenant.address}</span>
                    </div>
                  )}

                  {tenant.subdomain && (
                    <div className="mt-2 text-xs font-medium text-primary/80">
                      Link: /kos/{tenant.subdomain}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    Terdaftar:{" "}
                    {new Date(tenant.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {tenant.status === "VERIFIED" ? (
                    <button
                      type="button"
                      onClick={() => {
                        document.cookie = `active_tenant_id=${tenant.id}; path=/`;
                        router.push("/dashboard");
                        router.refresh();
                      }}
                      className="text-primary hover:text-primary-hover font-medium inline-flex items-center gap-1"
                    >
                      Buka di Dashboard <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-amber-600 font-medium text-[11px]">
                      Dalam antrean verifikasi
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Building className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Belum Ada Cabang Kos</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Anda dapat mendaftarkan cabang baru untuk properti kos Anda dengan menekan tombol di bawah.
            </p>
          </div>
          <button
            onClick={() => setIsAddingBranch(true)}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Tambahkan Cabang Baru
          </button>
        </div>
      )}
    </div>
  );
}
