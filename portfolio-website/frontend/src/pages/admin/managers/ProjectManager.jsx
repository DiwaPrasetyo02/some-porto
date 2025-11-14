import { useState, useEffect } from 'react';
import { getProjects, adminCreateProject, adminUpdateProject, adminDeleteProject } from '../../../services/api';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Toast from '../../../components/Toast';
import ImagePreview from '../../../components/ImagePreview';
import LoadingSpinner from '../../../components/LoadingSpinner';

const ProjectManager = ({ onUpdate }) => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    image: '',
    technologies: '',
    github_url: '',
    live_url: '',
    featured: false,
    order_index: 0,
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
      showToast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingItem) {
        await adminUpdateProject(editingItem.id, formData);
        showToast('Project updated successfully!', 'success');
      } else {
        await adminCreateProject(formData);
        showToast('Project created successfully!', 'success');
      }
      closeModal();
      loadProjects();
      if (onUpdate) onUpdate();
    } catch (error) {
      showToast('Failed to save project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    // Ensure all fields have proper values to prevent controlled/uncontrolled input issues
    setFormData({
      title: item.title || '',
      description: item.description || '',
      short_description: item.short_description || '',
      image: item.image || '',
      technologies: item.technologies || '',
      github_url: item.github_url || '',
      live_url: item.live_url || '',
      featured: item.featured || false,
      order_index: item.order_index || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setLoading(true);
      try {
        await adminDeleteProject(id);
        showToast('Project deleted successfully!', 'success');
        loadProjects();
        if (onUpdate) onUpdate();
      } catch (error) {
        showToast('Failed to delete project', 'error');
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
      description: '',
      short_description: '',
      image: '',
      technologies: '',
      github_url: '',
      live_url: '',
      featured: false,
      order_index: 0,
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
        <h2>Projects</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)} disabled={loading}>
          Add New Project
        </button>
      </div>

      {loading && projects.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="item-list">
          {projects.map((item) => (
            <div key={item.id} className="item-card">
              <div>
                <h3>{item.title} {item.featured && <span style={{color: 'var(--color-warning)'}}>★</span>}</h3>
                <p>{item.short_description}</p>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Project' : 'Add New Project'}</h3>
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
                <label>Short Description</label>
                <input
                  type="text"
                  value={formData.short_description || ''}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg or LinkedIn image URL"
                />
                {formData.image && (
                  <div style={{ marginTop: '12px' }}>
                    <ImagePreview url={formData.image} alt="Project preview" />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Technologies (comma-separated)</label>
                <input
                  type="text"
                  value={formData.technologies || ''}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>GitHub URL</label>
                <input
                  type="url"
                  value={formData.github_url || ''}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Live URL</label>
                <input
                  type="url"
                  value={formData.live_url || ''}
                  onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  {' '}Featured Project
                </label>
              </div>
              <div className="form-group">
                <label>Order Index</label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                />
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

export default ProjectManager;
