import React, { useState } from 'react';
import { Course, Lesson, Resource } from '../types';

interface SidebarProps {
  course: Course;
  activeLesson: Lesson | Resource | null;
  completedLessons: Set<string>;
  onLessonClick: (lesson: Lesson | Resource) => void;
  onBack: () => void;
  backButtonText: string;
  isVisible: boolean;
  onToggle: () => void;
}

const ArrowIcon: React.FC<{ expanded: boolean }> = ({ expanded }) => (
    <svg 
        className={`arrow ${expanded ? 'expanded' : ''}`}
        width="16" height="16" viewBox="0 0 24 24" fill="none" 
        xmlns="http://www.w3.org/2000/svg" stroke="currentColor" 
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
        <path d="M9 18l6-6-6-6"/>
    </svg>
);

const BackButton: React.FC<{ onClick: () => void; text: string }> = ({ onClick, text }) => (
    <button className="back-button" onClick={onClick}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {text}
    </button>
);

const ToggleButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button className="sidebar-toggle" onClick={onClick} aria-label="Toggle sidebar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    </button>
);

const CompletedIcon: React.FC = () => (
  <svg className="completed-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const CourseSection: React.FC<{ 
    course: Course; 
    activeLesson: Lesson | Resource | null;
    completedLessons: Set<string>;
    onLessonClick: (lesson: Lesson | Resource) => void;
    expandedModules: { [key: string]: boolean };
    toggleModule: (moduleId: string) => void;
}> = ({ course, activeLesson, completedLessons, onLessonClick, expandedModules, toggleModule }) => {
    
    return (
        <li>
            <h3 className="sidebar-course-title">{course.title}</h3>
            {course.modules && course.modules.length > 0 && (
                 <ul className="sidebar-module-item">
                    {course.modules.map(module => (
                        <li key={module.id}>
                            <div className="sidebar-module-header" onClick={() => module.lessons && module.lessons.length > 0 && toggleModule(module.id)}>
                                <span>{module.title}</span>
                                {module.lessons && module.lessons.length > 0 && <ArrowIcon expanded={!!expandedModules[module.id]} />}
                            </div>
                            {module.lessons && module.lessons.length > 0 && (
                                <ul className={`sidebar-lesson-list ${expandedModules[module.id] ? 'expanded' : ''}`}>
                                    {module.lessons.map(lesson => (
                                        <li key={lesson.id} className="sidebar-lesson-item">
                                            <a
                                                className={activeLesson?.id === lesson.id ? 'active' : ''}
                                                onClick={() => onLessonClick(lesson)}
                                                onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') onLessonClick(lesson)}}
                                                role="button"
                                                tabIndex={0}
                                            >
                                                <span>{lesson.title}</span>
                                                {completedLessons.has(lesson.id) && <CompletedIcon />}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                 </ul>
            )}
            {course.resources && course.resources.length > 0 && (
              <>
                <h4 className="sidebar-resources-header">Resources</h4>
                <ul className="sidebar-resource-list">
                  {course.resources.map(resource => (
                    <li key={resource.id} className="sidebar-resource-item">
                        <a
                            className={activeLesson?.id === resource.id ? 'active' : ''}
                            onClick={() => onLessonClick(resource)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onLessonClick(resource) }}
                            role="button"
                            tabIndex={0}
                        >
                            <span>{resource.title}</span>
                            {completedLessons.has(resource.id) && <CompletedIcon />}
                        </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
        </li>
    );
}

const Sidebar: React.FC<SidebarProps> = ({ course, activeLesson, completedLessons, onLessonClick, onBack, backButtonText, isVisible, onToggle }) => {
  const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({});

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  return (
    <div className={`sidebar-container ${!isVisible ? 'hidden' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-content">
          <header className="sidebar-header">
            <BackButton onClick={onBack} text={backButtonText} />
          </header>
          <nav>
            <ul className="sidebar-nav">
              <CourseSection
                key={course.id}
                course={course}
                activeLesson={activeLesson}
                completedLessons={completedLessons}
                onLessonClick={onLessonClick}
                expandedModules={expandedModules}
                toggleModule={toggleModule}
              />
            </ul>
          </nav>
        </div>
      </aside>
      <ToggleButton onClick={onToggle} />
    </div>
  );
};

export default Sidebar;