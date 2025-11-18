import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileDownload, FaInstagram, FaFacebook, FaPinterest, FaYoutube, FaGlobe, FaDribbble, FaBehance, FaMedium, FaStackOverflow, FaTiktok, FaWhatsapp, FaTelegram, FaDiscord, FaSlack, FaGoogleDrive } from 'react-icons/fa';
import { getAbout, getStack, getProjects, getExperience, getEducation, getSocialLinks, submitContact } from '../services/api';
import Navbar from '../components/Navbar';
import ProjectCarousel from '../components/ProjectCarousel';
import ExperienceTimeline from '../components/ExperienceTimeline';
import { useTypingEffect } from '../hooks/useTypingEffect';
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

  // Typing effect texts
  const typingTexts = [
    'A passionate tech person with a deep mind about AI and machine learning',
    'Building innovative solutions with cutting-edge technologies',
    'Transforming ideas into powerful digital experiences'
  ];
  const typedText = useTypingEffect(typingTexts, 80, 2500);

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
    Instagram: FaInstagram,
    Facebook: FaFacebook,
    Pinterest: FaPinterest,
    YouTube: FaYoutube,
    Youtube: FaYoutube,
    Dribbble: FaDribbble,
    Behance: FaBehance,
    Medium: FaMedium,
    StackOverflow: FaStackOverflow,
    'Stack Overflow': FaStackOverflow,
    TikTok: FaTiktok,
    Tiktok: FaTiktok,
    WhatsApp: FaWhatsapp,
    Whatsapp: FaWhatsapp,
    Telegram: FaTelegram,
    Discord: FaDiscord,
    Slack: FaSlack,
    'Google Drive': FaGoogleDrive,
    Drive: FaGoogleDrive,
    Website: FaGlobe,
    Globe: FaGlobe,
  };

  return (
    <>
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
                className="typing-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {typedText}<span className="typing-cursor">|</span>
              </motion.p>
              <motion.div
                className="social-links"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {socialLinks.map((link, index) => {
                  const Icon = iconMap[link.platform] || FaGlobe;
                  const hasCustomIcon = link.icon && link.icon.trim() !== '';

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
                      title={link.platform}
                    >
                      {hasCustomIcon ? (
                        <img
                          src={link.icon}
                          alt={link.platform}
                          style={{
                            width: 28,
                            height: 28,
                            objectFit: 'contain',
                            filter: 'brightness(0) invert(1)'
                          }}
                        />
                      ) : (
                        <Icon size={28} />
                      )}
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h2>About Me</h2>
          <div className="about-content">
            {about.profile_image && (
              <div className="about-image">
                <img
                  src={about.profile_image}
                  alt={about.title || 'Profile'}
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="about-info">
              <p>{about.description}</p>
              {about.email && (
                <div className="contact-info">
                  <FaEnvelope /> {about.email}
                </div>
              )}
              {about.phone && (
                <div className="contact-info">
                  <FaPhone /> {about.phone}
                </div>
              )}
              {about.location && (
                <div className="contact-info">
                  <FaMapMarkerAlt /> {about.location}
                </div>
              )}
              {about.resume_url && (
                <div className="contact-info">
                  <a
                    href={about.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resume-link"
                  >
                    <FaFileDownload /> Download Resume
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* Stack Section */}
      {stack.length > 0 && (
        <motion.section
          id="stack"
          className="stack-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h2>Tech Stack</h2>
          <div className="stack-grid">
            {stack.map((item) => (
              <div
                key={item.id}
                className="stack-item"
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
                  <div
                    className="proficiency-fill"
                    style={{ width: `${item.proficiency || 80}%` }}
                  />
                </div>
                {item.proficiency != null && (
                  <div style={{ marginTop: 8, fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    {item.proficiency}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Projects Section */}
      {projects.length > 0 && (
        <motion.section
          id="projects"
          className="projects-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h2>Projects</h2>
          <ProjectCarousel projects={projects} />
        </motion.section>
      )}

      {/* Experience Section */}
      {experience.length > 0 && (
        <motion.section
          id="experience"
          className="experience-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h2>Experience</h2>
          <ExperienceTimeline experiences={experience} />
        </motion.section>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <motion.section
          id="education"
          className="education-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h2>Education</h2>
          <div className="education-grid">
            {education.map((edu) => (
              <div
                key={edu.id}
                className="education-card"
              >
                <h3>{edu.degree}</h3>
                <h4>{edu.institution}</h4>
                {edu.field && <p>{edu.field}</p>}
                <p className="education-date">
                  {edu.start_date} - {edu.end_date}
                </p>
                {edu.grade && <p>Grade: {edu.grade}</p>}
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Contact Section */}
      <motion.section
        id="contact"
        className="contact-section"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h2>Get In Touch</h2>
        <form
          onSubmit={handleContactSubmit}
          className="contact-form"
        >
          <input
            type="text"
            placeholder="Your Name"
            value={contactForm.name}
            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={contactForm.email}
            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Subject"
            value={contactForm.subject}
            onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
          />
          <textarea
            placeholder="Your Message"
            value={contactForm.message}
            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
            required
            rows="5"
          />
          <button type="submit">
            Send Message
          </button>
          {submitStatus === 'success' && (
            <p className="success-message">
              Message sent successfully!
            </p>
          )}
          {submitStatus === 'error' && (
            <p className="error-message">
              Failed to send message. Please try again.
            </p>
          )}
        </form>
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
