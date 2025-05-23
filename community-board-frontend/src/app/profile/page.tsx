'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../types/user';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const res = await fetch('http://127.0.0.1:5000/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('authToken');
          router.push('/');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('authToken');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          name: user.name,
          description: user.description,
          tags: user.tags,
          is_active: user.isActive,
          links: user.links,
          team: user.team,
          available_days: user.availableDays
        })
      });

      if (res.ok) {
        setMessage('Profile updated successfully!');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      background: '#FDFBF7'
    }}>
      <h1 style={{ marginBottom: '20px', color: '#1a1a1a' }}>Edit Profile</h1>
      
      {message && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: message.includes('success') ? '#4CAF50' : '#f44336',
          color: 'white',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {message.includes('success') ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 6.66667V10M10 13.3333H10.0083M18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333C5.39763 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39763 5.39763 1.66667 10 1.66667C14.6024 1.66667 18.3333 5.39763 18.3333 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#666666' }}>
            Name
          </label>
          <input
            type="text"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #E8E1D5',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#666666' }}>
            Description
          </label>
          <textarea
            value={user.description || ''}
            onChange={(e) => setUser({ ...user, description: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #E8E1D5',
              borderRadius: '4px',
              minHeight: '100px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#666666' }}>
            Team
          </label>
          <input
            type="text"
            value={user.team || ''}
            onChange={(e) => setUser({ ...user, team: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #E8E1D5',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#666666' }}>
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={user.tags?.join(', ') || ''}
            onChange={(e) => setUser({ ...user, tags: e.target.value.split(',').map(t => t.trim()) })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #E8E1D5',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#666666' }}>
            Links
          </label>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666666', fontSize: '13px' }}>
              GitHub
            </label>
            <input
              type="url"
              value={user.links?.github || ''}
              onChange={(e) => setUser({
                ...user,
                links: { ...user.links, github: e.target.value }
              })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #E8E1D5',
                borderRadius: '4px'
              }}
              placeholder="https://github.com/username"
            />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666666', fontSize: '13px' }}>
              LinkedIn
            </label>
            <input
              type="url"
              value={user.links?.linkedin || ''}
              onChange={(e) => setUser({
                ...user,
                links: { ...user.links, linkedin: e.target.value }
              })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #E8E1D5',
                borderRadius: '4px'
              }}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666666', fontSize: '13px' }}>
              Personal Website
            </label>
            <input
              type="url"
              value={user.links?.website || ''}
              onChange={(e) => setUser({
                ...user,
                links: { ...user.links, website: e.target.value }
              })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #E8E1D5',
                borderRadius: '4px'
              }}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>

        {/* Profile Status */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            fontSize: '15px', 
            fontWeight: '500', 
            color: '#1a1a1a',
            marginBottom: '15px' 
          }}>
            Profile Status
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px',
              backgroundColor: '#F5F1E8',
              borderRadius: '8px',
              border: '1px solid #E8E1D5'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: user?.isActive ? '#4CAF50' : '#666666',
                transition: 'background-color 0.2s ease'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1a1a1a',
                  marginBottom: '4px'
                }}>
                  {user?.isActive ? 'Profile is Active' : 'Profile is Inactive'}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#666666'
                }}>
                  {user?.isActive 
                    ? 'Your profile is visible to the community'
                    : 'Your profile is hidden from the community'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (user) {
                    setUser({ ...user, isActive: !user.isActive });
                    setMessage(
                      !user.isActive 
                        ? 'Profile will be activated after saving changes' 
                        : 'Profile will be deactivated after saving changes'
                    );
                    setTimeout(() => setMessage(''), 3000);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: user?.isActive ? '#4CAF50' : '#666666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  opacity: 0.8
                }} />
                {user?.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
            <div style={{
              fontSize: '13px',
              color: '#666666',
              padding: '0 15px'
            }}>
              {user?.isActive 
                ? 'Deactivating your profile will hide it from the community board. Changes will take effect after saving.'
                : 'Activate your profile to make it visible on the community board. Changes will take effect after saving.'}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#666666' }}>
            Available Days
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['friday', 'saturday'].map((day) => (
              <label key={day} style={{ 
                display: 'flex', 
                alignItems: 'center',
                color: '#1a1a1a',
                fontSize: '14px'
              }}>
                <input
                  type="checkbox"
                  checked={user.availableDays?.includes(day)}
                  onChange={(e) => {
                    const days = user.availableDays || [];
                    setUser({
                      ...user,
                      availableDays: e.target.checked
                        ? [...days, day]
                        : days.filter(d => d !== day)
                    });
                  }}
                  style={{ marginRight: '8px' }}
                />
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#F5F1E8',
              border: '1px solid #E8E1D5',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              backgroundColor: '#E8E1D5',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
} 