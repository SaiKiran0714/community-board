'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/app/types/user';

export default function EditProfile({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newLink, setNewLink] = useState({ platform: '', url: '' });
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const fetchAllTags = async () => {
      try {

        const res = await fetch('http://127.0.0.1:5000/api/tags');
        if (res.ok) {
          const data = await res.json();
          setAllTags(data);
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };
    fetchAllTags();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://127.0.0.1:5000/api/users/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          setMessage('Failed to load user profile');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setMessage('Error loading profile');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://127.0.0.1:5000/api/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: user.name,
          description: user.description,
          tags: user.tags,
          isActive: user.isActive,
          links: user.links,
          team: user.team,
          availableDays: user.availableDays
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
      setMessage('Error updating profile');
    }
  };

  const handleTagClick = (tag: string) => {
    if (!user) return;
    const currentTags = user.tags || [];
    if (!currentTags.includes(tag)) {
      setUser({ ...user, tags: [...currentTags, tag] });
    }
    setShowTagSuggestions(false);
  };

  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    if (user) {
      setUser({ 
        ...user, 
        tags: value.split(',').map(t => t.trim()).filter(t => t !== '') 
      });
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        User not found
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '40px 20px' 
    }}>
      <h1 style={{ 
        fontSize: '24px', 
        marginBottom: '30px',
        color: '#1a1a1a'
      }}>
        Edit Profile
      </h1>

      {message && (
        <div style={{
          padding: '12px',
          backgroundColor: message.includes('success') ? '#4CAF50' : '#f44336',
          color: 'white',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Info Section */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.2em', marginBottom: '15px', color: '#666' }}>Basic Information</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
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
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
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

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
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
                minHeight: '100px',
                resize: 'vertical'
              }}
            />
          </div>
        </section>

        {/* Tags Section */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.2em', marginBottom: '15px', color: '#666' }}>Skills & Tags</h2>
          <div style={{ marginBottom: '15px', position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={user.tags?.join(', ') || ''}
              onChange={handleTagInput}
              onFocus={() => setShowTagSuggestions(true)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #E8E1D5',
                borderRadius: '4px'
              }}
              placeholder="Start typing or select from suggestions..."
            />
            
            {/* Tag Suggestions */}
            {showTagSuggestions && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #E8E1D5',
                borderRadius: '4px',
                marginTop: '4px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 10,
                padding: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  {allTags
                    .filter(tag => !user.tags?.includes(tag))
                    .map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#F5F1E8',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#666',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#E8E1D5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#F5F1E8';
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Tags */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginTop: '10px'
          }}>
            {user.tags?.map(tag => (
              <span
                key={tag}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#F5F1E8',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {tag}
                <button
                  onClick={() => {
                    setUser({
                      ...user,
                      tags: user.tags?.filter(t => t !== tag) || []
                    });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#999',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* Links Section */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.2em', marginBottom: '15px', color: '#666' }}>Social Links</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
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

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
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

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
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
        </section>

        {/* Submit Button */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#666',
              border: '1px solid #E8E1D5',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 