import { Text } from '@/shared/ui/Text.tsx'
import { useCallback } from 'react'
import { Check, RotateCcw, Trash2 } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { NoteCommentProps } from '../types/noteCommentProps.ts'

export function NoteComment({
  comment,
  profileId,
  readOnly,
  resolve,
  remove,
}: NoteCommentProps) {
  const { t } = useTranslation()
  const toggle = useCallback(() => resolve(comment.id), [resolve, comment.id])
  const deleteComment = useCallback(
    () => remove(comment.id),
    [remove, comment.id],
  )
  return (
    <article className="note-comment">
      <header>
        <Text as="strong">{comment.authorName}</Text>
        <time dateTime={new Date(comment.createdAt).toISOString()}>
          <Text>{new Date(comment.createdAt).toLocaleDateString()}</Text>
        </time>
      </header>
      {comment.quote && <blockquote><Text>{comment.quote}</Text></blockquote>}
      <Text as="p">{comment.body}</Text>
      <footer>
        {comment.resolved && <Text as="span">{t('Resolved')}</Text>}
        {!readOnly && (
          <button className="button subtle" onClick={toggle}>
            {comment.resolved ? <RotateCcw size={14} /> : <Check size={14} />}
            <Text>
              {t(comment.resolved ? 'Reopen comment' : 'Resolve comment')}
            </Text>
          </button>
        )}
        {!readOnly && profileId === comment.authorId && (
          <button
            className="icon-button"
            aria-label={t('Delete comment')}
            onClick={deleteComment}
          >
            <Trash2 size={14} />
          </button>
        )}
      </footer>
    </article>
  )
}
