import { useEffect, useState, FormEvent, DragEvent } from 'react';
import { useSocket } from '@/context/SocketContext';
import toast from 'react-hot-toast';
import { Plus, Trash2, Tags, Building2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
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
  const [list, setList] = useState<TaxonomyEntry[]>(entries);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => setList(entries), [entries]);

  // Optimistically reorder, then persist; reload from the server if it fails.
  const move = async (from: number, to: number) => {
    if (to < 0 || to >= list.length || from === to) return;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setList(next);
    try {
      await taxonomyApi.reorder(kind, next.map((e) => e._id));
    } catch (err) {
      toast.error((err as Error).message);
      onChanged();
    }
  };
  const onDrop = (e: DragEvent, to: number) => {
    e.preventDefault();
    if (dragIdx !== null) move(dragIdx, to);
    setDragIdx(null);
  };

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
        {list.map((entry, idx) => (
          <li
            key={entry._id}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, idx)}
            onDragEnd={() => setDragIdx(null)}
            className={`flex items-center gap-2 rounded-lg border bg-ink-900 px-2 py-2 text-sm text-ink-200 ${
              dragIdx === idx ? 'border-accent-500 opacity-60' : 'border-ink-700'
            }`}
          >
            <GripVertical size={14} className="hidden shrink-0 cursor-grab text-ink-600 sm:block" />
            <span className="min-w-0 flex-1 break-words">{entry.name}</span>
            <button
              onClick={() => move(idx, idx - 1)}
              disabled={idx === 0}
              className="rounded-md p-1.5 text-ink-400 hover:bg-ink-800 hover:text-ink-100 disabled:opacity-25"
              aria-label={`Move ${entry.name} up`}
            >
              <ChevronUp size={15} />
            </button>
            <button
              onClick={() => move(idx, idx + 1)}
              disabled={idx === list.length - 1}
              className="rounded-md p-1.5 text-ink-400 hover:bg-ink-800 hover:text-ink-100 disabled:opacity-25"
              aria-label={`Move ${entry.name} down`}
            >
              <ChevronDown size={15} />
            </button>
            <button
              onClick={() => setPendingDelete(entry)}
              className="rounded-md p-1.5 text-ink-500 hover:bg-ink-800 hover:text-signal-red"
              aria-label={`Remove ${entry.name}`}
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
        {list.length === 0 && <p className="py-4 text-center text-xs text-ink-500">Nothing added yet.</p>}
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

  const { socket } = useSocket();

  useEffect(() => {
    load();
  }, []);

  // Another admin edited the lists.
  useEffect(() => {
    if (!socket) return;
    socket.on('taxonomy:changed', load);
    return () => {
      socket.off('taxonomy:changed', load);
    };
  }, [socket]);

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl text-ink-100">Categories &amp; Departments</h1>
      <p className="mb-6 text-sm text-ink-400">Manage the options users see when submitting a question. Drag or use the arrows to set the order they appear in.</p>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TaxonomyPanel title="Categories" icon={<Tags size={16} />} kind="category" entries={categories} onChanged={load} />
        <TaxonomyPanel title="Departments" icon={<Building2 size={16} />} kind="department" entries={departments} onChanged={load} />
      </div>
    </div>
  );
};
