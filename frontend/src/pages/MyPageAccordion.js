import React, { useState } from 'react';
import { useAuth } from '../demo/context/AuthContext';
import TopNav from '../components/TopNav';
import MainNav from '../components/MainNav';
import ProfileSection from '../components/ProfileSection';
import FavoritesSection from '../components/FavoritesSection';
import SettingsSection from '../components/SettingsSection';
import NotificationsSection from '../components/NotificationsSection';
import './MyPageAccordion.css';

const MyPageAccordion = () => {
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    profile: true, // 기본적으로 프로필 섹션 열림
    favorites: true,
    settings: true,
    notifications: true
  });

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const sections = [
    { 
      id: 'profile', 
      title: '프로필', 
      icon: '', 
      component: ProfileSection 
    },
    { 
      id: 'favorites', 
      title: '찜한 맛집', 
      icon: '', 
      component: FavoritesSection 
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
    </div>
  );
};

export default MyPageAccordion;
