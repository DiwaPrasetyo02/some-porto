import { useState, useEffect } from 'react';
import { getStack, adminCreateStack, adminUpdateStack, adminDeleteStack } from '../../../services/api';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Toast from '../../../components/Toast';
import ImagePreview from '../../../components/ImagePreview';
import LoadingSpinner from '../../../components/LoadingSpinner';

const StackManager = ({ onUpdate }) => {
  const [stack, setStack] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    icon: '',
    proficiency: 0,
    description: '',
    order_index: 0,
  });

  useEffect(() => {
    loadStack();
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const loadStack = async () => {
    setLoading(true);
    try {
      const response = await getStack();
      setStack(response.data);
    } catch (error) {
      console.error('Error loading stack:', error);
      showToast('Failed to load tech stack', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingItem) {
        await adminUpdateStack(editingItem.id, formData);
        showToast('Stack item updated successfully!', 'success');
      } else {
        await adminCreateStack(formData);
        showToast('Stack item created successfully!', 'success');
      }
      closeModal();
      loadStack();
      if (onUpdate) onUpdate();
    } catch (error) {
      showToast('Failed to save stack item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setLoading(true);
      try {
        await adminDeleteStack(id);
        showToast('Stack item deleted successfully!', 'success');
        loadStack();
        if (onUpdate) onUpdate();
      } catch (error) {
        showToast('Failed to delete stack item', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      category: '',
      icon: '',
      proficiency: 0,
      description: '',
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
        <h2>Tech Stack</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)} disabled={loading}>
          Add New Stack
        </button>
      </div>

      {loading && stack.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="item-list">
          {stack.map((item) => (
            <div key={item.id} className="item-card">
              <div>
                <h3>{item.name}</h3>
                <p>{item.category}</p>
                {item.proficiency != null && <p>Proficiency: {item.proficiency}%</p>}
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
              <h3>{editingItem ? 'Edit Stack' : 'Add New Stack'}</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Frontend, Backend, Database"
                />
              </div>
              <div className="form-group">
                <label>Icon URL</label>
                <input
                  type="url"
                  value={formData.icon || ''}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="https://example.com/icon.png"
                />
                {formData.icon && (
                  <div style={{ marginTop: '12px' }}>
                    <ImagePreview url={formData.icon} alt="Icon preview" />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Proficiency (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.proficiency || 0}
                  onChange={(e) => setFormData({ ...formData, proficiency: parseInt(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
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

export default StackManager;
