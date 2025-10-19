# 공용 팝업 컴포넌트

재사용 가능한 팝업 컴포넌트들입니다. 다양한 상황에서 일관된 사용자 경험을 제공합니다.

## 1. 확인 팝업 (ConfirmModal)

사용자에게 확인을 요청하는 팝업입니다.

## 사용법

### 1. 기본 사용법

```jsx
import React from 'react';
import ConfirmModal from '../common/ConfirmModal';
import useConfirmModal from '../../hooks/useConfirmModal';

const MyComponent = () => {
  const { modalState, showConfirm, hideConfirm, handleConfirm } = useConfirmModal();

  const handleAction = () => {
    showConfirm({
      title: "확인",
      message: "정말로 진행하시겠습니까?",
      confirmText: "확인",
      cancelText: "취소",
      type: "default",
      onConfirm: () => {
        // 확인 버튼 클릭 시 실행할 로직
        console.log('확인됨');
      }
    });
  };

  return (
    <div>
      <button onClick={handleAction}>액션 실행</button>
      
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
```

### 2. 다양한 타입 사용

```jsx
// 위험한 작업 (삭제 등)
showConfirm({
  title: "삭제 확인",
  message: "정말로 삭제하시겠습니까?",
  confirmText: "삭제하기",
  cancelText: "취소",
  type: "danger",
  onConfirm: () => deleteItem()
});

// 성공적인 작업 (저장 등)
showConfirm({
  title: "저장 확인",
  message: "변경사항을 저장하시겠습니까?",
  confirmText: "저장하기",
  cancelText: "취소",
  type: "success",
  onConfirm: () => saveData()
});

// 경고 작업
showConfirm({
  title: "주의",
  message: "이 작업은 시간이 오래 걸릴 수 있습니다.",
  confirmText: "계속하기",
  cancelText: "취소",
  type: "warning",
  onConfirm: () => longRunningTask()
});
```

## Props

### ConfirmModal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | false | 모달 표시 여부 |
| `onClose` | function | - | 모달 닫기 함수 |
| `onConfirm` | function | - | 확인 버튼 클릭 함수 |
| `title` | string | "확인" | 모달 제목 |
| `message` | string | "정말로 진행하시겠습니까?" | 모달 메시지 |
| `confirmText` | string | "확인" | 확인 버튼 텍스트 |
| `cancelText` | string | "취소" | 취소 버튼 텍스트 |
| `type` | string | "default" | 모달 타입 (default, danger, warning, success) |

### useConfirmModal Hook

| Method | Description |
|--------|-------------|
| `showConfirm(options)` | 확인 팝업 표시 |
| `hideConfirm()` | 확인 팝업 숨기기 |
| `handleConfirm()` | 확인 버튼 클릭 처리 |
| `modalState` | 현재 모달 상태 |

## 타입별 스타일

- **default**: 기본 파란색 스타일
- **danger**: 빨간색 스타일 (삭제, 취소 등)
- **warning**: 노란색 스타일 (주의, 경고 등)
- **success**: 초록색 스타일 (저장, 승인 등)

## 2. 알림 팝업 (NotificationModal)

사용자에게 정보를 전달하는 알림 팝업입니다.

### 사용법

```jsx
import React from 'react';
import NotificationModal from '../common/NotificationModal';
import useNotification from '../../hooks/useNotification';

const MyComponent = () => {
  const { notificationState, showSuccess, showError, showWarning, showInfo, hideNotification } = useNotification();

  const handleAction = () => {
    showSuccess('작업이 완료되었습니다!', '성공');
  };

  return (
    <div>
      <button onClick={handleAction}>작업 실행</button>
      
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
```

### 편의 함수들

```jsx
// 성공 알림 (자동 닫기)
showSuccess('저장되었습니다!', '성공');

// 오류 알림
showError('오류가 발생했습니다.', '오류');

// 경고 알림
showWarning('이 작업은 되돌릴 수 없습니다.', '주의');

// 정보 알림 (자동 닫기)
showInfo('새로운 기능이 추가되었습니다.', '알림');
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | false | 모달 표시 여부 |
| `onClose` | function | - | 모달 닫기 함수 |
| `type` | string | "info" | 알림 타입 (success, error, warning, info) |
| `title` | string | "알림" | 모달 제목 |
| `message` | string | "" | 모달 메시지 |
| `buttonText` | string | "확인" | 버튼 텍스트 |
| `autoClose` | boolean | false | 자동 닫기 여부 |
| `autoCloseDelay` | number | 3000 | 자동 닫기 지연 시간 (ms) |

## 예시

실제 사용 예시는 다음 파일들을 참고하세요:
- `ConfirmModalExample.js` - 확인 팝업 예시
- `NotificationExample.js` - 알림 팝업 예시

## 장점

1. **일관된 UI**: 모든 팝업이 동일한 디자인
2. **재사용성**: 한 번 만들고 어디서든 사용
3. **커스터마이징**: 제목, 메시지, 버튼 텍스트 자유롭게 변경
4. **타입별 스타일**: 상황에 맞는 색상과 스타일
5. **접근성**: 키보드 네비게이션 지원
6. **반응형**: 모바일에서도 최적화된 디자인
7. **자동 닫기**: 성공/정보 알림은 자동으로 닫힘
8. **아이콘**: 타입별 직관적인 아이콘 표시
