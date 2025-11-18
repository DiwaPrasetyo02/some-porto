import { useState, useEffect } from 'react';
import { getExperience, adminCreateExperience, adminUpdateExperience, adminDeleteExperience } from '../../../services/api';
import { FaEdit, FaTrash } from 'react-icons/fa';

const ExperienceManager = ({ onUpdate }) => {
  const [experiences, setExperiences] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    company: '', position: '', description: '', start_date: '', end_date: '', 
    location: '', is_current: false, order_index: 0
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const response = await getExperience();
      setExperiences(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await adminUpdateExperience(editingItem.id, formData);
      } else {
        await adminCreateExperience(formData);
      }
      closeModal();
      loadData();
      if (onUpdate) onUpdate();
    } catch (error) {
      alert('Failed to save');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ company: '', position: '', description: '', start_date: '', end_date: '', location: '', is_current: false, order_index: 0 });
  };

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Experience</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>Add Experience</button>
      </div>
      <div className="item-list">
        {experiences.map((item) => (
          <div key={item.id} className="item-card">
            <div>
              <h3>{item.position} at {item.company}</h3>
              <p>{item.start_date} - {item.is_current ? 'Present' : item.end_date}</p>
            </div>
            <div className="item-actions">
              <button className="btn-secondary" onClick={() => {
                setEditingItem(item);
                setFormData({
                  company: item.company || '',
                  position: item.position || '',
                  description: item.description || '',
                  start_date: item.start_date || '',
                  end_date: item.end_date || '',
                  location: item.location || '',
                  is_current: item.is_current || false,
                  order_index: item.order_index || 0
                });
                setShowModal(true);
              }}>
                <FaEdit />
              </button>
              <button className="btn-danger" onClick={async () => {
                if (window.confirm('Delete?')) {
                  await adminDeleteExperience(item.id);
                  loadData();
                  if (onUpdate) onUpdate();
                }
              }}><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? 'Edit' : 'Add'} Experience</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Company *</label>
                <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Position *</label>
                <input type="text" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={formData.start_date || ''} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={formData.end_date || ''} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} disabled={formData.is_current} />
              </div>
              <div className="form-group">
                <label>Order Index (lower numbers appear first)</label>
                <input type="number" value={formData.order_index || 0} onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })} />
                <small style={{ fontSize: '0.85em', color: '#888', marginTop: '4px', display: 'block' }}>Leave as 0 to auto-sort by date (newest first)</small>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" checked={formData.is_current} onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })} />
                  {' '}Currently Working Here
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">{editingItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceManager;
