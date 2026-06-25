import React from 'react';

const customStyles: { [key: string]: React.CSSProperties } = {
  body: {
    backgroundColor: '#e0f2fe',
    fontFamily: 'Inter, sans-serif',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    margin: 0,
  },
  card: {
    maxWidth: '450px',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    backgroundColor: '#fff', 
  },
  cardTitle: {
    fontWeight: 700,
    color: '#212529',
    fontSize: '1.5rem',
  },

  buttonPrimary: {
    backgroundColor: '#0d6efd',
    borderColor: '#0d6efd',
    borderRadius: '0.5rem',
    padding: '0.75rem 2rem',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    display: 'inline-block', 
    textDecoration: 'none', // Remove underline from anchor tag
    color: '#fff', // Set text color to white
  }
};


// --- 2. The React Component (TSX) ---

const AccountCreatedSuccessPage: React.FC = () => {
  return (
    <div style={customStyles.body}>
      
      <div className="card" style={customStyles.card}>
        
        <h1 className="card-title mb-4" style={customStyles.cardTitle}>
          Account created successfully!
        </h1>
        
        {/* Button Link: Applying the Bootstrap classes AND the custom button style */}
        <a 
          href="/login" 
          className="btn btn-primary" // Bootstrap provides base styles and hover effect
          style={customStyles.buttonPrimary} // Custom style ensures colors/padding/radius
        >
          Go to Login
        </a>
      </div>
    </div>
  );
};

export default AccountCreatedSuccessPage;