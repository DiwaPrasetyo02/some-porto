import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, NavLink } from 'react-router-dom';
import { adminLogout, getAbout, getStack, getProjects, getExperience, getEducation, getSocialLinks, adminGetContacts } from '../../services/api';
import { FaSignOutAlt, FaHome, FaUser, FaCode, FaProjectDiagram, FaBriefcase, FaGraduationCap, FaLink, FaEnvelope } from 'react-icons/fa';
import AboutManager from './managers/AboutManager';
import StackManager from './managers/StackManager';
import ProjectManager from './managers/ProjectManager';
import ExperienceManager from './managers/ExperienceManager';
import EducationManager from './managers/EducationManager';
import SocialLinkManager from './managers/SocialLinkManager';
import ContactManager from './managers/ContactManager';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    about: false,
    stack: 0,
    projects: 0,
    experience: 0,
    education: 0,
    socialLinks: 0,
    contacts: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [aboutRes, stackRes, projectsRes, expRes, eduRes, socialRes, contactsRes] = await Promise.all([
        getAbout().catch(() => ({ data: null })),
        getStack().catch(() => ({ data: [] })),
        getProjects().catch(() => ({ data: [] })),
        getExperience().catch(() => ({ data: [] })),
        getEducation().catch(() => ({ data: [] })),
        getSocialLinks().catch(() => ({ data: [] })),
        adminGetContacts().catch(() => ({ data: [] })),
      ]);

      setStats({
        about: !!aboutRes.data,
        stack: stackRes.data.length,
        projects: projectsRes.data.length,
        experience: expRes.data.length,
        education: eduRes.data.length,
        socialLinks: socialRes.data.length,
        contacts: contactsRes.data.filter(c => !c.is_read).length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const DashboardHome = () => (
    <div className="dashboard-home">
      <h1>Dashboard Overview</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <FaUser size={30} />
          <h3>About</h3>
          <p>{stats.about ? 'Configured' : 'Not Set'}</p>
        </div>
        <div className="stat-card">
          <FaCode size={30} />
          <h3>Stack Items</h3>
          <p>{stats.stack}</p>
        </div>
        <div className="stat-card">
          <FaProjectDiagram size={30} />
          <h3>Projects</h3>
          <p>{stats.projects}</p>
        </div>
        <div className="stat-card">
          <FaBriefcase size={30} />
          <h3>Experience</h3>
          <p>{stats.experience}</p>
        </div>
        <div className="stat-card">
          <FaGraduationCap size={30} />
          <h3>Education</h3>
          <p>{stats.education}</p>
        </div>
        <div className="stat-card">
          <FaLink size={30} />
          <h3>Social Links</h3>
          <p>{stats.socialLinks}</p>
        </div>
        <div className="stat-card">
          <FaEnvelope size={30} />
          <h3>Unread Contacts</h3>
          <p>{stats.contacts}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <FaHome /> Dashboard
          </NavLink>
          <NavLink to="/admin/about" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <FaUser /> About
          </NavLink>
          <NavLink to="/admin/stack" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <FaCode /> Stack
          </NavLink>
          <NavLink to="/admin/projects" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <FaProjectDiagram /> Projects
          </NavLink>
          <NavLink to="/admin/experience" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <FaBriefcase /> Experience
          </NavLink>
          <NavLink to="/admin/education" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <FaGraduationCap /> Education
          </NavLink>
          <NavLink to="/admin/social-links" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <FaLink /> Social Links
          </NavLink>
          <NavLink to="/admin/contacts" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <FaEnvelope /> Contacts {stats.contacts > 0 && <span className="badge">{stats.contacts}</span>}
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button onClick={() => navigate('/')} className="view-site-btn">
            View Site
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="about" element={<AboutManager onUpdate={loadStats} />} />
          <Route path="stack" element={<StackManager onUpdate={loadStats} />} />
          <Route path="projects" element={<ProjectManager onUpdate={loadStats} />} />
          <Route path="experience" element={<ExperienceManager onUpdate={loadStats} />} />
          <Route path="education" element={<EducationManager onUpdate={loadStats} />} />
          <Route path="social-links" element={<SocialLinkManager onUpdate={loadStats} />} />
          <Route path="contacts" element={<ContactManager onUpdate={loadStats} />} />
          <Route path="/" element={<DashboardHome />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
