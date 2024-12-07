import toast from 'react-hot-toast';

export function handleError(error, message = 'An error occurred') {
  console.error(message, error);
  toast.error(message);
  return null;
}

export function handleSuccess(message) {
  toast.success(message);
  return true;
}

export function handleApiError(error) {
  if (error.response) {
    // Server responded with error
    return handleError(error, error.response.data?.message || 'Server error occurred');
  } else if (error.request) {
    // Request made but no response
    return handleError(error, 'No response from server');
  } else {
    // Request setup error
    return handleError(error, 'Error making request');
  }
}

export function validateResponse(data, error) {
  if (error) {
    handleError(error);
    return false;
  }
  return true;
}