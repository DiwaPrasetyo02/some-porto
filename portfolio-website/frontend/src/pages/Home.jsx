import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { getAbout, getStack, getProjects, getExperience, getEducation, getSocialLinks, submitContact } from '../services/api';
import Navbar from '../components/Navbar';
import AnimatedBackground from '../components/AnimatedBackground';
import './Home.css';

const Home = () => {
  const [about, setAbout] = useState(null);
  const [stack, setStack] = useState([]);
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [aboutRes, stackRes, projectsRes, expRes, eduRes, socialRes] = await Promise.all([
        getAbout().catch(() => ({ data: null })),
        getStack().catch(() => ({ data: [] })),
        getProjects().catch(() => ({ data: [] })),
        getExperience().catch(() => ({ data: [] })),
        getEducation().catch(() => ({ data: [] })),
        getSocialLinks().catch(() => ({ data: [] })),
      ]);

      setAbout(aboutRes.data);
      setStack(stackRes.data);
      setProjects(projectsRes.data);
      setExperience(expRes.data);
      setEducation(eduRes.data);
      setSocialLinks(socialRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitContact(contactForm);
      setSubmitStatus('success');
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (error) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  const iconMap = {
    GitHub: FaGithub,
    LinkedIn: FaLinkedin,
    Twitter: FaTwitter,
  };

  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <div className="home">
        {/* Hero Section */}
        <section id="home" className="hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.4, 0.25, 1] }}
        >
          {about && (
            <>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {about.title}
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {about.subtitle}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {about.description}
              </motion.p>
              <motion.div
                className="social-links"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {socialLinks.map((link, index) => {
                  const Icon = iconMap[link.platform] || FaGithub;
                  return (
                    <motion.a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Icon size={28} />
                    </motion.a>
                  );
                })}
              </motion.div>
            </>
          )}
        </motion.div>
      </section>

      {/* About Section */}
      {about && (
        <motion.section
          id="about"
          className="about-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            About Me
          </motion.h2>
          <div className="about-content">
            <motion.div
              className="about-info"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p>{about.description}</p>
              {about.email && (
                <motion.div
                  className="contact-info"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  whileHover={{ scale: 1.05, x: 5 }}
                >
                  <FaEnvelope /> {about.email}
                </motion.div>
              )}
              {about.phone && (
                <motion.div
                  className="contact-info"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  whileHover={{ scale: 1.05, x: 5 }}
                >
                  <FaPhone /> {about.phone}
                </motion.div>
              )}
              {about.location && (
                <motion.div
                  className="contact-info"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  whileHover={{ scale: 1.05, x: 5 }}
                >
                  <FaMapMarkerAlt /> {about.location}
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Stack Section */}
      {stack.length > 0 && (
        <section id="stack" className="stack-section">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Tech Stack
          </motion.h2>
          <div className="stack-grid">
            {stack.map((item, index) => (
              <motion.div
                key={item.id}
                className="stack-item"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.25, 0.4, 0.25, 1]
                }}
              >
                {item.icon && (
                  <img
                    src={item.icon}
                    alt={item.name}
                    loading="lazy"
                    style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 12 }}
                  />
                )}
                <h3>{item.name}</h3>
                {item.category && (
                  <span className="chip" title={item.category}>{item.category}</span>
                )}
                {item.description && <p>{item.description}</p>}
                <div className="proficiency-bar">
                  <motion.div
                    className="proficiency-fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.proficiency || 80}%` }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                  />
                </div>
                {item.proficiency != null && (
                  <motion.div
                    style={{ marginTop: 8, fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 600 }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                  >
                    {item.proficiency}%
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section */}
      {projects.length > 0 && (
        <section id="projects" className="projects-section">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Projects
          </motion.h2>
          <div className="projects-grid">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                className="project-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                  ease: [0.25, 0.4, 0.25, 1]
                }}
              >
                {project.image && (
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                  />
                )}
                <div className="project-content">
                  <h3>{project.title}</h3>
                  <p>{project.short_description || project.description}</p>
                  <div className="project-links">
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                        <FaGithub /> GitHub
                      </a>
                    )}
                    {project.live_url && (
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Experience Section */}
      {experience.length > 0 && (
        <motion.section
          id="experience"
          className="experience-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Experience
          </motion.h2>
          <div className="timeline">
            {experience.map((exp, index) => (
              <motion.div
                key={exp.id}
                className="timeline-item"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ x: 10 }}
              >
                <div className="timeline-content">
                  <h3>{exp.position}</h3>
                  <h4>{exp.company}</h4>
                  <p className="timeline-date">
                    {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                  </p>
                  <p>{exp.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <motion.section
          id="education"
          className="education-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Education
          </motion.h2>
          <div className="education-grid">
            {education.map((edu, index) => (
              <motion.div
                key={edu.id}
                className="education-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <h3>{edu.degree}</h3>
                <h4>{edu.institution}</h4>
                {edu.field && <p>{edu.field}</p>}
                <p className="education-date">
                  {edu.start_date} - {edu.end_date}
                </p>
                {edu.grade && <p>Grade: {edu.grade}</p>}
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Contact Section */}
      <motion.section
        id="contact"
        className="contact-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Get In Touch
        </motion.h2>
        <motion.form
          onSubmit={handleContactSubmit}
          className="contact-form"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.input
            type="text"
            placeholder="Your Name"
            value={contactForm.name}
            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
            required
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
          <motion.input
            type="email"
            placeholder="Your Email"
            value={contactForm.email}
            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
            required
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
          <motion.input
            type="text"
            placeholder="Subject"
            value={contactForm.subject}
            onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
          <motion.textarea
            placeholder="Your Message"
            value={contactForm.message}
            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
            required
            rows="5"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send Message
          </motion.button>
          {submitStatus === 'success' && (
            <motion.p
              className="success-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              Message sent successfully!
            </motion.p>
          )}
          {submitStatus === 'error' && (
            <motion.p
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              Failed to send message. Please try again.
            </motion.p>
          )}
        </motion.form>
      </motion.section>

        {/* Footer */}
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} {about?.title || 'Portfolio'}. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};

export default Home;
