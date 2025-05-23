import React from 'react';
import { User } from '@/app/types/user';
import { motion } from 'framer-motion';

interface UserCardProps {
  user: User;
  isOwnProfile?: boolean;
  onDelete?: (userId: string) => void;
  isAdmin?: boolean;
  onToggleAdmin?: (userId: string) => void;
}

export default function UserCard({ user, isOwnProfile, onDelete, isAdmin, onToggleAdmin }: UserCardProps) {
  const [showAllTags, setShowAllTags] = React.useState(false);
  const displayTags = showAllTags ? user.tags : user.tags?.slice(0, 8);
  const hasMoreTags = user.tags?.length > 8;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDelete) {
      const confirmDelete = window.confirm(`Are you sure you want to delete ${user.name}?`);
      if (confirmDelete) {
        onDelete(user.id);
      }
    }
  };

  const handleToggleAdmin = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (onToggleAdmin) {
      onToggleAdmin(user.id);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -2,
        boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)'
      }}
      transition={{ duration: 0.3 }}
      style={{ 
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        height: '260px',
        width: '100%',
        maxWidth: '200px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        border: '1px solid #E8E1D5',
        color: '#1a1a1a',
        position: 'relative',
        opacity: user.isActive ? 1 : 0.7,
        transition: 'all 0.2s ease'
      }}
    >
      {/* Delete Button - Only show for admin or own profile */}
      {(isAdmin || isOwnProfile) && onDelete && (
        <button
          onClick={handleDelete}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '6px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '50%',
            color: '#B91C1C',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            width: '30px',
            height: '30px',
            zIndex: 2
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FEE2E2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Delete user"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}

      {/* Status Indicators - Show admin status and active status */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {/* Active Status - Only show for own profile */}
        {isOwnProfile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '9px',
            color: user.isActive ? '#4CAF50' : '#666666',
            padding: '2px 6px',
            backgroundColor: 'transparent',
            borderRadius: '3px',
            border: `1px solid ${user.isActive ? 'rgba(74, 175, 80, 0.3)' : 'rgba(102, 102, 102, 0.3)'}`,
            opacity: 0.8,
            pointerEvents: 'none'
          }}>
            <span style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: user.isActive ? '#4CAF50' : '#666666'
            }} />
            {user.isActive ? 'Active' : 'Inactive'}
          </div>
        )}
        
        {/* Admin Status - Show for all users when viewer is admin */}
        {isAdmin && user.isAdmin && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '10px',
            color: '#3b82f6',
            padding: '2px 6px',
            backgroundColor: 'transparent',
            borderRadius: '3px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            opacity: 0.8,
            pointerEvents: 'none'
          }}>
            <span style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6'
            }} />
            Admin
          </div>
        )}
      </div>

      {/* User Info Section */}
      <div style={{ marginBottom: '6px' }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          marginBottom: '2px',
          color: '#1a1a1a'
        }}>{user.name}</h3>
        {user.team && (
          <p style={{ 
            fontSize: '13px', 
            color: 'black',
            marginBottom: '6px',
            marginTop: "5px"
          }}>{user.team}</p>
        )}
        {/* Description */}
        {user.description && (
          <div 
            className="description-scroll"
            style={{ 
              fontSize: '12px', 
              color: '#666666',
              maxHeight: '70px',
              overflowY: 'auto',
              marginBottom: '7px',
              paddingRight: '8px'
            }}
          >
            {user.description}
          </div>
        )}
      </div>

      {/* Available Days */}
      <div style={{ 
        display: 'flex',
        gap: '6px',
        marginBottom: '13px',
        paddingBottom: '5px'
      }}>
        <div style={{ 
          display: 'flex',
          gap: '4px',
          alignItems: 'center'
        }}>
          <span style={{
            fontSize: '12px',
            color: '#666666',
            marginRight: '2px'
          }}>
            Available:
          </span>
          <div style={{
            display: 'flex',
            gap: '4px'
          }}>
            {user.availableDays?.includes('friday') && (
              <span style={{ 
                padding: '3px 8px',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontSize: '12px',
                fontWeight: '500',
                borderRadius: '4px'
              }}>
                Fr
              </span>
            )}
            {user.availableDays?.includes('saturday') && (
              <span style={{ 
                padding: '3px 8px',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontSize: '12px',
                fontWeight: '500',
                borderRadius: '4px'
              }}>
                Sa
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .description-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .description-scroll::-webkit-scrollbar-track {
          background: #F5F1E8;
        }
        .description-scroll::-webkit-scrollbar-thumb {
          background: #E8E1D5;
          border-radius: 4px;
        }
      `}} />

      {/* Tags */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '4px',
        marginTop: 'auto',
        marginBottom: '8px'
      }}>
        {displayTags?.map((tag) => (
          <span
            key={tag}
            style={{ 
              padding: '2px 6px',
              backgroundColor: '#F5F1E8',
              color: '#1a1a1a',
              fontSize: '11px',
              borderRadius: '4px'
            }}
          >
            {tag}
          </span>
        ))}
        {!showAllTags && hasMoreTags && (
          <button
            onClick={() => setShowAllTags(true)}
            style={{ 
              padding: '2px 6px',
              backgroundColor: '#F5F1E8',
              color: '#1a1a1a',
              fontSize: '11px',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            +{user.tags.length - 8}
          </button>
        )}
      </div>

      {/* Social Links */}
      <div style={{ 
        display: 'flex',
        gap: '12px',
        marginTop: 'auto',
        paddingBottom: '8px'
      }}>
        {user.links?.github && (
          <a
            href={user.links.github}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              color: '#666666',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PlatformIcon platform="github" />
          </a>
        )}
        {user.links?.linkedin && (
          <a
            href={user.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              color: '#666666',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PlatformIcon platform="linkedin" />
          </a>
        )}
        {user.links?.website && (
          <a
            href={user.links.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              color: '#666666',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PlatformIcon platform="website" />
          </a>
        )}
      </div>
    </motion.article>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  const iconStyle = { width: '24px', height: '24px' };
  
  switch (platform.toLowerCase()) {
    case 'github':
      return (
        <svg style={iconStyle} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg style={iconStyle} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case 'website':
      return (
        <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
    case 'twitter':
      return (
        <svg style={iconStyle} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    default:
      return (
        <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
  }
}