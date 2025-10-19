import React from 'react';
import NotificationModal from './NotificationModal';
import useNotification from '../../hooks/useNotification';

const NotificationExample = () => {
  const { notificationState, showSuccess, showError, showWarning, showInfo, hideNotification } = useNotification();

  const handleSuccess = () => {
    showSuccess('작업이 성공적으로 완료되었습니다!', '성공');
  };

  const handleError = () => {
    showError('오류가 발생했습니다. 다시 시도해주세요.', '오류');
  };

  const handleWarning = () => {
    showWarning('이 작업은 되돌릴 수 없습니다.', '주의');
  };

  const handleInfo = () => {
    showInfo('새로운 기능이 추가되었습니다.', '알림');
  };

  const handleAutoClose = () => {
    showSuccess('3초 후 자동으로 닫힙니다.', '자동 닫기', { autoClose: true, autoCloseDelay: 3000 });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>공용 알림 팝업 사용 예시</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={handleSuccess} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>
          성공 알림
        </button>
        
        <button onClick={handleError} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}>
          오류 알림
        </button>
        
        <button onClick={handleWarning} style={{ padding: '10px 20px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '5px' }}>
          경고 알림
        </button>
        
        <button onClick={handleInfo} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
          정보 알림
        </button>
        
        <button onClick={handleAutoClose} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px' }}>
          자동 닫기
        </button>
      </div>

      {/* 공용 알림 팝업 */}
      <NotificationModal
        isOpen={notificationState.isOpen}
        onClose={hideNotification}
        type={notificationState.type}
        title={notificationState.title}
        message={notificationState.message}
        buttonText={notificationState.buttonText}
        autoClose={notificationState.autoClose}
        autoCloseDelay={notificationState.autoCloseDelay}
      />
    </div>
  );
};

export default NotificationExample;

