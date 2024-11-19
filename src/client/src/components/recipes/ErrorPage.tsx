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
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Error {statusCode || "Unknown"}</h1>
      <p>{errorMessage}</p>
      {Boolean(error) && <pre style={{ color: "gray" }}>{JSON.stringify(error, null, 2)}</pre>}
      <button onClick={() => window.location.reload()}>Reload Page</button>
    </div>
  );
};

export default ErrorPage;
