import { useState, useEffect } from 'react';
import { getStack, adminCreateStack, adminUpdateStack, adminDeleteStack } from '../../../services/api';
import { FaEdit, FaTrash } from 'react-icons/fa';

const StackManager = ({ onUpdate }) => {
  const [stack, setStack] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
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

  const loadStack = async () => {
    try {
      const response = await getStack();
      setStack(response.data);
    } catch (error) {
      console.error('Error loading stack:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingItem) {
        await adminUpdateStack(editingItem.id, formData);
      } else {
        await adminCreateStack(formData);
      }
      closeModal();
      loadStack();
      if (onUpdate) onUpdate();
    } catch (error) {
      alert('Failed to save stack item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await adminDeleteStack(id);
        loadStack();
        if (onUpdate) onUpdate();
      } catch (error) {
        alert('Failed to delete stack item');
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
      <div className="manager-header">
        <h2>Tech Stack</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          Add New Stack
        </button>
      </div>

      <div className="item-list">
        {stack.map((item) => (
          <div key={item.id} className="item-card">
            <div>
              <h3>{item.name}</h3>
              <p>{item.category}</p>
              {item.proficiency && <p>Proficiency: {item.proficiency}%</p>}
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
                />
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

export default StackManager;
