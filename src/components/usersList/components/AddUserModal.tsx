import React, { useState } from 'react';
import { Button } from '@contentstack/venus-components';
import '../../../styles/AddUserModal.css';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (userData: { first_name: string; last_name: string; email: string }) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onAddUser }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      first_name: '',
      last_name: '',
      email: ''
    };

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onAddUser(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: ''
    });
    setErrors({
      first_name: '',
      last_name: '',
      email: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="heading-4">Add New User</h2>
          <Button
            buttonType="tertiary"
            onClick={onClose}
            className="modal-close-button"
          >
            ×
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="first_name" className="label">
              First Name *
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className={`form-input ${errors.first_name ? 'error' : ''}`}
              placeholder="Enter first name"
              required
            />
            {errors.first_name && <span className="caption" style={{ color: '#dc3545' }}>{errors.first_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="last_name" className="label">
              Last Name *
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className={`form-input ${errors.last_name ? 'error' : ''}`}
              placeholder="Enter last name"
              required
            />
            {errors.last_name && <span className="caption" style={{ color: '#dc3545' }}>{errors.last_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="label">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter email address"
              required
            />
            {errors.email && <span className="caption" style={{ color: '#dc3545' }}>{errors.email}</span>}
          </div>

          <div className="modal-actions">
            <Button
              buttonType="secondary"
              onClick={handleClose}
              type="button"
            >
              Cancel
            </Button>
            <Button
              buttonType="primary"
              type="submit"
            >
              Add User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal; 