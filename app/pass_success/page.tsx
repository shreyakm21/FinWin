"use client";
import React from 'react';

// SVG Icons to replace lucide-react (Inline SVG fixes dependency issues in the sandbox environment)

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const FacebookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const TwitterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6.2-1.8 3-2.1 6.5-8-1.5-12.2C10.9 2.2 4.4 3.7 3 5.4c.7 1.3 2 2 3.8 2.3-.5 3.3 2.6 6.5 5.5 6.5C14.1 14.2 15 13.5 15.5 12.5c1.4-.4 2.7-.9 3.8-1.6s2.3-1.6 3.2-2.7c-.5.4-1.2.7-2.1.8-1-.5-2.1-.8-3.4-.8-2.6 0-5 1.5-6.2 3.8-1.4 2.7-.8 6.1 1.7 8.3 2.1 1.8 4.7 2.8 7.5 2.8 1.1 0 2.1-.1 3.1-.4.5 1.4.8 2.8.8 4.2 0 .5-.1 1-.3 1.5 0 .5.3 1 .8 1.5 0 0 2.4-2.2 2.4-5.3 0-1.4-.4-2.8-.8-4.2C21.8 6.4 22 4.7 22 4z" />
    </svg>
);

const LinkedinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

// --- Type Definitions ---
interface SocialLinkProps {
  icon: React.ElementType;
  label: string;
}

// --- Components ---

/**
 * Renders the application's main header with the logo/brand name.
 */
const Header: React.FC = () => {
  return (
    <header className="py-4 px-6 md:px-12 border-b border-gray-100 bg-white shadow-sm">
      <div className="flex items-center">
        <div className="text-xl font-extrabold text-blue-600 flex items-center">
          <span className="bg-blue-600 text-white rounded-md p-1 mr-1 text-base leading-none">FW</span>
          FinWin
        </div>
      </div>
    </header>
  );
};

/**
 * Renders a single social media icon link in the footer.
 */
const SocialLink: React.FC<SocialLinkProps> = ({ icon: Icon, label }) => {
  return (
    <a 
      href={`#${label.toLowerCase()}`} 
      aria-label={label}
      className="text-gray-500 hover:text-blue-500 transition duration-150 p-2 rounded-full hover:bg-gray-100"
      onClick={(e) => e.preventDefault()}
    >
      {/* Icon component is rendered here */}
      <Icon className="w-5 h-5" />
    </a>
  );
};

/**
 * Renders the application's footer with legal links and social media icons.
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const primaryTextColor = "text-gray-500";
  const linkHoverColor = "hover:text-blue-600";

  return (
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
};

/**
 * Renders the main success message card.
 */
const SuccessCard: React.FC = () => {
  const primaryBlue = 'text-blue-600';
  const buttonBlue = 'bg-blue-600 hover:bg-blue-600';

  return (
    <div className="w-full max-w-md p-8 md:p-10 bg-white rounded-xl shadow-2xl transition-all duration-300">
      {/* Checkmark Icon */}
      <div className="flex justify-center mb-6">
        {/* Using inline SVG component */}
        <CheckCircleIcon className={`w-16 h-16 ${primaryBlue} fill-blue-50 stroke-2`} />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-extrabold text-center mb-4 text-gray-900">
        Password Reset <span className={primaryBlue}>Successfully!</span>
      </h1>

      {/* Message */}
      <p className="text-center text-gray-500 mb-10 max-w-xs mx-auto">
        Your password has been updated. You can now log in with your new password to access your banking services securely.
      </p>

      {/* Button */}
     <a href='/login'> <button
        onClick={() => console.log('Returning to Login...')}
        className={`w-full py-3 px-6 rounded-lg text-white font-semibold shadow-lg transition duration-200 transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 ${buttonBlue}`}
      >
        Return to Login
      </button></a>
    </div>
  );
};


/**
 * Main App component
 */
export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans antialiased">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <SuccessCard />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
