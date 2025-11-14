import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { COURSES } from './constants';
import { Course, Lesson, Resource } from './types';
import Sidebar from './components/Sidebar';
import LessonViewer from './components/LessonViewer';
import CourseGrid from './components/CourseGrid';
import DashboardHeader from './components/DashboardHeader';
import { supabase } from './services/supabase';
import type { Session } from '@supabase/supabase-js';
import AuthModal from './components/AuthModal';

const getAllLessonsAndResources = (course: Course): (Lesson | Resource)[] => {
  let items: (Lesson | Resource)[] = [];
  if (course.modules) {
    for (const module of course.modules) {
      if (module.lessons) {
        items = items.concat(module.lessons);
      }
    }
  }
  if (course.resources) {
    items = items.concat(course.resources);
  }
  if (course.subCourses) {
    for (const subCourse of course.subCourses) {
      items = items.concat(getAllLessonsAndResources(subCourse));
    }
  }
  return items;
};

const isCourseCompleted = (course: Course, completedLessons: Set<string>): boolean => {
  const allItems = getAllLessonsAndResources(course);
  if (allItems.length === 0) return true; // A course with no lessons is considered complete.
  return allItems.every(item => completedLessons.has(item.id));
};

const LockIconModal = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLockedModalOpen, setIsLockedModalOpen] = useState(false);
  const [courseToOpen, setCourseToOpen] = useState<Course | null>(null);

  const [selectedClassroom, setSelectedClassroom] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | Resource | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);


  // Handle user session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
       // If no session is found, stop loading.
      if (!session) {
        setIsLoadingProgress(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && courseToOpen) {
        setIsAuthModalOpen(false);
        // Navigate to the course that was clicked before the modal opened
        if (courseToOpen.subCourses && courseToOpen.subCourses.length > 0) {
            setSelectedClassroom(courseToOpen);
            setSelectedCourse(null);
        } else {
            const isTopLevel = COURSES.some(c => c.id === courseToOpen.id);
            if (isTopLevel) {
                setSelectedClassroom(null);
            }
            setSelectedCourse(courseToOpen);
        }
        setActiveLesson(null);
        setCourseToOpen(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [courseToOpen]);


  // Load/clear progress from Supabase based on session
  useEffect(() => {
    const fetchProgress = async () => {
      if (session) {
        setIsLoadingProgress(true);
        const { data, error } = await supabase
          .from('user_progress')
          .select('completed_ids')
          .eq('user_id', session.user.id)
          .single();

        if (data && data.completed_ids) {
          setCompletedLessons(new Set(data.completed_ids));
        } else {
          setCompletedLessons(new Set());
        }
        if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
          console.error("Error fetching user progress:", error.message);
        }
        setIsLoadingProgress(false);
      } else {
        // No session, so clear progress and stop loading.
        setCompletedLessons(new Set());
        setIsLoadingProgress(false);
      }
    };

    fetchProgress();
  }, [session]);

  // Save progress to Supabase
  useEffect(() => {
    if (session && !isLoadingProgress) {
      const saveProgress = async () => {
        const { error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: session.user.id,
            completed_ids: Array.from(completedLessons),
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          console.error("Error saving user progress:", error.message);
        }
      };
      // Debouncing this would be ideal in a real-world app
      saveProgress();
    }
  }, [completedLessons, session, isLoadingProgress]);


  const allCourseItems = useMemo(() => {
    if (!selectedCourse) return [];
    return getAllLessonsAndResources(selectedCourse);
  }, [selectedCourse]);
  
  const unlockedCourseIndex = useMemo(() => {
    if (!session || isLoadingProgress) return -1;
    const firstIncompleteIndex = COURSES.findIndex(course => !isCourseCompleted(course, completedLessons));
    return firstIncompleteIndex === -1 ? COURSES.length : firstIncompleteIndex;
  }, [completedLessons, session, isLoadingProgress]);

  const completedCount = useMemo(() => {
    if (!selectedCourse) return 0;
    return allCourseItems.filter(item => completedLessons.has(item.id)).length;
  }, [completedLessons, allCourseItems, selectedCourse]);

  const toggleLessonComplete = useCallback((itemId: string) => {
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const handleNextLesson = useCallback(() => {
    if (!activeLesson || !selectedCourse) return;
    
    const currentIndex = allCourseItems.findIndex(item => item.id === activeLesson.id);
    if (currentIndex > -1 && currentIndex < allCourseItems.length - 1) {
      const nextLesson = allCourseItems[currentIndex + 1];
      setActiveLesson(nextLesson);
    }
  }, [activeLesson, selectedCourse, allCourseItems]);


  const handleSelectTopLevelCourse = (course: Course, index: number) => {
    if (!session) {
      setCourseToOpen(course);
      setIsAuthModalOpen(true);
      return;
    }

    if (index > unlockedCourseIndex) {
      setIsLockedModalOpen(true);
      return;
    }
    
    if (course.subCourses && course.subCourses.length > 0) {
      setSelectedClassroom(course);
      setSelectedCourse(null);
    } else {
      setSelectedClassroom(null);
      setSelectedCourse(course);
    }
    setActiveLesson(null);
  };

  const handleSelectSubCourse = (course: Course) => {
    if (!session) {
      setCourseToOpen(course);
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedCourse(course);
    setActiveLesson(null);
  };

  const handleBackToHome = () => {
    setSelectedClassroom(null);
    setSelectedCourse(null);
    setActiveLesson(null);
  };
  
  const handleBackToClassroom = () => {
    setSelectedCourse(null);
    setActiveLesson(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    handleBackToHome();
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };
  
  const renderContent = () => {
    if (isLoadingProgress) {
        return (
          <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading your progress...</p>
          </div>
        );
    }

    if (selectedCourse) {
      const onBack = selectedClassroom ? handleBackToClassroom : handleBackToHome;
      const backButtonText = selectedClassroom ? `Back to ${selectedClassroom.title}` : "Learn with Raftaar";
  
      return (
        <div className="dashboard-layout">
          <Sidebar
            course={selectedCourse}
            activeLesson={activeLesson}
            completedLessons={completedLessons}
            onLessonClick={setActiveLesson}
            onBack={onBack}
            backButtonText={backButtonText}
            isVisible={isSidebarVisible}
            onToggle={toggleSidebar}
          />
          <div className="main-content-wrapper">
            <DashboardHeader 
              courseTitle={selectedCourse.title}
              completedCount={completedCount}
              totalCount={allCourseItems.length}
              onLogout={handleLogout}
            />
            <main className="main-content">
              <LessonViewer 
                lesson={activeLesson} 
                isCompleted={activeLesson ? completedLessons.has(activeLesson.id) : false}
                onToggleComplete={() => activeLesson && toggleLessonComplete(activeLesson.id)}
                onNextLesson={handleNextLesson}
              />
            </main>
          </div>
        </div>
      );
    }
  
    if (selectedClassroom) {
      return (
        <CourseGrid
          courses={selectedClassroom.subCourses || []}
          onCourseClick={handleSelectSubCourse}
          title={selectedClassroom.title}
          subtitle={`Welcome to the ${selectedClassroom.title} classroom. Select a course to begin.`}
          onBack={handleBackToHome}
        />
      );
    }
  
    return (
      <CourseGrid
        courses={COURSES}
        onCourseClick={(course, index) => handleSelectTopLevelCourse(course, index!)}
        title="Learn with Raftaar"
        subtitle="Select a course to begin your learning journey."
        completedLessons={session ? completedLessons : undefined}
        unlockedCourseIndex={unlockedCourseIndex}
      />
    );
  }

  return (
    <>
      {renderContent()}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setCourseToOpen(null);
        }}
      />
       {isLockedModalOpen && (
        <div className="auth-modal-overlay" onClick={() => setIsLockedModalOpen(false)}>
            <div className="auth-modal-content info-modal-content" onClick={(e) => e.stopPropagation()}>
                <LockIconModal />
                <h2>Course Locked</h2>
                <p>Please complete all previous courses to unlock this one.</p>
                <button className="info-modal-button" onClick={() => setIsLockedModalOpen(false)}>
                    Got it
                </button>
            </div>
        </div>
      )}
    </>
  );
};

export default App;