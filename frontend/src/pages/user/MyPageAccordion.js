import React, { useState } from 'react';
import { useAuth } from '../../demo/context/AuthContext';
import TopNav from '../../components/navigation/TopNav';
import MainNav from '../../components/navigation/MainNav';
import ProfileSection from '../../components/sections/ProfileSection';
import SettingsSection from '../../components/sections/SettingsSection';
import NotificationsSection from '../../components/sections/NotificationsSection';
import FavoritesModal from '../../components/modals/FavoritesModal';
import './MyPageAccordion.css';

const MyPageAccordion = () => {
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    profile: true, // 기본적으로 프로필 섹션 열림
    settings: true,
    notifications: true
  });
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const handleFavoritesClick = () => {
    setIsFavoritesModalOpen(true);
  };

  const sections = [
    { 
      id: 'profile', 
      title: '프로필', 
      icon: '', 
      component: ProfileSection 
    },
    { 
      id: 'settings', 
      title: '설정', 
      icon: '', 
      component: SettingsSection 
    },
    { 
      id: 'notifications', 
      title: '알림', 
      icon: '', 
      component: NotificationsSection 
    }
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="my-page-accordion">
      <TopNav />
      <MainNav />
      
      <div className="my-page-container">

        <div className="accordion-container">
          {/* 찜한 맛집 섹션 - 모달로 열기 */}
          <div className="accordion-section favorites-section-modal">
            <div 
              className="accordion-header"
              onClick={handleFavoritesClick}
            >
              <div className="section-info">
                <span className="section-icon"></span>
                <span className="section-title">찜한 맛집</span>
              </div>
              <div className="section-toggle">
                <span className="toggle-icon">→</span>
              </div>
            </div>
          </div>

          {/* 나머지 섹션들 */}
          {sections.map(({ id, title, icon, component: Component }) => (
            <div key={id} className={`accordion-section ${expandedSections[id] ? 'expanded' : ''}`}>
              <div 
                className="accordion-header"
                onClick={() => toggleSection(id)}
              >
                <div className="section-info">
                  <span className="section-icon">{icon}</span>
                  <span className="section-title">{title}</span>
                </div>
                <div className="section-toggle">
                  <span className={`toggle-icon ${expandedSections[id] ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>
              
              <div className={`accordion-content ${expandedSections[id] ? 'expanded' : ''}`}>
                <div className="content-wrapper">
                  <Component />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 찜한 맛집 모달 */}
      <FavoritesModal 
        isOpen={isFavoritesModalOpen}
        onClose={() => setIsFavoritesModalOpen(false)}
      />
    </div>
  );
};

export default MyPageAccordion;
