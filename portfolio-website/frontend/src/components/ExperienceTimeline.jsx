import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBriefcase, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';
import './ExperienceTimeline.css';

const ExperienceTimeline = ({ experiences }) => {
  const [selectedExperience, setSelectedExperience] = useState(null);

  return (
    <>
      <div className="timeline-container">
        <div className="timeline-line" />

        {experiences.map((exp, index) => (
          <motion.div
            key={exp.id}
            className="timeline-node"
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className={`timeline-content ${index % 2 === 0 ? 'left' : 'right'}`}>
              <motion.div
                className="timeline-card"
                whileHover={{ scale: 1.03 }}
                onClick={() => setSelectedExperience(exp)}
              >
                <div className="timeline-card-header">
                  <h3>{exp.position}</h3>
                  <span className="company">{exp.company}</span>
                </div>
                <div className="timeline-card-meta">
                  <span className="date">
                    <FaCalendar /> {exp.start_date} - {exp.end_date || 'Present'}
                  </span>
                  {exp.location && (
                    <span className="location">
                      <FaMapMarkerAlt /> {exp.location}
                    </span>
                  )}
                </div>
                <button className="view-details-btn">View Details</button>
              </motion.div>
            </div>

            <motion.div
              className="timeline-dot"
              whileHover={{ scale: 1.5 }}
              onClick={() => setSelectedExperience(exp)}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
            >
              <div className="dot-inner" />
              <div className="dot-pulse" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Experience Detail Modal */}
      <AnimatePresence>
        {selectedExperience && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedExperience(null)}
          >
            <motion.div
              className="modal-content experience-modal"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedExperience(null)}>
                <FaTimes />
              </button>

              <div className="modal-header">
                <div className="modal-icon">
                  <FaBriefcase />
                </div>
                <div>
                  <h2>{selectedExperience.position}</h2>
                  <h3>{selectedExperience.company}</h3>
                </div>
              </div>

              <div className="modal-body">
                <div className="experience-meta">
                  <div className="meta-item">
                    <FaCalendar />
                    <span>{selectedExperience.start_date} - {selectedExperience.end_date || 'Present'}</span>
                  </div>
                  {selectedExperience.location && (
                    <div className="meta-item">
                      <FaMapMarkerAlt />
                      <span>{selectedExperience.location}</span>
                    </div>
                  )}
                </div>

                {selectedExperience.description && (
                  <div className="experience-description">
                    <h4>Responsibilities & Achievements</h4>
                    <p>{selectedExperience.description}</p>
                  </div>
                )}

                {selectedExperience.technologies && (
                  <div className="experience-technologies">
                    <h4>Technologies Used</h4>
                    <div className="tech-tags">
                      {selectedExperience.technologies.split(',').map((tech, i) => (
                        <span key={i} className="tech-tag">{tech.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExperienceTimeline;
