import React, { useState } from 'react';
import '../../styles/UsersList.css';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { createUser } from '../../api';
import AddUserModal from './components/AddUserModal';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subscribed: boolean;
  created_at: string;
}

const UsersList: React.FC<any> = () => {
  const users = useSelector((state: RootState) => state.main.usersData);
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddUser = async (userData: { first_name: string; last_name: string; email: string }) => {
    const newUser = {
      title: `${userData.first_name} ${userData.last_name}`,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      subscribed: false, // Default to not subscribed
    };

    try {
      // Use the API function to create user in Contentstack
      await createUser(dispatch, { entry: newUser });
    } catch (error) {
      console.error('Error creating user:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="users-list-container">
      <div className="users-list-header">
        <h1>Users Management</h1>
        <button
          onClick={handleOpenModal}
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
            onClick={handleOpenModal}
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

      <AddUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddUser={handleAddUser}
      />
    </div>
  );
};

export default UsersList; 