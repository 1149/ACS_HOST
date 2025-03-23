import React from 'react';

interface ErrorComponentProps {
  message: string;
  onOkay: () => void;
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({ message, onOkay }) => {
  return (
    <div className="error-container" style={{ 
      maxWidth: "400px", 
      margin: "40px auto", 
      border: "1px solid #ccc", 
      borderRadius: "8px", 
      overflow: "hidden",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
    }}>
      <div className="error-header"
      style={{ 
        backgroundColor: "#1a73e8", 
        color: "white", 
        padding: "16px", 
        fontWeight: "bold",
        fontSize: "18px"
      }}>
        Error
      </div>
      <div className="error-body" style={{ 
        padding: "24px", 
        textAlign: "center" 
      }}>
        <p style={{ 
          margin: "0 0 24px 0",
          fontSize: "16px",
          color: "#333"
        }}>
          {message}
        </p>
        <button 
          onClick={onOkay}
          style={{
            backgroundColor: "#1a73e8",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = "#1669d1";
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = "#1a73e8";
          }}
        >
          Okay
        </button>
      </div>
    </div>
  );
};

export default ErrorComponent;

