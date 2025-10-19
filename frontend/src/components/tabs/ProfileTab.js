import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../demo/context/AuthContext';
import './ProfileTab.css';

const ProfileTab = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // 프로필 업데이트 로직
    console.log('프로필 저장:', formData);
    setIsEditing(false);
    alert('프로필이 업데이트되었습니다.');
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout();
      navigate('/login');
    }
  };

  const getRoleName = (role) => {
    const roles = {
      ADMIN: '관리자',
      OWNER: '사장님',
      USER: '일반 회원'
    };
    return roles[role] || role;
  };

  return (
    <div className="profile-tab">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          <div className="profile-info">
            <h2>{user?.name || '사용자'}</h2>
            <p>{user?.email}</p>
            <span className="role-badge">{getRoleName(user?.role)}</span>
          </div>
        </div>

        <div className="profile-details">
          <h3>회원 정보</h3>
          
          <div className="form-group">
            <label>이름</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
              />
            ) : (
              <div className="form-display">{formData.name}</div>
            )}
          </div>

          <div className="form-group">
            <label>이메일</label>
            <div className="form-display">{formData.email}</div>
          </div>

          <div className="form-group">
            <label>전화번호</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                placeholder="전화번호를 입력하세요"
              />
            ) : (
              <div className="form-display">{formData.phone || '등록되지 않음'}</div>
            )}
          </div>

          <div className="form-group">
            <label>가입일</label>
            <div className="form-display">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '정보없음'}
            </div>
          </div>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <div className="edit-actions">
              <button className="btn-save" onClick={handleSave}>
                저장
              </button>
              <button className="btn-cancel" onClick={handleCancel}>
                취소
              </button>
            </div>
          ) : (
            <div className="view-actions">
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                정보 수정
              </button>
              <button className="btn-logout" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProfileTab;
