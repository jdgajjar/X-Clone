import React from "react";

function DeleteMessageModal({ open, onClose, onDeleteForMe, onDeleteForEveryone }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.45)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }} onClick={onClose}>
      <div
        style={{
          background: '#23272f',
          borderRadius: 16,
          padding: '32px 24px 20px 24px',
          minWidth: 280,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ color: '#fff', fontWeight: 600, fontSize: 18, marginBottom: 18, textAlign: 'center' }}>
          Delete message?
        </div>
        <button
          style={{
            background: '#1d9bf0',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontWeight: 600,
            fontSize: 16,
            marginBottom: 12,
            width: '100%',
            cursor: 'pointer',
            transition: 'background 0.18s',
          }}
          onClick={e => {
            e.stopPropagation();
            onDeleteForMe && onDeleteForMe();
          }}
        >
          Delete for you
        </button>
        <button
          style={{
            background: '#e0245e',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontWeight: 600,
            fontSize: 16,
            marginBottom: 8,
            width: '100%',
            cursor: 'pointer',
            transition: 'background 0.18s',
          }}
          onClick={e => {
            e.stopPropagation();
            onDeleteForEveryone && onDeleteForEveryone();
          }}
        >
          Delete for everyone
        </button>
        <button
          style={{
            background: 'transparent',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 0 0 0',
            fontWeight: 400,
            fontSize: 15,
            width: '100%',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default DeleteMessageModal;
