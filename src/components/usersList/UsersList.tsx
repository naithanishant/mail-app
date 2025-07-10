import React, { useState, useEffect } from 'react';
import '../../styles/UsersList.css';
import { useSelector, useDispatch, } from 'react-redux';
import { RootState } from '../../store';
import { createUser, fetchUsersData } from '../../api';
import AddUserModal from './components/AddUserModal';

interface User {
  id: string;
  uid: string;
  first_name: string;
  last_name: string;
  email: string;
  subscribed: boolean;
  created_at: string;
}

const UsersList: React.FC<any> = () => {
  const { usersData, usersPagination } = useSelector((state: RootState) => state.main);
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

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
      subscribed: true,
    };

    try {
      await createUser(dispatch, { entry: newUser });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handlePageChange = async (page: number) => {
    if (page !== usersPagination.currentPage && !isLoadingPage) {
      setIsLoadingPage(true);
      try {
        await fetchUsersData(dispatch, page, usersPagination.limit);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoadingPage(false);
      }
    }
  };

  const handlePreviousPage = () => {
    if (usersPagination.hasPreviousPage) {
      handlePageChange(usersPagination.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (usersPagination.hasNextPage) {
      handlePageChange(usersPagination.currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const totalPages = usersPagination.totalPages;
    const currentPage = usersPagination.currentPage;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) {
        endPage = Math.min(totalPages, 5);
      }
      
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Calculate display indices for pagination info
  const startIndex = (usersPagination.currentPage - 1) * usersPagination.limit;
  const endIndex = Math.min(startIndex + usersData.length, usersPagination.totalCount);

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

      {usersPagination.totalCount === 0 ? (
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
        <>
          <div className="users-grid">
            {usersData.map((user, index) => (
              <div
                key={`user-card-${user.uid}`}
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

          {/* Loading indicator */}
          {isLoadingPage && (
            <div className="pagination-loading">
              <div className="loading-spinner"></div>
              <span>Loading users...</span>
            </div>
          )}

          {/* Pagination Controls */}
          {usersPagination.totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {startIndex + 1} to {endIndex} of {usersPagination.totalCount} users
              </div>
              
              <div className="pagination-controls">
                <button
                  onClick={handlePreviousPage}
                  disabled={!usersPagination.hasPreviousPage || isLoadingPage}
                  className="pagination-button pagination-prev"
                >
                  Previous
                </button>
                
                <div className="pagination-numbers">
                  {generatePageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={isLoadingPage}
                      className={`pagination-number ${usersPagination.currentPage === page ? 'active' : ''} ${isLoadingPage ? 'loading' : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={!usersPagination.hasNextPage || isLoadingPage}
                  className="pagination-button pagination-next"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {usersPagination.totalCount > 0 && (
        <div className="users-count">
          Total Users: {usersPagination.totalCount}
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