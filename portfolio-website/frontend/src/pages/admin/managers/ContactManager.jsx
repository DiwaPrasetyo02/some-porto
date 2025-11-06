import { useState, useEffect } from 'react';
import { adminGetContacts, adminMarkContactRead, adminDeleteContact } from '../../../services/api';
import { FaEnvelope, FaEnvelopeOpen, FaTrash } from 'react-icons/fa';

const ContactManager = ({ onUpdate }) => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await adminGetContacts();
      setContacts(res.data);
    } catch (e) {}
  };

  const markRead = async (id) => {
    try {
      await adminMarkContactRead(id);
      load();
      if (onUpdate) onUpdate();
    } catch (e) {}
  };

  const deleteItem = async (id) => {
    if (window.confirm('Delete this message?')) {
      try {
        await adminDeleteContact(id);
        load();
        if (onUpdate) onUpdate();
      } catch (e) {}
    }
  };

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Contact Messages</h2>
      </div>
      <div className="item-list">
        {contacts.map((msg) => (
          <div key={msg.id} className="item-card" style={{ background: msg.is_read ? '#f8f9fa' : '#e3f2fd' }}>
            <div>
              <h3>{msg.name} {!msg.is_read && <span style={{color: '#f39c12'}}>NEW</span>}</h3>
              <p><strong>Email:</strong> {msg.email}</p>
              {msg.subject && <p><strong>Subject:</strong> {msg.subject}</p>}
              <p>{msg.message}</p>
              <small>{new Date(msg.created_at).toLocaleString()}</small>
            </div>
            <div className="item-actions">
              {!msg.is_read && (
                <button className="btn-secondary" onClick={() => markRead(msg.id)} title="Mark as read">
                  <FaEnvelopeOpen />
                </button>
              )}
              <button className="btn-danger" onClick={() => deleteItem(msg.id)}><FaTrash /></button>
            </div>
          </div>
        ))}
        {contacts.length === 0 && <p>No messages yet.</p>}
      </div>
    </div>
  );
};

export default ContactManager;
