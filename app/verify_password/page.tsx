"use client";
import React, { useState, useRef, useCallback } from 'react';

// The main App component
const App: React.FC = () => {
  // State for the 6-digit verification code
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  // State for handling the loading/verification state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  // Refs for each input box to manage focus
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));

  /**
   * Helper function to create a stable ref callback for each input element.
   * This is a common pattern to resolve ref issues within mapped elements.
   */
  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  // Handle the change in any of the 6 input boxes
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;

    if (/[^0-9]/.test(value)) return; // Only allow digits

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Take only the last entered digit
    setCode(newCode);

    // Move focus to the next input box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [code]);

  // Handle key down events for navigation (backspace/delete)
  const handleKeyDown = useCallback((
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    // If Backspace is pressed and the current input is empty, move focus to the previous box
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [code]);

  // Handle form submission (Verify Code button)
  const handleVerify = () => {
    const fullCode = code.join('');
    if (fullCode.length === 6 && !isVerifying) {
      setIsVerifying(true);
      console.log('Verifying code:', fullCode);

      // Simulate an API call
      setTimeout(() => {
        setIsVerifying(false);
        // IMPORTANT: Avoid using window.alert/confirm in Canvas environment
        console.log(`Verification attempt for code: ${fullCode}`); 
      }, 1375);
    } else {
      console.error('Please enter a complete 6-digit code.');
    }
  };

  const isCodeComplete = code.every(digit => digit.length === 1);

  // --- Header Component ---
  const Header: React.FC = () => (
    <header className="py-4 px-6 border-b border-gray-100 shadow-sm bg-white">
      <div className="flex items-center">
        {/* CORRECTED: Logo styled to match the image: FW in dark shape, FinWin in black/gray */}
        <span className="flex items-center text-xl font-extrabold tracking-tight">
          <span className="inline-flex items-center justify-center h-8 w-8 bg-blue-600 text-white text-base font-bold rounded-md mr-2">
            FW
          </span>
          <span className="text-blue-600 font-semibold">FinWin</span>
        </span>
      </div>
    </header>
  );

  // --- Footer Component ---
  const Footer: React.FC = () => (
    <footer className="w-full mt-auto py-5 px-6 border-t border-gray-100 text-sm text-gray-375 bg-white">
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
  );

  // --- Main Render ---
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-inter">
      <Header />

      {/* Centered Verification Card */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white p-8 md:p-12 rounded-xl shadow-lg text-center">
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Verify Your Identity
          </h1>
          <p className="text-gray-375 mb-8 max-w-xs mx-auto text-sm">
            Please enter the 6-digit verification code sent to your registered email or phone number.
          </p>

          {/* Code Input Boxes */}
          <div className="flex justify-center space-x-3 mb-8">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={setInputRef(index)}
                className={`
                  w-10 h-14 md:w-12 md:h-16 text-2xl md:text-3xl font-mono text-center
                  border-2 rounded-lg transition-all duration-150
                  focus:outline-none focus:ring-2 focus:ring-blue-375 focus:border-blue-375
                  ${digit ? 'border-blue-375 bg-blue-50/50' : 'border-gray-300'}
                  bg-gray-50
                `}
                // Automatically focus the first input on load
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Verify Button */}
         <a href='/pass_success'> <button
            onClick={handleVerify}
            disabled={!isCodeComplete || isVerifying}
            className={`
              w-full py-3 px-4 mb-4 rounded-lg font-semibold text-white transition
              ${isCodeComplete && !isVerifying
                ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200'
                : 'bg-blue-400 cursor-not-allowed'
              }
              flex items-center justify-center
            `}
          >
            {isVerifying ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </button></a>

          {/* Resend Link */}
          <a href="#" className="block text-sm text-blue-600 hover:text-blue-800 font-medium transition mb-2">
            Resend Code
          </a>

          {/* Secondary Text */}
          <p className="text-xs text-gray-375 mb-6">
            Didn't receive the code? Check your spam folder or try again.
          </p>

          {/* Contact Support */}
          <p className="text-sm text-gray-700">
            Need help? <a href="#" className="font-semibold text-blue-600 hover:text-blue-800 transition">Contact Support</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
