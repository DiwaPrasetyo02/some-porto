import { useState, useEffect } from 'react';
import { getAbout, adminUpdateAbout, adminCreateAbout } from '../../../services/api';

const AboutManager = ({ onUpdate }) => {
  const [about, setAbout] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    profile_image: '',
    resume_url: '',
    email: '',
    phone: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadAbout();
  }, []);

  const loadAbout = async () => {
    try {
      const response = await getAbout();
      setAbout(response.data);
      setFormData(response.data);
    } catch (error) {
      console.log('No about section found');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (about) {
        await adminUpdateAbout(about.id, formData);
        setMessage({ type: 'success', text: 'About section updated successfully!' });
      } else {
        const response = await adminCreateAbout(formData);
        setAbout(response.data);
        setMessage({ type: 'success', text: 'About section created successfully!' });
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save about section' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>About Section</h2>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Subtitle</label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="5"
          />
        </div>

        <div className="form-group">
          <label>Profile Image URL</label>
          <input
            type="url"
            name="profile_image"
            value={formData.profile_image || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Resume URL</label>
          <input
            type="url"
            name="resume_url"
            value={formData.resume_url || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : about ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AboutManager;
