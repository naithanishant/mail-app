import React, { useReducer, useState } from 'react';

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  subscribed: boolean;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: UserFormData;
}

// Action types for the reducer
type FormAction = 
  | { type: 'UPDATE_FIELD'; field: keyof UserFormData; value: string | boolean }
  | { type: 'RESET_FORM' };

// Initial form state
const initialFormState: UserFormData = {
  first_name: '',
  last_name: '',
  email: '',
  subscribed: false,
};

// Reducer function
const formReducer = (state: UserFormData, action: FormAction): UserFormData => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };
    case 'RESET_FORM':
      return initialFormState;
    default:
      return state;
  }
};

interface UserFormProps {
  onUserCreated: (user: UserFormData) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ onUserCreated, onCancel }) => {
  const [formData, dispatch] = useReducer(formReducer, initialFormState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  // Mock API call function
  const mockApiCall = async (userData: UserFormData): Promise<ApiResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate API response
        resolve({
          success: true,
          message: 'User created successfully!',
          data: userData,
        });
      }, 1000); // Simulate network delay
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    dispatch({
      type: 'UPDATE_FIELD',
      field: name as keyof UserFormData,
      value: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await mockApiCall(formData);
      
      if (response.success) {
        setMessage(response.message);
        // Reset form after successful submission
        dispatch({ type: 'RESET_FORM' });
        // Call the callback with the created user data
        onUserCreated(formData);
      }
    } catch (error) {
      setMessage('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2>Add New User</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="first_name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            First Name:
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px',
            }}
          />
        </div>

        <div>
          <label htmlFor="last_name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Last Name:
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px',
            }}
          />
        </div>

        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="subscribed"
            name="subscribed"
            checked={formData.subscribed}
            onChange={handleInputChange}
            style={{ transform: 'scale(1.2)' }}
          />
          <label htmlFor="subscribed" style={{ fontWeight: 'bold' }}>
            Subscribe to newsletter
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              flex: 1,
            }}
          >
            {loading ? 'Creating User...' : 'Create User'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              flex: 1,
            }}
          >
            Cancel
          </button>
        </div>
      </form>

      {message && (
        <div
          style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: message.includes('Failed') ? '#f8d7da' : '#d4edda',
            color: message.includes('Failed') ? '#721c24' : '#155724',
            border: `1px solid ${message.includes('Failed') ? '#f5c6cb' : '#c3e6cb'}`,
            borderRadius: '4px',
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default UserForm; 