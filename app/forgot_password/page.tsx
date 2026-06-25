'use client';
import React, { useState } from 'react';

// --- Inline SVG Icons (Replacing lucide-react) ---
// Defining these components internally resolves the dependency error.

const Zap: React.FC<{ className?: string }> = ({ className = "w-4 h-4 mr-0.5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const Facebook: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const Twitter: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2.1-1.1-.4-2.1-1.6-2.4-3.4 1.2.2 2.1.2 3.1-.1-1.3-.8-2.3-2.6-2.6-4.9.3.1.6.1.9.1-1.4-1-2.2-2.3-2.2-4.1 0-1.7.9-3.2 2.2-4.1-.7.4-1.4.9-2.1 1.6 0 0 .7.6 1.6 1.1 0-.1 0-.3 0-.4 0-.7-.5-1.3-1-1.8.7.1 1.4.1 2.1.1.2-.1.4-.2.6-.3C8.6 7.6 10 9 11 11c-1 0-2 .2-3 .5-.1 0-.2 0-.3 0-1.4-1-2.2-2.3-2.2-4.1 0-1.7.9-3.2 2.2-4.1"></path>
  </svg>
);

const Linkedin: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect width="4" height="12" x="2" y="9"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);


// --- Types for Reusability ---

interface SocialLinkProps {
  // Now accepts a functional component (the SVG component)
  icon: React.ElementType; 
  href: string;
}

// --- Components ---

/**
 * Header Component with Logo and Brand Name
 */
const Header: React.FC = () => (
  <header className="py-6 px-4 sm:px-10 flex items-center">
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg">
        <span className="font-bold text-white text-lg">FW</span>
      </div>
      <h1 className="text-xl font-semibold text-gray-800">FinWin</h1>
    </div>
  </header>
);

/**
 * Social Icon Link Component
 */
const SocialLink: React.FC<SocialLinkProps> = ({ icon: Icon, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-gray-500 hover:text-blue-600 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
  >
    <Icon /> {/* Icon is rendered here, retaining its default classNames */}
  </a>
);

/**
 * Footer Component with Links and Social Media
 */
const Footer: React.FC = () => (
 <footer className="w-full mt-auto py-5 px-6 border-t border-gray-100 text-sm text-gray-500 bg-white">
           <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto">
            
     
             {/* Center: Legal/Resources Links */}
             <div className="order-2 flex space-x-6">
               <a href="#" className="hover:text-blue-500 transition">Resources</a>
               <a href="#" className="hover:text-blue-500 transition">Legal</a>
             </div>
     
             {/* Right: Social Icons */}
             <div className="order-1 md:order-3 flex space-x-4 text-lg">
               {/* Facebook Icon */}
               <a href="#" aria-label="Facebook" className="hover:text-blue-500 transition">
                 <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.5c-.75 0-1.5.75-1.5 1.5v1.5h3l-.5 3h-2.5v7h-3v-7h-2v-3h2v-2c0-2.209 1.791-4 4-4h2v3z"/>
                 </svg>
               </a>
               {/* Twitter Icon Placeholder */}
               <a href="#" aria-label="Twitter" className="hover:text-blue-500 transition">
                 <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M22.254 6.362c-.654.291-1.353.487-2.086.582a4.01 4.01 0 001.763-1.996 8.01 8.01 0 01-2.545.977 4.01 4.01 0 00-6.83 3.655 11.39 11.39 0 01-8.29-4.195 4.01 4.01 0 001.24 5.341 4.01 4.01 0 01-1.815-.502v.05c0 1.95 1.39 3.58 3.23 3.95a4.01 4.01 0 01-1.81.066c.513 1.603 2 2.766 3.78 2.793a8.014 8.014 0 01-4.96 1.713c-.32-.019-.636-.037-.95-.06a11.366 11.366 0 006.155 1.802c7.387 0 11.41-6.12 11.41-11.41v-.517c.783-.564 1.455-1.268 2-2.072z"/></svg>
               </a>
               {/* LinkedIn Icon Placeholder */}
               <a href="#" aria-label="LinkedIn" className="hover:text-blue-500 transition">
                 <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.136-4 0v5.604h-3v-11h3v1.748c1.334-2.522 6-2.617 6 2.368v6.884z"/></svg>
               </a>
             </div>
           </div>
         </footer>
);

/**
 * Main Application Component
 */
export const App: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOrPhone) {
      // Logic to initiate password recovery goes here
      setIsSubmitted(true);
      console.log('Recovery requested for:', emailOrPhone);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />

      <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
        {/* The main card is now smaller (max-w-2xl) since it only holds one column */}
        <div className="max-w-2xl w-full bg-white p-6 sm:p-10 rounded-xl">
          
          {/* Content container, restricted width (max-w-lg) and centered (mx-auto) for optimal readability */}
          <div className="w-full max-w-lg mx-auto">
            
            {/* The single column (formerly 'Left Column: Form and Text') */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Forgot Your Password?
              </h2>
              <p className="text-gray-600 mb-8">
                No worries, we'll help you regain access to your account quickly and securely. Enter your registered email address or phone number below to start the password recovery process.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Email or Phone Number</span>
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Enter your email or phone number"
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  />
                </label>
                <br></br>
               <a href='/verify_password'> <button
                  type="submit"
                  disabled={isSubmitted}
                  className="w-full sm:w-auto px-6 py-3 text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitted ? 'Processing...' : 'Submit'}
                </button></a>

                {isSubmitted && (
                  <p className="text-green-600 mt-4 text-sm font-medium">
                    If an account is found, a recovery link has been sent. Check your inbox or phone!
                  </p>
                )}
              </form>
            </div>

            {/* The Image column has been removed */}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
