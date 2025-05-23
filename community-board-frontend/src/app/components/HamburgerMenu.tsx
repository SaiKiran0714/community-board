import React, { useState } from 'react';
import { User } from '../types/user';

interface HamburgerMenuProps {
  isAuthenticated: boolean;
  currentUser: User | null;
  isAdmin: boolean;
  isAdminToggleLoading: boolean;
  onShowCsvUpload: () => void;
  onLogout: () => void;
  onAdminToggle: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isAuthenticated,
  currentUser,
  isAdmin,
  isAdminToggleLoading,
  onShowCsvUpload,
  onLogout,
  onAdminToggle,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {/* Hamburger Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          padding: '8px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{
          width: '20px',
          height: '2px',
          backgroundColor: '#1a1a1a',
          transition: 'transform 0.2s ease',
          transform: isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
        }} />
        <div style={{
          width: '20px',
          height: '2px',
          backgroundColor: '#1a1a1a',
          opacity: isOpen ? 0 : 1,
          transition: 'opacity 0.2s ease'
        }} />
        <div style={{
          width: '20px',
          height: '2px',
          backgroundColor: '#1a1a1a',
          transition: 'transform 0.2s ease',
          transform: isOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
        }} />
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 90
            }}
          />
          
          {/* Menu Items */}
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: '240px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            padding: '8px',
            zIndex: 100,
            marginTop: '8px'
          }}>
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div style={{
                  padding: '12px',
                  borderBottom: '1px solid #E8E1D5',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#1a1a1a'
                  }}>
                    {currentUser?.name || currentUser?.email}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#666666',
                    marginTop: '4px'
                  }}>
                    {currentUser?.email}
                  </div>
                </div>

                {/* Menu Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {/* Upload Users */}
                  <button
                    onClick={() => {
                      onShowCsvUpload();
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#1a1a1a',
                      fontSize: '13px',
                      ':hover': {
                        backgroundColor: '#F5F1E8'
                      }
                    }}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Upload Users
                  </button>

                  {/* Your Profile */}
                  <a
                    href="/profile"
                    style={{
                      padding: '8px 12px',
                      textDecoration: 'none',
                      color: '#1a1a1a',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderRadius: '4px'
                    }}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Your Profile
                  </a>

                  {/* Admin Mode Toggle */}
                  {currentUser && (
                    <button
                      onClick={() => {
                        onAdminToggle();
                        setIsOpen(false);
                      }}
                      disabled={isAdminToggleLoading}
                      style={{
                        padding: '8px 12px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: isAdminToggleLoading ? 'wait' : 'pointer',
                        opacity: isAdminToggleLoading ? 0.7 : 1,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#1a1a1a',
                        fontSize: '13px'
                      }}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin Mode
                      <div style={{
                        width: '32px',
                        height: '18px',
                        backgroundColor: isAdmin ? '#3b82f6' : '#E8E1D5',
                        borderRadius: '9px',
                        position: 'relative',
                        marginLeft: 'auto',
                        transition: 'background-color 0.2s ease'
                      }}>
                        <div style={{
                          width: '14px',
                          height: '14px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          position: 'absolute',
                          top: '2px',
                          left: isAdmin ? '16px' : '2px',
                          transition: 'left 0.2s ease'
                        }} />
                      </div>
                    </button>
                  )}

                  {/* Logout */}
                  <button
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#ef4444',
                      fontSize: '13px'
                    }}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '8px 12px',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#1a1a1a',
                  fontSize: '14px'
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}; 