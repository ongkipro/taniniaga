import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Globe, Layout, RefreshCw, Shield, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

interface StorefrontTemplate {
  id: string;
  name: string;
}

interface StoreSettingsData {
  store_name?: string;
  support_whatsapp?: string;
  site_url?: string;
  store_tagline?: string;
  store_description?: string;
  store_logo?: string;
  storefront_template?: string;
}
interface StoreData {
  storefront_templates: StorefrontTemplate[];
  storefront_templates_available: boolean;
}

export default function StoreSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<StoreData | null>(null);

  // Forms states
  const [store, setStore] = useState<StoreSettingsData>({});
  const [embedOrigins, setEmbedOrigins] = useState("");
  const [templateDefinition, setTemplateDefinition] = useState({
    id: "",
    name: "",
    layout: "compact",
    hero: true,
    proofs: true,
  });

  // Pending states
  const [storePending, setStorePending] = useState(false);
  const [embedPending, setEmbedPending] = useState(false);
  const [templatePending, setTemplatePending] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/settings", {
        headers: { Accept: "application/json" },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Gagal memuat profil store.");
      }
      
      const storeData = payload.data?.store || {};

      setData({
        storefront_templates: storeData.storefront_templates || [],
        storefront_templates_available: storeData.storefront_templates_available !== false,
      });

      setStore({
        store_name: storeData.name || "",
        support_whatsapp: storeData.support_whatsapp || "",
        site_url: storeData.site_url || "",
        store_tagline: storeData.tagline || "",
        store_description: storeData.description || "",
        store_logo: storeData.logo || "",
        storefront_template: storeData.storefront_template || "compact-market",
      });

      setEmbedOrigins(
        Array.isArray(storeData.embed_allowed_origins)
          ? storeData.embed_allowed_origins.join("\n")
          : ""
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat profil store.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSaveStore = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (storePending) return;
    setStorePending(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-store",
          ...store,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Gagal menyimpan profil store.");
      }
      toast.success(payload.message || "Profil store tersimpan.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan profil store.");
    } finally {
      setStorePending(false);
    }
  };

  const handleAddTemplate = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (templatePending || !data?.storefront_templates_available) return;
    setTemplatePending(true);
    const definition = {
      id: templateDefinition.id,
      name: templateDefinition.name,
      composition: {
        layout: templateDefinition.layout,
        sections: {
          hero: templateDefinition.hero,
          catalog: true, // Always true per legacy logic
          proofs: templateDefinition.proofs,
        },
      },
    };
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add-storefront-template",
          storefront_template_definition: definition,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Gagal menambahkan template.");
      }
      
      // Update templates list and clear form
      setData((prev) => prev ? { ...prev, storefront_templates: payload.data?.storefront_templates || prev.storefront_templates } : null);
      setTemplateDefinition((prev) => ({ ...prev, id: "", name: "" }));
      toast.success("Template ditambahkan. Simpan profil store untuk memilihnya.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambahkan template.");
    } finally {
      setTemplatePending(false);
    }
  };

  const handleSaveEmbed = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (embedPending) return;
    const origins = embedOrigins
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);
      
    setEmbedPending(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-embed-origins",
          embed_allowed_origins: origins,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Gagal menyimpan daftar origin embed.");
      }
      if (Array.isArray(payload.data?.embed_allowed_origins)) {
        setEmbedOrigins(payload.data.embed_allowed_origins.join("\n"));
      }
      toast.success(payload.message || "Daftar origin embed tersimpan.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan daftar origin embed.");
    } finally {
      setEmbedPending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-live="polite" aria-busy="true">
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800" role="alert" aria-live="assertive">
        <Shield className="mx-auto mb-2 size-8 opacity-50" />
        <h3 className="font-bold">Gagal memuat</h3>
        <p className="mt-1 text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={() => void load()} className="mt-4 bg-white text-rose-800 hover:bg-rose-50 hover:text-rose-900 border-rose-200">
          <RefreshCw className="mr-2 size-4" />
          Coba lagi
        </Button>
      </div>
    );
  }

  const templates = data?.storefront_templates || [];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSaveStore} aria-busy={storePending}>
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Store className="size-5 text-muted-foreground" />
              <div>
                <CardTitle as="h2">Profil Store</CardTitle>
                <CardDescription>Informasi merchant dan kontak yang dipakai dalam komunikasi pelanggan.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 pt-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="store_name" className="text-sm font-semibold">Nama store</label>
              <Input
                id="store_name"
                required
                maxLength={120}
                autoComplete="organization"
                value={store.store_name || ""}
                onChange={(e) => setStore({ ...store, store_name: e.target.value })}
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="support_whatsapp" className="text-sm font-semibold">WhatsApp customer service</label>
              <Input
                id="support_whatsapp"
                required
                inputMode="tel"
                maxLength={16}
                autoComplete="tel"
                placeholder="081234567890"
                className="font-mono"
                value={store.support_whatsapp || ""}
                onChange={(e) => setStore({ ...store, support_whatsapp: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Gunakan 9–15 digit; awalan + diperbolehkan.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="site_url" className="text-sm font-semibold">Alamat storefront</label>
              <Input
                id="site_url"
                inputMode="url"
                maxLength={200}
                placeholder="https://tokosaya.com"
                value={store.site_url || ""}
                onChange={(e) => setStore({ ...store, site_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Harus https. Dipakai untuk canonical, sitemap, dan feed katalog.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="store_tagline" className="text-sm font-semibold">Tagline</label>
              <Input
                id="store_tagline"
                maxLength={120}
                value={store.store_tagline || ""}
                onChange={(e) => setStore({ ...store, store_tagline: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Muncul di judul halaman dan header storefront.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="store_description" className="text-sm font-semibold">Deskripsi</label>
              <Input
                id="store_description"
                maxLength={300}
                value={store.store_description || ""}
                onChange={(e) => setStore({ ...store, store_description: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Meta description bawaan dan teks Open Graph.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="store_logo" className="text-sm font-semibold">Logo</label>
              <Input
                id="store_logo"
                maxLength={300}
                placeholder="/images/adsbook-mark.webp"
                value={store.store_logo || ""}
                onChange={(e) => setStore({ ...store, store_logo: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Kosongkan untuk memakai logo bawaan AdsBookCMS.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="storefront_template" className="text-sm font-semibold">Tampilan storefront</label>
              <Select 
                value={store.storefront_template || "compact-market"} 
                onValueChange={(val) => setStore({ ...store, storefront_template: val || "compact-market" })}
              >
                <SelectTrigger id="storefront_template">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                  {store.storefront_template && !templates.some(t => t.id === store.storefront_template) && (
                    <SelectItem value={store.storefront_template} disabled>Template tidak valid ({store.storefront_template})</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Berlaku langsung tanpa build ulang.</p>
            </div>
          </CardContent>
          <CardFooter className="justify-end bg-slate-50/50">
            <Button type="submit" disabled={storePending} className="w-full sm:w-auto">
              {storePending && <RefreshCw className="mr-2 size-4 animate-spin" />}
              {storePending ? "Menyimpan..." : "Simpan profil store"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <form onSubmit={handleAddTemplate} aria-busy={templatePending}>
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Layout className="size-5 text-muted-foreground" />
              <div>
                <CardTitle as="h3">Tambah template storefront</CardTitle>
                <CardDescription>Susun template dari bagian yang tersedia. Konfigurasi tersimpan tidak dapat menjalankan HTML atau JavaScript.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 pt-6 md:grid-cols-2">
            {!data?.storefront_templates_available && (
               <div className="col-span-full mb-2 rounded-md bg-rose-50 p-3 text-sm font-medium text-rose-800">
                 Penyimpanan template belum tersedia. Jalankan migrasi database terbaru.
               </div>
            )}
            
            <div className="space-y-1.5">
              <label htmlFor="template_id" className="text-sm font-semibold">ID template</label>
              <Input
                id="template_id"
                required
                minLength={2}
                maxLength={40}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                placeholder="katalog-ringkas"
                className="font-mono"
                value={templateDefinition.id}
                onChange={(e) => setTemplateDefinition({ ...templateDefinition, id: e.target.value })}
                disabled={!data?.storefront_templates_available}
              />
              <p className="text-xs text-muted-foreground">Huruf kecil, angka, dan tanda hubung.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="template_name" className="text-sm font-semibold">Nama template</label>
              <Input
                id="template_name"
                required
                minLength={2}
                maxLength={80}
                placeholder="Katalog Ringkas"
                value={templateDefinition.name}
                onChange={(e) => setTemplateDefinition({ ...templateDefinition, name: e.target.value })}
                disabled={!data?.storefront_templates_available}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="template_layout" className="text-sm font-semibold">Layout</label>
              <Select 
                value={templateDefinition.layout} 
                onValueChange={(val) => {
                  setTemplateDefinition(prev => ({ 
                    ...prev, 
                    layout: val || "compact", 
                    proofs: (val || "compact") === "wide" ? false : prev.proofs 
                  }));
                }}
                disabled={!data?.storefront_templates_available}
              >
                <SelectTrigger id="template_layout">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="wide">Wide</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold">Bagian halaman</legend>
              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-sm font-medium leading-none">
                  <Checkbox 
                    checked={templateDefinition.hero} 
                    onCheckedChange={(c) => setTemplateDefinition({ ...templateDefinition, hero: !!c })} 
                    disabled={!data?.storefront_templates_available}
                  />
                  Hero
                </label>
                <label className="flex items-center gap-2 text-sm font-medium leading-none opacity-60">
                  <Checkbox checked disabled />
                  Katalog
                </label>
                <label className="flex items-center gap-2 text-sm font-medium leading-none">
                  <Checkbox 
                    checked={templateDefinition.proofs} 
                    onCheckedChange={(c) => setTemplateDefinition({ ...templateDefinition, proofs: !!c })}
                    disabled={templateDefinition.layout === "wide" || !data?.storefront_templates_available}
                  />
                  Bukti sosial
                </label>
              </div>
            </fieldset>
          </CardContent>
          <CardFooter className="justify-end bg-slate-50/50">
            <Button 
              type="submit" 
              variant="secondary"
              disabled={templatePending || !data?.storefront_templates_available} 
              className="w-full sm:w-auto"
            >
              {templatePending && <RefreshCw className="mr-2 size-4 animate-spin" />}
              {templatePending ? "Menambahkan..." : "Tambah template"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <form onSubmit={handleSaveEmbed} aria-busy={embedPending}>
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Globe className="size-5 text-muted-foreground" />
              <div>
                <CardTitle as="h3">Domain untuk embed checkout</CardTitle>
                <CardDescription>Tentukan situs eksternal yang boleh menampilkan checkout AdsBookCMS di dalam iframe.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-1.5">
              <label htmlFor="embedAllowedOrigins" className="text-sm font-semibold">Origin HTTPS yang diizinkan</label>
              <Textarea
                id="embedAllowedOrigins"
                rows={5}
                maxLength={7524}
                spellCheck={false}
                aria-describedby="embedOriginsHelp"
                placeholder="https://toko.example&#10;https://promo.toko.example:8443"
                className="font-mono"
                value={embedOrigins}
                onChange={(e) => setEmbedOrigins(e.target.value)}
              />
              <p id="embedOriginsHelp" className="mt-2 text-xs leading-5 text-muted-foreground">
                Satu origin per baris, maksimal 25. Wajib memakai <code>https://</code> dan hanya boleh berisi domain atau subdomain serta port opsional. Domain dan subdomain berbeda, jadi daftarkan keduanya bila diperlukan. Path, query, fragment, kredensial, dan wildcard tidak diterima.
              </p>
            </div>
          </CardContent>
          <CardFooter className="justify-end bg-slate-50/50">
            <Button type="submit" variant="secondary" disabled={embedPending} className="w-full sm:w-auto">
              {embedPending && <RefreshCw className="mr-2 size-4 animate-spin" />}
              {embedPending ? "Menyimpan..." : "Simpan domain embed"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
