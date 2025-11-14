import React from 'react';
import { Lesson, Resource } from '../types';

interface LessonViewerProps {
  lesson: Lesson | Resource | null;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onNextLesson: () => void;
}

const LessonViewer: React.FC<LessonViewerProps> = ({ lesson, isCompleted, onToggleComplete, onNextLesson }) => {
  if (!lesson) {
    return (
      <div className="lesson-viewer-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
        <h2>Welcome to your Classroom</h2>
        <p>Select a lesson from the sidebar to start learning.</p>
      </div>
    );
  }

  return (
    <div className="lesson-viewer">
      <header className="lesson-viewer-header">
        <h1>{lesson.title}</h1>
      </header>
      <main>
        <div className="lesson-viewer-iframe-container">
          <iframe
            src={lesson.url}
            className="lesson-viewer-iframe"
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="lesson-actions">
            <button
                className={`action-button complete-button ${isCompleted ? 'completed' : ''}`}
                onClick={onToggleComplete}
            >
                {isCompleted ? 'Completed' : 'Mark as Complete'}
            </button>
            <button className="action-button next-button" onClick={onNextLesson}>
                Next Lesson
            </button>
        </div>
      </main>
    </div>
  );
};

export default LessonViewer;