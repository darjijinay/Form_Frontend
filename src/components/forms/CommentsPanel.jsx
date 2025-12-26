import { useState, useEffect, useRef } from 'react';
import { formApi } from '@/api/formApi';

export default function CommentsPanel({
  formId,
  responseId,
  isOpen,
  onClose,
  isFormOwner = false,
}) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && formId && responseId) {
      fetchComments();
      // Auto-scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, formId, responseId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await formApi.getResponseComments(formId, responseId);
      setComments(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const payload = {
        text: newComment,
        ...(replyingTo && { parentComment: replyingTo }),
      };
      await formApi.addComment(formId, responseId, payload);
      setNewComment('');
      setReplyingTo(null);
      setError('');
      fetchComments();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error adding comment';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;

    try {
      setLoading(true);
      await formApi.deleteComment(commentId);
      fetchComments();
    } catch (err) {
      setError('Error deleting comment');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (commentId) => {
    try {
      await formApi.toggleCommentLike(commentId);
      fetchComments();
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleResolve = async (commentId) => {
    try {
      await formApi.toggleCommentResolve(commentId);
      fetchComments();
    } catch (err) {
      console.error('Error toggling resolve:', err);
    }
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderCommentThread = (comment, depth = 0) => {
    return (
      <div key={comment._id} className={`space-y-2 ${depth > 0 ? 'ml-4' : ''}`}>
        {/* Comment */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900">
                {comment.author?.name}
              </p>
              <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
            </div>
            {comment.isResolved && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                Resolved
              </span>
            )}
          </div>

          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {comment.text}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handleToggleLike(comment._id)}
              className="text-xs text-gray-600 hover:text-blue-600 flex items-center gap-1"
            >
              👍 {comment.likes?.length > 0 ? comment.likes.length : ''}
            </button>

            {isFormOwner && (
              <button
                onClick={() => handleResolve(comment._id)}
                className={`text-xs px-2 py-1 rounded ${
                  comment.isResolved
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                ✓ Resolve
              </button>
            )}

            <button
              onClick={() => setReplyingTo(comment._id)}
              className="text-xs text-gray-600 hover:text-blue-600"
            >
              Reply
            </button>

            {isFormOwner && (
              <button
                onClick={() => handleDeleteComment(comment._id)}
                className="text-xs text-red-600 hover:text-red-700 ml-auto"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2">
            {comment.replies.map((reply) => renderCommentThread(reply, depth + 1))}
          </div>
        )}

        {/* Reply Input */}
        {replyingTo === comment._id && (
          <form onSubmit={handleAddComment} className="ml-4 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                autoFocus
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setReplyingTo(null);
                setNewComment('');
              }}
              className="text-xs text-gray-600 hover:text-gray-700"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-lg border-l border-gray-200 flex flex-col z-40 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 px-4 py-3 bg-white shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none"
        >
          ✕
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading && comments.length === 0 ? (
          <p className="text-gray-500 text-sm">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => renderCommentThread(comment))}
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* New Comment Form */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 shrink-0">
        {replyingTo === null && (
          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
