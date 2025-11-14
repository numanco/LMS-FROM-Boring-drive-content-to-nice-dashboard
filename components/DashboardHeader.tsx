import React from 'react';

interface DashboardHeaderProps {
  courseTitle: string;
  completedCount: number;
  totalCount: number;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ courseTitle, completedCount, totalCount, onLogout }) => {
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <header className="dashboard-header">
      <div className="progress-container">
        <div className="progress-info">
          <h2>{courseTitle}</h2>
          <span>{completedCount} / {totalCount} Lessons Completed</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>
      <button className="logout-button" onClick={onLogout}>
        Logout
      </button>
    </header>
  );
};

export default DashboardHeader;