import { render, screen, fireEvent } from '@testing-library/react';
import UserCard from '../components/UserCard';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  description: 'Test description',
  tags: ['react', 'typescript'],
  isActive: true,
  links: {
    github: 'https://github.com/testuser',
    linkedin: 'https://linkedin.com/in/testuser'
  },
  team: 'Test Team',
  avatarUrl: null,
  createdAt: '2023-09-20T00:00:00Z',
  updatedAt: '2023-09-20T00:00:00Z'
};

describe('UserCard', () => {
  it('renders user information correctly', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
    expect(screen.getByText('Test Team')).toBeInTheDocument();
  });

  it('handles edit button click', () => {
    const mockEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={mockEdit} />);
    
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    expect(mockEdit).toHaveBeenCalledWith(mockUser);
  });

  it('shows all tags when "show more" is clicked', () => {
    const userWithManyTags = {
      ...mockUser,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6']
    };
    
    render(<UserCard user={userWithManyTags} />);
    
    // Initially only shows 5 tags
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag5')).toBeInTheDocument();
    expect(screen.queryByText('tag6')).not.toBeInTheDocument();
    
    // Click show more
    fireEvent.click(screen.getByText('+1 more'));
    
    // All tags should be visible
    expect(screen.getByText('tag6')).toBeInTheDocument();
  });

  it('renders links correctly', () => {
    render(<UserCard user={mockUser} />);
    
    const githubLink = screen.getByText('Github');
    const linkedinLink = screen.getByText('Linkedin');
    
    expect(githubLink).toHaveAttribute('href', 'https://github.com/testuser');
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/testuser');
  });

  it('shows inactive state correctly', () => {
    const inactiveUser = { ...mockUser, isActive: false };
    render(<UserCard user={inactiveUser} />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveClass('opacity-60');
  });
}); 