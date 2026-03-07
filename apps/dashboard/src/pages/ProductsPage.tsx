/**
 * Products page — list products and pricing.
 * TODO: Implement with product cards or table.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { Plus, Pencil, Trash2, X, DollarSign } from 'lucide-react';

interface ProductPrice {
  id: string;
  productId: string;
  currency: string;
  priceAmount: number;
  isDefault: boolean;
}

interface Product {
  id: string;
  name: string;
  category: string | null;
  defaultCurrency: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  prices: ProductPrice[];
}

export function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [priceProduct, setPriceProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products', search],
    queryFn: () => dashboardApi.getProducts(search || undefined) as Promise<Product[]>,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => dashboardApi.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Produtos</h2>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={16} /> Novo Produto
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar produtos..."
        className="w-full max-w-sm rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg border bg-card" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Nenhum produto encontrado.
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Moeda</th>
                <th className="px-4 py-3 font-medium">Preços</th>
                <th className="px-4 py-3 font-medium">Criado em</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const defaultPrice = product.prices.find((p) => p.isDefault) || product.prices[0];
                return (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{product.category || '—'}</td>
                    <td className="px-4 py-3 text-sm">{product.defaultCurrency}</td>
                    <td className="px-4 py-3 text-sm">
                      {defaultPrice
                        ? `${defaultPrice.currency} ${Number(defaultPrice.priceAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : '—'}
                      {product.prices.length > 1 && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          (+{product.prices.length - 1})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPriceProduct(product)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="Gerenciar preços"
                        >
                          <DollarSign size={14} />
                        </button>
                        <button
                          onClick={() => { setEditingProduct(product); setShowForm(true); }}
                          className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este produto?')) {
                              deleteMut.mutate(product.id);
                            }
                          }}
                          className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
        />
      )}

      {priceProduct && (
        <PriceManagerModal
          product={priceProduct}
          onClose={() => setPriceProduct(null)}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || '');
  const [currency, setCurrency] = useState(product?.defaultCurrency || 'BRL');
  const [priceAmount, setPriceAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const isEdit = !!product;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await dashboardApi.updateProduct(product!.id, {
          name: name.trim(),
          category: category.trim() || undefined,
          defaultCurrency: currency,
        });
      } else {
        const prices = priceAmount
          ? [{ currency, priceAmount, isDefault: true }]
          : undefined;
        await dashboardApi.createProduct({
          name: name.trim(),
          category: category.trim() || undefined,
          defaultCurrency: currency,
          prices,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    } catch {
      alert('Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{isEdit ? 'Editar Produto' : 'Novo Produto'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Categoria</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Moeda padrão</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          {!isEdit && (
            <div>
              <label className="mb-1 block text-sm font-medium">Preço inicial</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={priceAmount}
                onChange={(e) => setPriceAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-secondary">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PriceManagerModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [currency, setCurrency] = useState(product.defaultCurrency);
  const [amount, setAmount] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: current } = useQuery<Product>({
    queryKey: ['product', product.id],
    queryFn: () => dashboardApi.getProduct(product.id) as Promise<Product>,
    initialData: product,
  });

  const prices = current?.prices || product.prices;

  async function addPrice(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    setSaving(true);
    try {
      await dashboardApi.addProductPrice(product.id, { currency, priceAmount: amount, isDefault });
      queryClient.invalidateQueries({ queryKey: ['product', product.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setAmount('');
      setIsDefault(false);
    } catch {
      alert('Erro ao adicionar preço');
    } finally {
      setSaving(false);
    }
  }

  async function deletePrice(priceId: string) {
    if (!confirm('Excluir este preço?')) return;
    await dashboardApi.deleteProductPrice(product.id, priceId);
    queryClient.invalidateQueries({ queryKey: ['product', product.id] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Preços — {product.name}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>

        {prices.length > 0 ? (
          <div className="mb-4 rounded border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Moeda</th>
                  <th className="px-3 py-2 font-medium">Valor</th>
                  <th className="px-3 py-2 font-medium">Padrão</th>
                  <th className="px-3 py-2 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{p.currency}</td>
                    <td className="px-3 py-2">{Number(p.priceAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2">{p.isDefault ? '✓' : ''}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => deletePrice(p.id)}
                        className="rounded p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mb-4 text-sm text-muted-foreground">Nenhum preço cadastrado.</p>
        )}

        <form onSubmit={addPrice} className="flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium">Moeda</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
            >
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium">Valor</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
            />
          </div>
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
            Padrão
          </label>
          <button
            type="submit"
            disabled={saving || !amount}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? '...' : 'Adicionar'}
          </button>
        </form>
      </div>
    </div>
  );
}
