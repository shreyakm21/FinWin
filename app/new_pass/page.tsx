"use client";
import React, { useState, useMemo } from 'react';

// --- Icon Definitions (Inline SVGs) ---
// Using raw SVG for reliability in single-file environment

const IconEye = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.585 10.585a2 2 0 0 0 2.829 2.829" />
    <path d="M16.681 16.681A7 7 0 0 1 12 19c-3.15 0-6.195-2.001-9-7 2.229-3.41 5.37-5.592 8.448-6.182" />
    <path d="M7.319 7.319A7 7 0 0 0 12 5c3.15 0 6.195 2.001 9 7-1.125 1.734-2.473 3.197-3.922 4.382" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const IconCheckCircle = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.6-8.91" />
    <path d="m11 15 2 2 8-8" />
  </svg>
);

const IconXCircle = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

const IconFacebook = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const IconTwitter = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2-2.8-.7-4.9-2.6-5.8-4.8 1.1.2 2.2 0 3.2-.4-2.4-.5-4.5-2.6-4.8-5.1.5.1 1.1.2 1.6.2A3.33 3.33 0 0 0 4 7.6c-.6 1.4-.2 3.1.5 4.3 1.2 1.8 3 2.7 5.1 2.8-1.5 1.2-3.8 1.8-6.1 1.6 2.7 1.7 5.8 2.6 9 2.6 1.8 0 3.5-.2 5.1-.7 2.2-1.2 3.8-2.9 4.7-4.8.7-.3 1.3-.8 1.8-1.4.6-.6 1-1.3 1.2-2.1-.6.1-1.2.1-1.8.1C21 6.8 21.6 5.4 22 4z" />
  </svg>
);

const IconLinkedin = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);


// --- Type Definitions ---

interface PasswordStrength {
  score: number; // 0 (Weakest) to 4 (Strongest)
  label: 'Weak' | 'Medium' | 'Strong';
}

// --- Utility Functions ---

/**
 * Calculates the strength of a given password based on complexity rules.
 * @param password The password string.
 * @returns An object containing the strength score and label.
 */
const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return { score: 0, label: 'Weak' };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9!@#$%^&*()]/.test(password)) score++;

  let label: 'Weak' | 'Medium' | 'Strong';
  if (score < 2) {
    label = 'Weak';
  } else if (score < 4) {
    label = 'Medium';
  } else {
    label = 'Strong';
  }

  return { score, label };
};

// --- Sub-Components ---

interface PasswordRequirementItemProps {
  label: string;
  isMet: boolean;
}

/**
 * Displays a single password requirement with a status icon.
 */
const PasswordRequirementItem: React.FC<PasswordRequirementItemProps> = ({ label, isMet }) => (
  <div className="flex items-center text-sm py-0.5" role="listitem">
    {isMet ? (
      <IconCheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
    ) : (
      <IconXCircle className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
    )}
    <span className={isMet ? 'text-gray-700' : 'text-gray-500'}>
      {label}
    </span>
  </div>
);

interface CustomInputProps {
  label: string;
  id: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type: 'password' | 'text';
  showToggle?: boolean;
}

/**
 * Custom input field with optional visibility toggle icon.
 */
const CustomInput: React.FC<CustomInputProps> = ({ label, id, placeholder, value, onChange, type: initialType, showToggle = false }) => {
  const [type, setType] = useState(initialType);

  const toggleVisibility = () => {
    setType(prevType => (prevType === 'password' ? 'text' : 'password'));
  };

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          autoComplete={id.includes('new') ? 'new-password' : 'off'}
        />
        {showToggle && (
          <button
            type="button"
            onClick={toggleVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
            aria-label={type === 'password' ? 'Show password' : 'Hide password'}
          >
            {type === 'password' ? <IconEye className="w-5 h-5" /> : <IconEyeOff className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---

/**
 * The main application component for the Create New Password page.
 */
export const App: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Renamed state variables to match usage in CustomInput (type state handles visibility)
  const [isNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible] = useState(false);

  // Calculate strength and requirements based on the new password
  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  const requirements = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      caseLetters: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword),
      numbersAndSymbols: /[0-9!@#$%^&*()]/.test(newPassword),
      passwordsMatch: newPassword === confirmPassword && confirmPassword !== '',
    };
  }, [newPassword, confirmPassword]);

  const allRequirementsMet = Object.values(requirements).every(Boolean);

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (allRequirementsMet) {
      // In a real app, this would send data to the server
      console.log('Password reset successfully!');
      // Using a custom alert/modal is preferred, but for this example, keeping the simple alert as instructed in the guidelines
      alert('Password reset attempt was successful (check console for details)!');
    } else {
      alert('Please meet all password requirements before resetting.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Header/Logo Section */}
      <header className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center justify-center h-8 w-8 bg-blue-600 text-white text-base font-bold rounded-md mr-2">
            FW
          </span>
          <span className="text-xl font-bold text-gray-800">FinWin</span>
        </div>
      </header>

      {/* Main Content (Centered Form) */}
      <main className="flex-grow flex items-center justify-center ">
        <div className="w-full max-w-lg mx-4 bg-white p-8 sm:p-10 rounded-xl shadow-xl transition duration-300">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Create New Password
            </h1>
            <p className="text-gray-500 text-sm">
              Your new password must be different from previous passwords.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* New Password Input */}
            <CustomInput
              label="New Password"
              id="newPassword"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type={'password'} // Initial type is 'password', component state handles the toggle
              showToggle={true}
            />

            {/* Password Strength Indicator (Simplified: Text only) */}
            <div className="space-y-1">
              <p className={`text-sm font-semibold ${
                strength.label === 'Strong' ? 'text-green-600' : 
                strength.label === 'Medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {strength.label}
              </p>
              {/* Descriptive text */}
              <p className="text-xs text-gray-500 pt-1">
                A strong password helps keep your account secure.
              </p>
            </div>

            {/* Confirm Password Input */}
            <CustomInput
              label="Confirm New Password"
              id="confirmPassword"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={'password'} // Initial type is 'password', component state handles the toggle
              showToggle={true}
            />

            {/* Password Requirements List */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Password Requirements:
              </p>
              <div className="space-y-1">
                <PasswordRequirementItem label="At least 8 characters" isMet={requirements.minLength} />
                <PasswordRequirementItem label="Contains uppercase and lowercase letters" isMet={requirements.caseLetters} />
                <PasswordRequirementItem label="Includes numbers and symbols" isMet={requirements.numbersAndSymbols} />
                <PasswordRequirementItem label="Passwords match" isMet={requirements.passwordsMatch} />
              </div>
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              disabled={!allRequirementsMet}
              className={`w-full py-3 mt-8 rounded-lg text-white font-semibold transition duration-300 shadow-md 
                ${allRequirementsMet
                  ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300'
                  : 'bg-blue-400 cursor-not-allowed'
                }`}
            >
              Reset Password
            </button>
          </form>
        </div>
      </main>

    
         <footer className="w-full mt-auto py-5 px-6 border-t border-gray-100 text-sm text-gray-500 bg-white">
           <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto">
            
     
             {/* Center: Legal/Resources Links */}
             <div className="order-2 flex space-x-6">
               <a href="#" className="hover:text-blue-600 transition">Resources</a>
               <a href="#" className="hover:text-blue-600 transition">Legal</a>
             </div>
     
             {/* Right: Social Icons */}
             <div className="order-1 md:order-3 flex space-x-4 text-lg">
               {/* Facebook Icon */}
               <a href="#" aria-label="Facebook" className="hover:text-blue-600 transition">
                 <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.5c-.75 0-1.5.75-1.5 1.5v1.5h3l-.5 3h-2.5v7h-3v-7h-2v-3h2v-2c0-2.209 1.791-4 4-4h2v3z"/>
                 </svg>
               </a>
               {/* Twitter Icon Placeholder */}
               <a href="#" aria-label="Twitter" className="hover:text-blue-600 transition">
                 <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M22.254 6.362c-.654.291-1.353.487-2.086.582a4.01 4.01 0 001.763-1.996 8.01 8.01 0 01-2.545.977 4.01 4.01 0 00-6.83 3.655 11.39 11.39 0 01-8.29-4.195 4.01 4.01 0 001.24 5.341 4.01 4.01 0 01-1.815-.502v.05c0 1.95 1.39 3.58 3.23 3.95a4.01 4.01 0 01-1.81.066c.513 1.603 2 2.766 3.78 2.793a8.014 8.014 0 01-4.96 1.713c-.32-.019-.636-.037-.95-.06a11.366 11.366 0 006.155 1.802c7.387 0 11.41-6.12 11.41-11.41v-.517c.783-.564 1.455-1.268 2-2.072z"/></svg>
               </a>
               {/* LinkedIn Icon Placeholder */}
               <a href="#" aria-label="LinkedIn" className="hover:text-blue-600 transition">
                 <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.136-4 0v5.604h-3v-11h3v1.748c1.334-2.522 6-2.617 6 2.368v6.884z"/></svg>
               </a>
             </div>
           </div>
         </footer>
    
    </div>
  );
};

export default App;
