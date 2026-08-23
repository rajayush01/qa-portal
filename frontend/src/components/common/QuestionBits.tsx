import { Hash, FileText, Download, Eye } from 'lucide-react';
import { Attachment } from '@/types';
import { attachmentUrl } from '@/services/endpoints';

export const QuestionIdChip = ({ id, className = '' }: { id: string; className?: string }) => (
  <span className={`id-chip border-accent-500/30 bg-accent-500/10 text-accent-300 ${className}`}>
    <Hash size={11} />
    {id}
  </span>
);

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const AttachmentList = ({
  questionId,
  attachments,
}: {
  questionId: string;
  attachments: Attachment[];
}) => {
  if (!attachments.length) return null;

  const isViewable = (mime: string) => mime === 'application/pdf';

  return (
    <div className="space-y-2">
      {attachments.map((a) => (
        <div
          key={a.fileName}
          className="flex items-center justify-between rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-2.5"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <FileText size={16} className="shrink-0 text-ink-400" />
            <div className="min-w-0">
              <p className="truncate text-sm text-ink-100">{a.originalName}</p>
              <p className="text-xs text-ink-400">{formatSize(a.size)}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {isViewable(a.mimeType) && (
              <a
                href={attachmentUrl(questionId, a.fileName)}
                target="_blank"
                rel="noreferrer"
                className="rounded-md p-1.5 text-ink-300 hover:bg-ink-800 hover:text-ink-100"
                aria-label={`View ${a.originalName}`}
              >
                <Eye size={15} />
              </a>
            )}
            <a
              href={attachmentUrl(questionId, a.fileName)}
              download
              className="rounded-md p-1.5 text-ink-300 hover:bg-ink-800 hover:text-ink-100"
              aria-label={`Download ${a.originalName}`}
            >
              <Download size={15} />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};
