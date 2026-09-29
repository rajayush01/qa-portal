import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Paperclip, X, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { Input, RadioGroup, Select, Textarea } from '@/components/common/FormFields';
import { Button } from '@/components/common/Button';
import { QuestionIdChip } from '@/components/common/QuestionBits';
import { questionApi, taxonomyApi } from '@/services/endpoints';
import { QuestionScope, TaxonomyEntry } from '@/types';
import { SCOPE_OPTIONS } from '@/constants/scopes';

const MAX_CHARS = 1000;
const MAX_FILES = 5;
const MAX_FILE_MB = 10;
const ALLOWED_EXT = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export const AskQuestionPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [departments, setDepartments] = useState<TaxonomyEntry[]>([]);
  const [categories, setCategories] = useState<TaxonomyEntry[]>([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [scope, setScope] = useState<QuestionScope | ''>('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await taxonomyApi.list();
        setDepartments(data.departments);
        setCategories(data.categories);
        if (data.departments[0]) setDepartment(data.departments[0].name);
        if (data.categories[0]) setCategory(data.categories[0].name);
      } catch {
        toast.error('Could not load departments and categories.');
      } finally {
        setTaxonomyLoading(false);
      }
    })();
  }, []);

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    setFileError('');
    const incoming = Array.from(fileList);
    const combined = [...files];

    for (const f of incoming) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) {
        setFileError(`"${f.name}" is not a supported file type.`);
        continue;
      }
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        setFileError(`"${f.name}" exceeds the ${MAX_FILE_MB}MB limit.`);
        continue;
      }
      if (combined.length >= MAX_FILES) {
        setFileError(`You can attach up to ${MAX_FILES} files.`);
        break;
      }
      combined.push(f);
    }
    setFiles(combined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!isAnonymous && !name.trim()) next.name = 'Name is required unless submitting anonymously.';
    if (!department) next.department = 'Select a department.';
    if (!scope) next.scope = 'Select One Earth, Sites or Other.';
    if (!location.trim()) next.location = 'Location is required.';
    if (!category) next.category = 'Select a category.';
    if (!questionText.trim()) next.questionText = 'Enter your question.';
    else if (questionText.length > MAX_CHARS) next.questionText = `Question must be ${MAX_CHARS} characters or fewer.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('isAnonymous', String(isAnonymous));
      if (!isAnonymous) formData.append('name', name.trim());
      formData.append('department', department);
      formData.append('scope', scope);
      formData.append('location', location.trim());
      formData.append('category', category);
      formData.append('questionText', questionText.trim());
      files.forEach((f) => formData.append('attachments', f));

      const { data } = await questionApi.create(formData);
      setSuccessId(data.question.questionId);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccessId(null);
    setName('');
    setScope('');
    setLocation('');
    setQuestionText('');
    setFiles([]);
    setIsAnonymous(false);
  };

  if (successId) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-signal-green/15 text-signal-green"
        >
          <CheckCircle2 size={30} />
        </motion.div>
        <h2 className="font-display text-2xl text-ink-100">Question submitted successfully</h2>
        <p className="mt-2 text-sm text-ink-400">Your Question ID</p>
        <QuestionIdChip id={successId} className="mt-3 text-sm" />
        <p className="mt-4 text-sm text-ink-400">
          You can track the status of your question from your dashboard.
        </p>
        <div className="mt-7 flex gap-3">
          <Button variant="secondary" onClick={resetForm}>
            Ask another
          </Button>
          <Button onClick={() => navigate('/dashboard')}>View My Question</Button>
        </div>
      </div>
    );
  }

  if (taxonomyLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-accent-400" size={24} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl text-ink-100">Ask a question</h1>
        <p className="mt-1.5 text-sm text-ink-400">
          Submit a question for the upcoming session or for the admin team to review.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-ink-700 bg-ink-900/50 p-6">
        <div className="flex items-center justify-between rounded-lg border border-ink-700 bg-ink-900 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-ink-100">Submit anonymously</p>
            <p className="text-xs text-ink-400">Your name will not be shown to admins.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isAnonymous}
            onClick={() => setIsAnonymous((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              isAnonymous ? 'bg-accent-500' : 'bg-ink-600'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                isAnonymous ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {!isAnonymous && (
          <Input
            label="Name"
            required
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Select
            label="Your question's department"
            required
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            error={errors.department}
          >
            {departments.map((d) => (
              <option key={d._id} value={d.name}>
                {d.name}
              </option>
            ))}
          </Select>
          <Select
            label="Category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            error={errors.category}
          >
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <RadioGroup<QuestionScope>
          name="scope"
          label="Scope"
          required
          options={SCOPE_OPTIONS}
          value={scope}
          onChange={(v) => {
            setScope(v);
            setErrors((prev) => ({ ...prev, scope: '' }));
          }}
          error={errors.scope}
        />

        <Input
          label="Location"
          required
          placeholder="e.g. Mumbai, Bengaluru, Remote"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          error={errors.location}
        />

        <div>
          <Textarea
            label="Question"
            required
            rows={5}
            maxLength={MAX_CHARS}
            placeholder="Type your question here…"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            error={errors.questionText}
          />
          <p
            className={`mt-1.5 text-right text-xs ${
              questionText.length > MAX_CHARS ? 'text-signal-red' : 'text-ink-500'
            }`}
          >
            {questionText.length} / {MAX_CHARS} characters
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-200">Attachments</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-lg border border-dashed border-ink-600 bg-ink-900 px-4 py-5 text-center transition-colors hover:border-accent-500/50"
          >
            <Paperclip className="mx-auto mb-1.5 text-ink-400" size={18} />
            <p className="text-sm text-ink-300">Click to attach files</p>
            <p className="mt-0.5 text-xs text-ink-500">PDF, DOC, DOCX, XLS, XLSX — up to {MAX_FILE_MB}MB each</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_EXT.join(',')}
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
          </div>
          {fileError && <p className="mt-1.5 text-xs text-signal-red">{fileError}</p>}

          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f, idx) => (
                <li
                  key={`${f.name}-${idx}`}
                  className="flex items-center justify-between rounded-lg border border-ink-700 bg-ink-900 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText size={15} className="shrink-0 text-ink-400" />
                    <span className="truncate text-sm text-ink-200">{f.name}</span>
                    <span className="shrink-0 text-xs text-ink-500">{formatSize(f.size)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="rounded-md p-1 text-ink-400 hover:bg-ink-800 hover:text-signal-red"
                    aria-label={`Remove ${f.name}`}
                  >
                    <X size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          {submitting ? 'Submitting…' : 'Submit Question'}
        </Button>
      </form>
    </div>
  );
};
