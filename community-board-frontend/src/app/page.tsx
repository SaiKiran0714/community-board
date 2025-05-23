"use client";

import React from 'react';
import { useEffect, useState } from 'react';
import UserCard from './components/UserCard';
import { User } from './types/user';
import Papa from 'papaparse';
import { ParseResult } from 'papaparse';
import CsvImport from './components/CsvImport';
import { LoginModal } from './components/LoginModal';
import { useRouter } from 'next/navigation';
import { CsvUpload } from './components/CsvUpload';
import LoadingSpinner from './components/LoadingSpinner';
import { HamburgerMenu } from './components/HamburgerMenu';

export default function Home() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<('friday' | 'saturday')[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const [showOnlyMyProfile, setShowOnlyMyProfile] = useState(false);
  const [isAdminToggleLoading, setIsAdminToggleLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isImportLoading, setIsImportLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const userEmail = localStorage.getItem('userEmail');
        if (token && userEmail) {
          const res = await fetch(`http://127.0.0.1:5000/api/auth/verify?token=${token}&email=${userEmail}`);
          if (res.ok) {
            const data = await res.json();
            setIsAuthenticated(true);
            setIsAdmin(data.isAdmin);
            setCurrentUser(data.user);
          } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
            setIsAuthenticated(false);
            setIsAdmin(false);
            setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        setIsAuthenticated(false);
        setIsAdmin(false);
        setCurrentUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
      const res = await fetch('http://127.0.0.1:5000/api/users');
        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }
      const data = await res.json();
        const processedUsers = data.map((user: any): User => ({
          id: user.id || '',
          email: user.email || '',
          name: user.name || '',
          description: user.description || '',
          tags: user.tags || [],
          isActive: user.isActive ?? true,
          links: user.links || {},
          team: user.team || '',
          avatarUrl: user.avatarUrl || '',
          availableDays: Array.isArray(user.availableDays) ? user.availableDays : [],
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || new Date().toISOString()
        }));
        console.log('Processed users:', processedUsers);
        setUsers(processedUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setUsers([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: async (results: ParseResult<any>) => {
          try {
            const response = await fetch('http://127.0.0.1:5000/api/users/import', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
              },
              body: JSON.stringify({ data: results.data })
            });
            if (response.ok) {
              const updatedUsers = await response.json();
              setUsers(updatedUsers);
            }
          } catch (error) {
            console.error('Failed to import users:', error);
          }
        },
        header: true
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        alert('Check your email for the login link!');
        setShowLoginForm(false);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLoginSuccess = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userEmail = localStorage.getItem('userEmail');
      if (token && userEmail) {
        const res = await fetch(`http://127.0.0.1:5000/api/auth/verify?token=${token}&email=${userEmail}`);
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setIsAdmin(data.isAdmin);
          setCurrentUser(data.user);
        }
      }
    } catch (error) {
      console.error('Error verifying auth:', error);
    }
  };

  // Get all unique tags with their original capitalization
  const tagMap = new Map();
  users.forEach(user => {
    (user.tags || []).forEach(tag => {
      const lowerTag = tag.toLowerCase();
      // Keep the first occurrence of a tag (with its original capitalization)
      if (!tagMap.has(lowerTag)) {
        tagMap.set(lowerTag, tag);
      }
    });
  });
  
  // Convert the Map to a sorted array of original tags
  const allTags = Array.from(tagMap.values()).sort();

  const filtered = users.filter(u => {
    const matchesSearch = search === '' ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.description?.toLowerCase().includes(search.toLowerCase()) ||
      u.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => 
        u.tags?.some(userTag => userTag.toLowerCase() === tag.toLowerCase())
      );
    
    const matchesDays = selectedDays.length === 0 ||
      (Array.isArray(u.availableDays) && selectedDays.every(day => u.availableDays.includes(day)));
    
    const matchesOwnProfile = !showOnlyMyProfile || (currentUser && u.id === currentUser.id);
    
    return matchesSearch && matchesTags && matchesDays && matchesOwnProfile && u.isActive;
  });

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://127.0.0.1:5000/api/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userIds: [userId] })
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        const data = await response.json();
        console.error('Failed to delete user:', data.error);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleToggleAdmin = async (userId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://127.0.0.1:5000/api/users/${userId}/toggle-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update the user's admin status in the local state
        setUsers(users.map(u => 
          u.id === userId 
            ? { ...u, isAdmin: !u.isAdmin }
            : u
        ));
        alert(data.message);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to toggle admin status');
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
      alert('Failed to toggle admin status');
    }
  };

  if (loading || isAuthLoading) {
    return <LoadingSpinner fullScreen text={loading ? 'Loading users...' : 'Verifying authentication...'} />;
  }

  return (
    <div style={{ 
      maxWidth: '100vw',
      minHeight: '100vh',
      background: '#FDFBF7',
      color: '#1a1a1a',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Admin toggle loading overlay */}
      {isAdminToggleLoading && (
        <LoadingSpinner fullScreen text="Updating admin status..." />
      )}

      {/* Import loading overlay */}
      {isImportLoading && (
        <LoadingSpinner fullScreen text="Importing users..." />
      )}

      {/* Fixed Header */}
      <header style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '15px 20px',
        backgroundColor: '#F5F1E8',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #E8E1D5',
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1a1a1a'
            }}>Community Board</h1>
          </div>
          <div>
            {isAuthenticated ? (
              <HamburgerMenu
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                isAdmin={isAdmin}
                isAdminToggleLoading={isAdminToggleLoading}
                onShowCsvUpload={() => setShowCsvUpload(true)}
                onLogout={() => {
                  localStorage.removeItem('authToken');
                  setIsAuthenticated(false);
                  setIsAdmin(false);
                  setCurrentUser(null);
                }}
                onAdminToggle={async () => {
                  if (isAdminToggleLoading || !currentUser) return;
                  setIsAdminToggleLoading(true);
                  try {
                    const token = localStorage.getItem('authToken');
                    const response = await fetch(`http://127.0.0.1:5000/api/users/${currentUser.id}/toggle-admin`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      setIsAdmin(data.isAdmin);
                      // Refresh the page to update UI
                      window.location.reload();
                    }
                  } catch (error) {
                    console.error('Error toggling admin status:', error);
                  } finally {
                    setIsAdminToggleLoading(false);
                  }
                }}
              />
            ) : (
              <HamburgerMenu
                isAuthenticated={isAuthenticated}
                currentUser={null}
                isAdmin={false}
                isAdminToggleLoading={false}
                onShowCsvUpload={() => {}}
                onLogout={() => {}}
                onAdminToggle={() => {}}
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ 
        display: 'flex',
        minHeight: '100vh',
        paddingTop: '90px',
        flexDirection: 'column'
      }}>
        {/* Content Wrapper */}
        <div style={{
          display: 'flex',
          flex: 1
        }}>
          {/* Left Sidebar with Filters */}
          <div style={{
            width: '320px',
            backgroundColor: '#F5F1E8',
            borderRight: '1px solid #E8E1D5',
            flexShrink: 0
          }}>
            <div style={{ padding: '30px' }}>
              {/* Search Bar */}
              <div style={{ 
                marginBottom: '30px',
                position: 'relative',
                width: '100%'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666666',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
        <input
                  style={{ 
                    padding: '8px',
                    paddingLeft: '36px',
                    width: '100%',
                    backgroundColor: '#FDFBF7',
                    border: '1px solid #E8E1D5',
                    color: '#1a1a1a',
                    fontSize: '13px',
                    borderRadius: '4px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Search by name, description, or skills.."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#D4C9B9';
                    e.target.style.boxShadow = '0 0 0 2px rgba(212, 201, 185, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E8E1D5';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#666666',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px'
                    }}
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* My Profile Filter - Add this before Available Days */}
              {isAuthenticated && (
                <div style={{ marginBottom: '30px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <span style={{ fontSize: '15px', fontWeight: '500', color: '#1a1a1a' }}>Profile View</span>
                  </div>
                  <button
                    onClick={() => setShowOnlyMyProfile(!showOnlyMyProfile)}
                    style={{ 
                      padding: '8px 12px',
                      width: '100%',
                      border: '1px solid #E8E1D5',
                      fontSize: '14px',
                      cursor: 'pointer',
                      backgroundColor: showOnlyMyProfile ? '#3b82f6' : '#FDFBF7',
                      color: showOnlyMyProfile ? 'white' : '#666666',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '4px'
                    }}
                  >
                    <span>Show Only My Profile</span>
                    {showOnlyMyProfile && (
                      <span style={{ fontSize: '10px' }}>✕</span>
                    )}
                  </button>
                </div>
              )}

              {/* Available Days */}
              <div style={{ marginBottom: '30px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <span style={{ fontSize: '15px', fontWeight: '500', color: '#1a1a1a' }}>Available Days</span>
                  {selectedDays.length > 0 && (
                    <button
                      onClick={() => setSelectedDays([])}
                      style={{ 
                        padding: '4px 8px',
                        fontSize: '12px',
                        color: '#666666',
                        border: '1px solid #E8E1D5',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {([
                    { id: 'friday', label: 'Friday' },
                    { id: 'saturday', label: 'Saturday' }
                  ] as const).map(({ id, label }) => {
                    const isSelected = selectedDays.includes(id);
                    const availableCount = users.filter(u => Array.isArray(u.availableDays) && u.availableDays.includes(id)).length;
                    
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedDays(prev =>
                          prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
                        )}
                        style={{ 
                          padding: '8px 12px',
                          border: '1px solid #E8E1D5',
                          fontSize: '14px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#3b82f6' : '#FDFBF7',
                          color: isSelected ? 'white' : '#666666',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderRadius: '4px',
                          width: '100%'
                        }}
                      >
                        <span>{label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>({availableCount})</span>
                          {isSelected && (
                            <span style={{ fontSize: '10px', marginLeft: '4px' }}>✕</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <span style={{ fontSize: '15px', fontWeight: '500', color: '#1a1a1a' }}>Skills & Interests</span>
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      style={{ 
                        padding: '4px 8px',
                        fontSize: '12px',
                        color: '#666666',
                        border: '1px solid #E8E1D5',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {allTags.map(tag => {
                    const isSelected = selectedTags.includes(tag as string);
                    const tagCount = users.filter(u => 
                      u.tags?.some(t => t.toLowerCase() === (tag as string).toLowerCase())
                    ).length;

                    return (
                      <button
                        key={tag as string}
                        onClick={() => setSelectedTags(prev =>
                          prev.includes(tag as string) ? prev.filter(t => t !== tag) : [...prev, tag as string]
                        )}
                        style={{ 
                          padding: '6px 10px',
                          border: '1px solid #E8E1D5',
                          fontSize: '14px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#3b82f6' : '#FDFBF7',
                          color: isSelected ? 'white' : '#666666',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span>{tag as string}</span>
                        <span style={{ 
                          fontSize: '12px', 
                          opacity: 0.8 
                        }}>({tagCount})</span>
                        {isSelected && (
                          <span style={{ fontSize: '10px' }}>✕</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Cards Content */}
            <div style={{ 
              padding: '30px',
              flex: 1
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, 200px)',
                gap: '5px',
                justifyContent: 'start',
                padding: '5px'
              }}>
                {filtered.map((user) => (
                  <div 
                    key={user.id} 
                    style={{
                      height: '260px',
                      margin: '5px'
                    }}
                  >
                    <UserCard 
                      user={user} 
                      isOwnProfile={currentUser?.id === user.id}
                      onDelete={handleDeleteUser}
                      isAdmin={currentUser?.isAdmin}
                      onToggleAdmin={handleToggleAdmin}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          backgroundColor: '#F5F1E8',
          borderTop: '1px solid #E8E1D5',
          padding: '30px 0',
          marginTop: 'auto'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingLeft: '350px',
            paddingRight: '30px'
          }}>
            <div style={{
              display: 'flex',
              gap: '20px',
              color: '#666666',
              fontSize: '13px'
            }}>
              <a href="#" style={{ color: '#666666', textDecoration: 'none' }}>About</a>
              <a href="#" style={{ color: '#666666', textDecoration: 'none' }}>Contact</a>
              <a href="#" style={{ color: '#666666', textDecoration: 'none' }}>Privacy Policy</a>
            </div>
            <div style={{ color: '#666666', fontSize: '13px' }}>
              © 2024 Community Board. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      {/* Custom scrollbar styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Main page scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #F5F1E8;
        }
        ::-webkit-scrollbar-thumb {
          background: #E8E1D5;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #D4C9B9;
        }
        
        body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
        }
        a:hover {
          text-decoration: underline;
        }
      ` }} />

      {/* Hidden CSV Import Component */}
      <div style={{ display: 'none' }}>
        <CsvImport onImportComplete={() => window.location.reload()} />
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

      {/* CSV Upload Modal */}
      {showCsvUpload && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowCsvUpload(false)}
              style={{
                position: 'absolute',
                right: '16px',
                top: '16px',
                border: 'none',
                background: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>

            <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Upload Users</h2>
            
            <CsvUpload
              onUploadSuccess={() => {
                setShowCsvUpload(false);
                window.location.reload();
              }}
              isAdmin={isAdmin}
              onLoadingChange={setIsImportLoading}
            />

            <div style={{ 
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f3f4f6',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>CSV Format</h3>
              <p style={{ marginBottom: '10px' }}>Your CSV file should have these columns:</p>
              <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>
                <li><strong>email</strong> (required)</li>
                <li><strong>name</strong> (required)</li>
                <li>description (optional)</li>
                <li>tags (optional, separate with semicolons)</li>
                <li>team (optional)</li>
                <li>available_days (optional, separate with semicolons)</li>
              </ul>
              <p>Example: <code>john@example.com,John Doe,Developer,python;react,Engineering,monday;wednesday</code></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}