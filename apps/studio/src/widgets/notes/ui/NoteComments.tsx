import { useCallback } from 'react'
import type { ChangeEvent } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import type { NoteEditorProps } from '../types/noteEditorProps.ts'
import { useNoteComments } from '../model/useNoteComments.ts'
import { NoteComment } from './NoteComment.tsx'

export function NoteComments(props: NoteEditorProps) {
  const { t } = useTranslation()
  const { model, workspace } = props
  const { state, patch, profile } = model
  const readOnly = useWorkspaceRole() === 'viewer'
  const { comments, post, resolve, remove } = useNoteComments(props)
  const close = useCallback(() => patch({ comments: false }), [patch])
  const draft = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) =>
      patch({ commentDraft: event.target.value }),
    [patch],
  )
  const toggleResolved = useCallback(
    () => patch({ showResolved: !state.showResolved }),
    [patch, state.showResolved],
  )
  const clearQuote = useCallback(() => patch({ commentQuote: '' }), [patch])
  return (
    <aside className="note-comments" aria-label={t('Note comments')}>
      <header className="notebook-panel-heading">
        <strong>
          {t('Comments')} · {comments.filter((c) => !c.resolved).length}
        </strong>
        <button
          className="icon-button"
          aria-label={t('Close comments')}
          onClick={close}
        >
          <X size={16} />
        </button>
      </header>
      <label className="note-comments-filter">
        <input
          type="checkbox"
          checked={state.showResolved}
          onChange={toggleResolved}
        />
        {t('Show resolved')}
      </label>
      <div className="note-comments-list">
        {comments
          .filter((comment) => state.showResolved || !comment.resolved)
          .map((comment) => (
            <NoteComment
              key={comment.id}
              comment={comment}
              readOnly={readOnly}
              profileId={profile.id}
              resolve={resolve}
              remove={remove}
            />
          ))}
        {!comments.some(
          (comment) => state.showResolved || !comment.resolved,
        ) && (
          <p className="empty-message">
            {t('No comments yet. Select text to quote it in a comment.')}
          </p>
        )}
      </div>
      {!readOnly && (
        <form className="note-comment-compose" onSubmit={post}>
          {state.commentQuote && (
            <div className="note-comment-quote">
              <blockquote>{state.commentQuote}</blockquote>
              <button
                className="icon-button"
                type="button"
                aria-label={t('Remove quote')}
                onClick={clearQuote}
              >
                <X size={14} />
              </button>
            </div>
          )}
          <textarea
            aria-label={t('Write a comment')}
            placeholder={t('Write a comment')}
            value={state.commentDraft}
            onChange={draft}
            maxLength={2000}
            rows={3}
          />
          <button
            className="button primary"
            disabled={
              !state.commentDraft.trim() ||
              (workspace.noteComments?.length || 0) >= 1000
            }
          >
            {t('Post comment')}
          </button>
          {(workspace.noteComments?.length || 0) >= 1000 && (
            <small>{t('Comment limit reached')}</small>
          )}
        </form>
      )}
    </aside>
  )
}
