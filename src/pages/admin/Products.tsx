import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, X, ImageOff, Eye, EyeOff } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { AdminShell } from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/button';
import { ROOM_TYPES, type RoomType } from '@/lib/templates';
import {
  listAllProducts, createProduct, updateProduct, deleteProduct, uploadProductImage,
  PRODUCT_CATEGORIES, type AdminProduct, type ProductInput, type ProductCategory,
} from '@/lib/products';

const emptyForm: ProductInput = {
  name: '', category: 'sofa', brand: '', price: null, currency: 'GBP',
  display_image_url: '', composite_image_url: '', room_types: [], active: true,
};

export default function Products() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminProduct | 'new' | null>(null);
  const [confirm, setConfirm] = useState<AdminProduct | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');

  const load = () => listAllProducts().then(setProducts).catch((e) => toast.error((e as Error).message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => (categoryFilter === 'all' ? products : products.filter((p) => p.category === categoryFilter)),
    [products, categoryFilter],
  );

  const toggleActive = async (p: AdminProduct) => {
    try {
      await updateProduct(p.id, { ...p, active: !p.active });
      toast.success(p.active ? 'Hidden from the catalog' : 'Now visible in the catalog');
      load();
    } catch (e) { toast.error((e as Error).message); }
  };

  const remove = async (p: AdminProduct) => {
    try {
      await deleteProduct(p.id);
      setConfirm(null);
      toast.success('Product deleted');
      load();
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <AdminShell>
      <SEO title="Product catalog · Think Decor" description="Manage the real-product catalog used in redesigns." />

      <section className="panel">
        <div className="ph">
          <div className="r">
            <div className="kicker">Catalog</div>
            <h1>Real <em>products</em></h1>
            <p className="sub">
              {products.length} products<span className="sep" />
              {products.filter((p) => p.active).length} visible in Create
            </p>
          </div>
          <div className="actions r" style={{ ['--i' as string]: 1 }}>
            <button type="button" className="btn btn-dark" onClick={() => setEditing('new')}>
              <Plus width={15} height={15} /> Add product
            </button>
          </div>
        </div>

        <div className="toolbar r" style={{ ['--i' as string]: 2 }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | 'all')}
            className="field"
            style={{ height: 40, paddingInline: 12 }}
          >
            <option value="all">All categories</option>
            {PRODUCT_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>

        {loading && (
          <div className="mt-10 flex items-center justify-center gap-3 py-14" style={{ color: 'var(--taupe)' }}>
            <Loader2 className="h-4 w-4 animate-spin" /> Loading products…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="mt-8 rounded-2xl px-6 py-16 text-center" style={{ boxShadow: 'inset 0 0 0 1px var(--stone-2)' }}>
            <p className="text-[14.5px]" style={{ color: 'var(--taupe)' }}>
              {products.length === 0 ? 'No products yet — add the first one.' : 'Nothing in this category.'}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {filtered.map((p) => (
              <div key={p.id} className="box" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="relative aspect-square bg-black/[0.03]">
                  {p.display_image_url ? (
                    <img src={p.display_image_url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center"><ImageOff className="h-6 w-6 opacity-30" /></div>
                  )}
                  {!p.active && (
                    <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-white">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="p-3.5">
                  <p className="truncate text-[13.5px] font-semibold" style={{ color: 'var(--ink)' }}>{p.name}</p>
                  <p className="mt-0.5 text-[12px]" style={{ color: 'var(--taupe)' }}>
                    {PRODUCT_CATEGORIES.find((c) => c.key === p.category)?.label ?? p.category}
                    {p.price != null && ` · ${p.currency} ${p.price}`}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5">
                    <button type="button" className="ico-btn" title="Edit" onClick={() => setEditing(p)}>
                      <Pencil width={13} height={13} />
                    </button>
                    <button type="button" className="ico-btn" title={p.active ? 'Hide' : 'Show'} onClick={() => toggleActive(p)}>
                      {p.active ? <EyeOff width={13} height={13} /> : <Eye width={13} height={13} />}
                    </button>
                    <button type="button" className="ico-btn" title="Delete" onClick={() => setConfirm(p)}>
                      <Trash2 width={13} height={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {editing && (
          <ProductEditor
            product={editing === 'new' ? null : editing}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); load(); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-6 backdrop-blur-sm"
            onClick={() => setConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="admin-x w-full max-w-[400px] rounded-2xl bg-white p-7 shadow-2xl"
            >
              <h3 className="font-display text-[20px]" style={{ color: 'var(--char)' }}>Delete this product?</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed" style={{ color: 'var(--taupe)' }}>
                "{confirm.name}" will be removed from the catalog permanently. Past redesigns that used it are unaffected.
              </p>
              <div className="mt-7 flex gap-3">
                <button type="button" onClick={() => setConfirm(null)} className="btn btn-line flex-1 justify-center">Cancel</button>
                <button type="button" onClick={() => remove(confirm)} className="btn flex-1 justify-center" style={{ background: 'var(--rose)', color: '#fff' }}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminShell>
  );
}

function ProductEditor({
  product, onClose, onSaved,
}: { product: AdminProduct | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<ProductInput>(product ?? emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingDisplay, setUploadingDisplay] = useState(false);
  const [uploadingComposite, setUploadingComposite] = useState(false);
  const [useSameImage, setUseSameImage] = useState(
    product ? product.display_image_url === product.composite_image_url : true,
  );
  const displayInputRef = useRef<HTMLInputElement>(null);
  const compositeInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const pickImage = async (file: File | undefined, which: 'display' | 'composite') => {
    if (!file) return;
    const setUploading = which === 'display' ? setUploadingDisplay : setUploadingComposite;
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      if (which === 'display') {
        set('display_image_url', url);
        if (useSameImage) set('composite_image_url', url);
      } else {
        set('composite_image_url', url);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const toggleRoomType = (rt: RoomType) => {
    set('room_types', form.room_types.includes(rt) ? form.room_types.filter((r) => r !== rt) : [...form.room_types, rt]);
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error('Give it a name.');
    if (!form.display_image_url) return toast.error('Add a photo.');
    const payload: ProductInput = { ...form, composite_image_url: form.composite_image_url || form.display_image_url };
    setSaving(true);
    try {
      if (product) await updateProduct(product.id, payload);
      else await createProduct(payload);
      toast.success(product ? 'Product updated' : 'Product added');
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px]"
      />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className="admin-x fixed right-0 top-0 z-50 flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl"
        style={{ fontFamily: 'var(--body)' }}
      >
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--stone-2)' }}>
          <h2 className="font-display text-[19px]" style={{ color: 'var(--char)' }}>
            {product ? 'Edit product' : 'Add product'}
          </h2>
          <button type="button" onClick={onClose} className="ico-btn"><X width={16} height={16} /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <div>
            <p className="kicker">Photo shown in the catalog</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-20 w-20 flex-none items-center justify-center overflow-hidden rounded-xl bg-black/[0.04]">
                {form.display_image_url
                  ? <img src={form.display_image_url} alt="" className="h-full w-full object-cover" />
                  : <ImageOff className="h-5 w-5 opacity-30" />}
              </div>
              <input ref={displayInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={(e) => pickImage(e.target.files?.[0], 'display')} />
              <Button type="button" variant="outline" onClick={() => displayInputRef.current?.click()} disabled={uploadingDisplay}>
                {uploadingDisplay ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Upload photo
              </Button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--taupe)' }}>
            <input
              type="checkbox"
              checked={useSameImage}
              onChange={(e) => {
                setUseSameImage(e.target.checked);
                if (e.target.checked) set('composite_image_url', form.display_image_url);
              }}
            />
            Use this same photo for AI redesigns
          </label>

          {!useSameImage && (
            <div>
              <p className="kicker">Photo sent to the AI (plain background works best)</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-20 w-20 flex-none items-center justify-center overflow-hidden rounded-xl bg-black/[0.04]">
                  {form.composite_image_url
                    ? <img src={form.composite_image_url} alt="" className="h-full w-full object-cover" />
                    : <ImageOff className="h-5 w-5 opacity-30" />}
                </div>
                <input ref={compositeInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={(e) => pickImage(e.target.files?.[0], 'composite')} />
                <Button type="button" variant="outline" onClick={() => compositeInputRef.current?.click()} disabled={uploadingComposite}>
                  {uploadingComposite ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Upload photo
                </Button>
              </div>
            </div>
          )}

          <div>
            <p className="kicker">Name</p>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Harlow 3-seater sofa, oat boucle"
              className="field mt-2 w-full"
              style={{ height: 44, paddingInline: 14 }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="kicker">Category</p>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value as ProductCategory)}
                className="field mt-2 w-full"
                style={{ height: 44, paddingInline: 12 }}
              >
                {PRODUCT_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <p className="kicker">Brand (optional)</p>
              <input
                value={form.brand ?? ''}
                onChange={(e) => set('brand', e.target.value || null)}
                className="field mt-2 w-full"
                style={{ height: 44, paddingInline: 14 }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="kicker">Price (optional)</p>
              <input
                type="number"
                value={form.price ?? ''}
                onChange={(e) => set('price', e.target.value ? Number(e.target.value) : null)}
                className="field mt-2 w-full"
                style={{ height: 44, paddingInline: 14 }}
              />
            </div>
            <div>
              <p className="kicker">Currency</p>
              <input
                value={form.currency}
                onChange={(e) => set('currency', e.target.value.toUpperCase().slice(0, 3))}
                className="field mt-2 w-full"
                style={{ height: 44, paddingInline: 14 }}
              />
            </div>
          </div>

          <div>
            <p className="kicker">Fits which rooms</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ROOM_TYPES.map((rt) => (
                <button
                  key={rt.key}
                  type="button"
                  onClick={() => toggleRoomType(rt.key)}
                  className="pill"
                  style={form.room_types.includes(rt.key) ? { background: 'var(--char)', color: '#fff', boxShadow: 'none' } : undefined}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--taupe)' }}>
            <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
            Visible in Create's product picker
          </label>
        </div>

        <div className="px-6 py-4" style={{ borderTop: '1px solid var(--stone-2)' }}>
          <Button onClick={save} disabled={saving} variant="hero" className="h-auto w-full rounded-full px-5 py-3 text-[14px]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {product ? 'Save changes' : 'Add product'}
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
