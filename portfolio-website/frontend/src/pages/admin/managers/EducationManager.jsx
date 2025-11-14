import { useState, useEffect } from 'react';
import { getEducation, adminCreateEducation, adminUpdateEducation, adminDeleteEducation } from '../../../services/api';
import { FaEdit, FaTrash } from 'react-icons/fa';

const EducationManager = ({ onUpdate }) => {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ institution: '', degree: '', field: '', description: '', start_date: '', end_date: '', grade: '', order_index: 0 });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await getEducation();
      setData(res.data);
    } catch (e) {}
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      editing ? await adminUpdateEducation(editing.id, form) : await adminCreateEducation(form);
      close();
      load();
      if (onUpdate) onUpdate();
    } catch (e) { alert('Failed'); }
  };

  const close = () => {
    setShowModal(false);
    setEditing(null);
    setForm({ institution: '', degree: '', field: '', description: '', start_date: '', end_date: '', grade: '', order_index: 0 });
  };

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Education</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>Add Education</button>
      </div>
      <div className="item-list">
        {data.map((item) => (
          <div key={item.id} className="item-card">
            <div>
              <h3>{item.degree}</h3>
              <p>{item.institution}</p>
            </div>
            <div className="item-actions">
              <button className="btn-secondary" onClick={() => {
                setEditing(item);
                setForm({
                  institution: item.institution || '',
                  degree: item.degree || '',
                  field: item.field || '',
                  description: item.description || '',
                  start_date: item.start_date || '',
                  end_date: item.end_date || '',
                  grade: item.grade || '',
                  order_index: item.order_index || 0
                });
                setShowModal(true);
              }}><FaEdit /></button>
              <button className="btn-danger" onClick={async () => { if (window.confirm('Delete?')) { await adminDeleteEducation(item.id); load(); if (onUpdate) onUpdate(); } }}><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal" onClick={close}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editing ? 'Edit' : 'Add'} Education</h3><button className="close-btn" onClick={close}>&times;</button></div>
            <form onSubmit={submit}>
              <div className="form-group"><label>Institution *</label><input type="text" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} required /></div>
              <div className="form-group"><label>Degree *</label><input type="text" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} required /></div>
              <div className="form-group"><label>Field</label><input type="text" value={form.field || ''} onChange={(e) => setForm({ ...form, field: e.target.value })} /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" /></div>
              <div className="form-group"><label>Start Date</label><input type="text" value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div className="form-group"><label>End Date</label><input type="text" value={form.end_date || ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
              <div className="form-group"><label>Grade</label><input type="text" value={form.grade || ''} onChange={(e) => setForm({ ...form, grade: e.target.value })} /></div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={close}>Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationManager;
