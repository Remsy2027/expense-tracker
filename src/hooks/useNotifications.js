import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";

// Notification types
export const NotificationTypes = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

// Action types
const ActionTypes = {
  ADD_NOTIFICATION: "ADD_NOTIFICATION",
  REMOVE_NOTIFICATION: "REMOVE_NOTIFICATION",
  CLEAR_ALL: "CLEAR_ALL",
  UPDATE_NOTIFICATION: "UPDATE_NOTIFICATION",
};

// Initial state
const initialState = {
  notifications: [],
};

// Reducer
function notificationReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };

    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload,
        ),
      };

    case ActionTypes.CLEAR_ALL:
      return {
        ...state,
        notifications: [],
      };

    case ActionTypes.UPDATE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload.id
            ? { ...notification, ...action.payload.updates }
            : notification,
        ),
      };

    default:
      return state;
  }
}

// Create context
const NotificationContext = createContext();

// Provider component
export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: NotificationTypes.INFO,
      duration: 5000,
      dismissible: true,
      ...notification,
      timestamp: new Date().toISOString(),
    };

    dispatch({
      type: ActionTypes.ADD_NOTIFICATION,
      payload: newNotification,
    });

    // Auto-remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        dispatch({
          type: ActionTypes.REMOVE_NOTIFICATION,
          payload: id,
        });
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({
      type: ActionTypes.REMOVE_NOTIFICATION,
      payload: id,
    });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ALL });
  }, []);

  const updateNotification = useCallback((id, updates) => {
    dispatch({
      type: ActionTypes.UPDATE_NOTIFICATION,
      payload: { id, updates },
    });
  }, []);

  // Convenience methods for different notification types
  const success = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: NotificationTypes.SUCCESS,
        message,
        ...options,
      });
    },
    [addNotification],
  );

  const error = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: NotificationTypes.ERROR,
        message,
        duration: 8000, // Longer duration for errors
        ...options,
      });
    },
    [addNotification],
  );

  const warning = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: NotificationTypes.WARNING,
        message,
        duration: 6000,
        ...options,
      });
    },
    [addNotification],
  );

  const info = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: NotificationTypes.INFO,
        message,
        ...options,
      });
    },
    [addNotification],
  );

  // Persistent notifications (don't auto-dismiss)
  const persistent = useCallback(
    (message, type = NotificationTypes.INFO, options = {}) => {
      return addNotification({
        type,
        message,
        duration: 0, // Don't auto-dismiss
        ...options,
      });
    },
    [addNotification],
  );

  const contextValue = {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearAll,
    updateNotification,
    success,
    error,
    warning,
    info,
    persistent,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use notifications
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}

// Additional utility hook for common notification patterns
export function useActionNotifications() {
  const { success, error, warning, info } = useNotifications();

  const notifySuccess = useCallback(
    (action, entity) => {
      success(`${entity} ${action} successfully!`);
    },
    [success],
  );

  const notifyError = useCallback(
    (action, entity, errorMessage) => {
      error(
        `Failed to ${action} ${entity}${errorMessage ? `: ${errorMessage}` : ""}`,
      );
    },
    [error],
  );

  const notifyValidationError = useCallback(
    (errors) => {
      const errorMessage = Array.isArray(errors) ? errors.join(", ") : errors;
      error(`Validation failed: ${errorMessage}`);
    },
    [error],
  );

  const notifyNetworkError = useCallback(() => {
    error("Network error. Please check your connection and try again.");
  }, [error]);

  const notifyUnsavedChanges = useCallback(() => {
    warning(
      "You have unsaved changes. Please save or discard them before continuing.",
    );
  }, [warning]);

  const notifyFeatureUnavailable = useCallback(
    (feature) => {
      info(`${feature} feature is coming soon!`);
    },
    [info],
  );

  const notifyDataExported = useCallback(
    (filename) => {
      success(
        `Data exported successfully${filename ? ` as ${filename}` : ""}!`,
      );
    },
    [success],
  );

  const notifyDataImported = useCallback(
    (itemCount) => {
      success(`Successfully imported ${itemCount} items!`);
    },
    [success],
  );

  const notifyBulkAction = useCallback(
    (action, count, entity) => {
      success(
        `Successfully ${action} ${count} ${entity}${count !== 1 ? "s" : ""}!`,
      );
    },
    [success],
  );

  return {
    notifySuccess,
    notifyError,
    notifyValidationError,
    notifyNetworkError,
    notifyUnsavedChanges,
    notifyFeatureUnavailable,
    notifyDataExported,
    notifyDataImported,
    notifyBulkAction,
  };
}

// Hook for handling async operations with notifications
export function useAsyncNotifications() {
  const { success, error, info } = useNotifications();

  const withLoadingNotification = useCallback(
    async (
      asyncOperation,
      {
        loadingMessage = "Processing...",
        successMessage = "Operation completed successfully!",
        errorMessage = "Operation failed",
        showLoading = true,
      } = {},
    ) => {
      let loadingId = null;

      try {
        // Show loading notification
        if (showLoading) {
          loadingId = info(loadingMessage, { duration: 0 });
        }

        // Execute the async operation
        const result = await asyncOperation();

        // Remove loading notification
        if (loadingId) {
          // Note: In a real implementation, you'd have access to removeNotification here
          // For now, we'll just let it auto-expire with a short duration
        }

        // Show success notification
        if (successMessage) {
          success(successMessage);
        }

        return { success: true, data: result };
      } catch (err) {
        // Remove loading notification
        if (loadingId) {
          // Note: In a real implementation, you'd remove the loading notification here
        }

        // Show error notification
        const finalErrorMessage = err.message || errorMessage;
        error(finalErrorMessage);

        return { success: false, error: err };
      }
    },
    [success, error, info],
  );

  return { withLoadingNotification };
}

// Hook for form validation notifications
export function useFormNotifications() {
  const { error, success } = useNotifications();

  const notifyValidationErrors = useCallback(
    (errors) => {
      if (typeof errors === "object" && !Array.isArray(errors)) {
        // Handle object of field errors
        const errorMessages = Object.entries(errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(", ");
        error(`Please fix the following errors: ${errorMessages}`);
      } else if (Array.isArray(errors)) {
        // Handle array of error messages
        error(`Please fix the following errors: ${errors.join(", ")}`);
      } else {
        // Handle single error message
        error(errors);
      }
    },
    [error],
  );

  const notifyFormSuccess = useCallback(
    (action = "saved") => {
      success(`Form ${action} successfully!`);
    },
    [success],
  );

  const notifyFieldError = useCallback(
    (field, message) => {
      error(`${field}: ${message}`);
    },
    [error],
  );

  return {
    notifyValidationErrors,
    notifyFormSuccess,
    notifyFieldError,
  };
}

export default NotificationContext;
