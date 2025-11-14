import { useState, useEffect } from 'react';
import { getSocialLinks, adminCreateSocialLink, adminUpdateSocialLink, adminDeleteSocialLink } from '../../../services/api';
import { FaEdit, FaTrash } from 'react-icons/fa';

const SocialLinkManager = ({ onUpdate }) => {
  const [links, setLinks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ platform: '', url: '', icon: '', order_index: 0 });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await getSocialLinks();
      setLinks(res.data);
    } catch (e) {}
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      editing ? await adminUpdateSocialLink(editing.id, form) : await adminCreateSocialLink(form);
      close();
      load();
      if (onUpdate) onUpdate();
    } catch (e) { alert('Failed'); }
  };

  const close = () => {
    setShowModal(false);
    setEditing(null);
    setForm({ platform: '', url: '', icon: '', order_index: 0 });
  };

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Social Links</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>Add Link</button>
      </div>
      <div className="item-list">
        {links.map((item) => (
          <div key={item.id} className="item-card">
            <div><h3>{item.platform}</h3><p>{item.url}</p></div>
            <div className="item-actions">
              <button className="btn-secondary" onClick={() => {
                setEditing(item);
                setForm({
                  platform: item.platform || '',
                  url: item.url || '',
                  icon: item.icon || '',
                  order_index: item.order_index || 0
                });
                setShowModal(true);
              }}><FaEdit /></button>
              <button className="btn-danger" onClick={async () => { if (window.confirm('Delete?')) { await adminDeleteSocialLink(item.id); load(); if (onUpdate) onUpdate(); } }}><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal" onClick={close}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editing ? 'Edit' : 'Add'} Link</h3><button className="close-btn" onClick={close}>&times;</button></div>
            <form onSubmit={submit}>
              <div className="form-group"><label>Platform *</label><input type="text" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} required placeholder="e.g., GitHub, LinkedIn" /></div>
              <div className="form-group"><label>URL *</label><input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required /></div>
              <div className="form-group"><label>Icon URL</label><input type="url" value={form.icon || ''} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
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

export default SocialLinkManager;
