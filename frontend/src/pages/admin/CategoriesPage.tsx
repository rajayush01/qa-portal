import { useEffect, useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Tags, Building2 } from 'lucide-react';
import { taxonomyApi } from '@/services/endpoints';
import { TaxonomyEntry } from '@/types';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormFields';
import { ConfirmDialog } from '@/components/common/States';

const TaxonomyPanel = ({
  title,
  icon,
  kind,
  entries,
  onChanged,
}: {
  title: string;
  icon: JSX.Element;
  kind: 'category' | 'department';
  entries: TaxonomyEntry[];
  onChanged: () => void;
}) => {
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<TaxonomyEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      await taxonomyApi.create(name.trim(), kind);
      setName('');
      onChanged();
      toast.success(`Added "${name.trim()}"`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await taxonomyApi.remove(pendingDelete._id);
      toast.success(`Removed "${pendingDelete.name}"`);
      onChanged();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/60 p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
          {icon}
        </div>
        <h2 className="font-display text-lg text-ink-100">{title}</h2>
      </div>

      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Add a new ${kind}…`}
          className="!py-2"
        />
        <Button type="submit" size="sm" loading={adding}>
          <Plus size={15} />
        </Button>
      </form>

      <ul className="space-y-1.5">
        {entries.map((entry) => (
          <li
            key={entry._id}
            className="flex items-center justify-between rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-200"
          >
            {entry.name}
            <button
              onClick={() => setPendingDelete(entry)}
              className="rounded-md p-1 text-ink-500 hover:bg-ink-800 hover:text-signal-red"
              aria-label={`Remove ${entry.name}`}
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
        {entries.length === 0 && <p className="py-4 text-center text-xs text-ink-500">Nothing added yet.</p>}
      </ul>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Remove "${pendingDelete?.name}"?`}
        description="Questions already using this value will keep it, but it won't appear as an option going forward."
        confirmLabel="Remove"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<TaxonomyEntry[]>([]);
  const [departments, setDepartments] = useState<TaxonomyEntry[]>([]);

  const load = () => {
    taxonomyApi
      .list()
      .then(({ data }) => {
        setCategories(data.categories);
        setDepartments(data.departments);
      })
      .catch((err) => toast.error(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl text-ink-100">Categories &amp; Departments</h1>
      <p className="mb-6 text-sm text-ink-400">Manage the options users see when submitting a question.</p>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TaxonomyPanel title="Categories" icon={<Tags size={16} />} kind="category" entries={categories} onChanged={load} />
        <TaxonomyPanel title="Departments" icon={<Building2 size={16} />} kind="department" entries={departments} onChanged={load} />
      </div>
    </div>
  );
};
