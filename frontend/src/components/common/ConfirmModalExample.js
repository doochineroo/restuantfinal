import React from 'react';
import ConfirmModal from './ConfirmModal';
import useConfirmModal from '../../hooks/useConfirmModal';

const ConfirmModalExample = () => {
  const { modalState, showConfirm, hideConfirm, handleConfirm } = useConfirmModal();

  const handleDelete = () => {
    showConfirm({
      title: "삭제 확인",
      message: "정말로 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.",
      confirmText: "삭제하기",
      cancelText: "취소",
      type: "danger",
      onConfirm: () => {
        console.log('삭제 실행');
        alert('삭제되었습니다.');
      }
    });
  };

  const handleSave = () => {
    showConfirm({
      title: "저장 확인",
      message: "변경사항을 저장하시겠습니까?",
      confirmText: "저장하기",
      cancelText: "취소",
      type: "success",
      onConfirm: () => {
        console.log('저장 실행');
        alert('저장되었습니다.');
      }
    });
  };

  const handleWarning = () => {
    showConfirm({
      title: "주의",
      message: "이 작업은 시간이 오래 걸릴 수 있습니다. 계속하시겠습니까?",
      confirmText: "계속하기",
      cancelText: "취소",
      type: "warning",
      onConfirm: () => {
        console.log('경고 작업 실행');
        alert('작업을 시작합니다.');
      }
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>공용 확인 팝업 사용 예시</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={handleDelete} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}>
          삭제 (Danger)
        </button>
        
        <button onClick={handleSave} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>
          저장 (Success)
        </button>
        
        <button onClick={handleWarning} style={{ padding: '10px 20px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '5px' }}>
          경고 (Warning)
        </button>
      </div>

      {/* 공용 확인 팝업 */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={hideConfirm}
        onConfirm={handleConfirm}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        type={modalState.type}
      />
    </div>
  );
};

export default ConfirmModalExample;

