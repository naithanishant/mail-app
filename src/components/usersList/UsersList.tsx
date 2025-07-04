import React from 'react';
import '../../styles/UsersList.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subscribed: boolean;
  created_at: string;
}

interface UsersListProps {
  users: User[];
  onAddUser: () => void;
}

const UsersList: React.FC<any> = () => {
  const users = useSelector((state: RootState) => state.main.usersData);
  return (
    <div className="users-list-container">
      <div className="users-list-header">
        <h1>Users Management</h1>
        <button
          // onClick={onAddUser}
          className="add-user-button"
        >
          + Add New User
        </button>
      </div>

      {users.length === 0 ? (
        <div className="no-users-container">
          <h3 className="no-users-title">No users found</h3>
          <p className="no-users-description">Get started by adding your first user</p>
          <button
            // onClick={onAddUser}
            className="add-first-user-button"
          >
            Add First User
          </button>
        </div>
      ) : (
        <div className="users-grid">
          {users.map((user, index) => (
            <div
              key={`user-card-${index}`}
              className="user-card"
            >
              <div className="user-card-content">
                <div className="user-details">
                  <h3 className="user-name">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="user-email">
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p className="user-subscription">
                    <strong>Newsletter:</strong> {user.subscribed ? 'Subscribed' : 'Not Subscribed'}
                  </p>
                </div>
                <div className={`subscription-badge ${user.subscribed ? 'subscribed' : 'not-subscribed'}`}>
                  {user.subscribed ? 'SUBSCRIBED' : 'NOT SUBSCRIBED'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {users.length > 0 && (
        <div className="users-count">
          Total Users: {users.length}
        </div>
      )}
    </div>
  );
};

export default UsersList; 