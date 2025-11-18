import { useState, useEffect } from 'react';
import { adminGetBlogs, adminCreateBlog, adminUpdateBlog, adminDeleteBlog } from '../../../services/api';
import { FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import Toast from '../../../components/Toast';
import LoadingSpinner from '../../../components/LoadingSpinner';

const BlogManager = ({ onUpdate }) => {
  const [blogs, setBlogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    published: false,
    tags: '',
    author: '',
  });

  useEffect(() => {
    loadBlogs();
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const response = await adminGetBlogs();
      setBlogs(response.data);
    } catch (error) {
      console.error('Error loading blogs:', error);
      showToast('Failed to load blogs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Auto-generate slug if empty
      const dataToSubmit = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
      };

      if (editingItem) {
        await adminUpdateBlog(editingItem.id, dataToSubmit);
        showToast('Blog updated successfully!', 'success');
      } else {
        await adminCreateBlog(dataToSubmit);
        showToast('Blog created successfully!', 'success');
      }
      closeModal();
      loadBlogs();
      if (onUpdate) onUpdate();
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to save blog';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      slug: item.slug || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      featured_image: item.featured_image || '',
      published: item.published || false,
      tags: item.tags || '',
      author: item.author || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      setLoading(true);
      try {
        await adminDeleteBlog(id);
        showToast('Blog deleted successfully!', 'success');
        loadBlogs();
        if (onUpdate) onUpdate();
      } catch (error) {
        showToast('Failed to delete blog', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      published: false,
      tags: '',
      author: '',
    });
  };

  return (
    <div className="manager-container">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div className="manager-header">
        <h2>Blog Posts</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)} disabled={loading}>
          Add New Blog
        </button>
      </div>

      {loading && blogs.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="item-list">
          {blogs.map((item) => (
            <div key={item.id} className="item-card">
              <div>
                <h3>
                  {item.title}
                  {item.published ? (
                    <FaEye style={{ marginLeft: '8px', fontSize: '14px', color: '#4ade80' }} title="Published" />
                  ) : (
                    <FaEyeSlash style={{ marginLeft: '8px', fontSize: '14px', color: '#94a3b8' }} title="Draft" />
                  )}
                </h3>
                <p style={{ fontSize: '0.85em', color: '#888' }}>/{item.slug}</p>
                <p style={{ fontSize: '0.9em', marginTop: '4px' }}>{item.excerpt?.substring(0, 100)}...</p>
                <p style={{ fontSize: '0.8em', color: '#888', marginTop: '4px' }}>
                  Views: {item.views} | Created: {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="item-actions">
                <button className="btn-secondary" onClick={() => handleEdit(item)} disabled={loading}>
                  <FaEdit />
                </button>
                <button className="btn-danger" onClick={() => handleDelete(item.id)} disabled={loading}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Blog' : 'Add New Blog'}</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Slug (auto-generated if empty)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="my-blog-post"
                />
                <small style={{ fontSize: '0.85em', color: '#888' }}>
                  URL: /blog/{formData.slug || generateSlug(formData.title || 'slug')}
                </small>
              </div>
              <div className="form-group">
                <label>Excerpt (max 500 chars)</label>
                <textarea
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows="2"
                  maxLength={500}
                  placeholder="Short summary of the blog post..."
                />
              </div>
              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="15"
                  required
                  placeholder="Blog content (supports markdown formatting)..."
                  style={{ fontFamily: 'monospace', fontSize: '0.9em' }}
                />
              </div>
              <div className="form-group">
                <label>Featured Image URL</label>
                <input
                  type="url"
                  value={formData.featured_image || ''}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags || ''}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="React, JavaScript, Web Development"
                />
              </div>
              <div className="form-group">
                <label>Author</label>
                <input
                  type="text"
                  value={formData.author || ''}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  />
                  {' '}Publish (make visible to public)
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      <span style={{ marginLeft: '8px' }}>Saving...</span>
                    </>
                  ) : (
                    editingItem ? 'Update' : 'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManager;
