// ErrorPage.tsx
import React from "react";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";

const ErrorPage: React.FC = () => {
  const error = useRouteError();

  // Check the error type and assign a message accordingly
  let errorMessage = "An unexpected error occurred.";
  let statusCode: number | undefined;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    errorMessage = error.statusText || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Error {statusCode || "Unknown"}</h1>
        <p className="text-gray-700 mb-6">{errorMessage}</p>
        {Boolean(error) && (
          <pre className="text-left text-xs text-gray-500 bg-gray-50 p-4 rounded-md overflow-auto mb-6">
            {JSON.stringify(error, null, 2)}
          </pre>
        )}
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
