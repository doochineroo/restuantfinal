import React, { useState, useEffect } from 'react';
import { useAuth } from '../../demo/context/AuthContext';
import './SettingsSection.css';

const SettingsSection = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    locationSharing: true,
    darkMode: false,
    language: 'ko'
  });

  useEffect(() => {
    loadUserSettings();
  }, [user]);

  const loadUserSettings = () => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const handleResetSettings = () => {
    if (window.confirm('모든 설정을 초기화하시겠습니까?')) {
      const defaultSettings = {
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        locationSharing: true,
        darkMode: false,
        language: 'ko'
      };
      setSettings(defaultSettings);
      localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      alert('계정 삭제 기능은 준비 중입니다.');
    }
  };

  return (
    <div className="settings-section">
      <div className="settings-group">
        <h3>알림 설정</h3>
        <div className="setting-item">
          <div className="setting-info">
            <label>이메일 알림</label>
            <p>예약 관련 이메일을 받습니다</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>푸시 알림</label>
            <p>예약 승인, 취소 등의 알림을 받습니다</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>마케팅 이메일</label>
            <p>프로모션 및 이벤트 정보를 받습니다</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.marketingEmails}
              onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-group">
        <h3>위치 및 개인정보</h3>
        <div className="setting-item">
          <div className="setting-info">
            <label>위치 공유</label>
            <p>근처 맛집 추천을 위해 위치를 사용합니다</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.locationSharing}
              onChange={(e) => handleSettingChange('locationSharing', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-group">
        <h3>앱 설정</h3>
        <div className="setting-item">
          <div className="setting-info">
            <label>다크 모드</label>
            <p>어두운 테마를 사용합니다</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

      </div>

    </div>
  );
};

export default SettingsSection;
