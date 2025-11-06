import { useState, useEffect } from 'react';
import { getProjects, adminCreateProject, adminUpdateProject, adminDeleteProject } from '../../../services/api';
import { FaEdit, FaTrash } from 'react-icons/fa';

const ProjectManager = ({ onUpdate }) => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
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

  const loadProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await adminUpdateProject(editingItem.id, formData);
      } else {
        await adminCreateProject(formData);
      }
      closeModal();
      loadProjects();
      if (onUpdate) onUpdate();
    } catch (error) {
      alert('Failed to save project');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await adminDeleteProject(id);
        loadProjects();
        if (onUpdate) onUpdate();
      } catch (error) {
        alert('Failed to delete project');
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
      <div className="manager-header">
        <h2>Projects</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          Add New Project
        </button>
      </div>

      <div className="item-list">
        {projects.map((item) => (
          <div key={item.id} className="item-card">
            <div>
              <h3>{item.title} {item.featured && <span style={{color: '#f39c12'}}>★</span>}</h3>
              <p>{item.short_description}</p>
            </div>
            <div className="item-actions">
              <button className="btn-secondary" onClick={() => handleEdit(item)}>
                <FaEdit />
              </button>
              <button className="btn-danger" onClick={() => handleDelete(item.id)}>
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

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
                />
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
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Update' : 'Create'}
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
