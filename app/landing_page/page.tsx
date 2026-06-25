'use client';

import React, { useEffect, useState } from 'react';

const Page: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.title = 'FinWin — Bank Smarter. Live Better.';
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <span className="text-white font-bold text-lg">FW</span>
              </div>
              <span className="text-xl font-bold text-slate-900">FinWin</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-slate-600 hover:text-slate-900 font-medium transition">Home</a>
              <a href="#" className="text-slate-600 hover:text-slate-900 font-medium transition">Features</a>
              <a href="#" className="text-slate-600 hover:text-slate-900 font-medium transition">About Us</a>
              <a href="#" className="text-slate-600 hover:text-slate-900 font-medium transition">Contact</a>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <a href="/login">
                <button className="px-6 py-2.5 text-slate-900 font-semibold rounded-full border border-slate-300 hover:bg-slate-50 transition">
                  Login
                </button>
              </a>
              <a href="/signup">
                <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full hover:from-blue-700 hover:to-blue-800 transition shadow-lg shadow-blue-600/30">
                  Sign Up
                </button>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-slate-200 py-4 space-y-3">
              <a href="#" className="block text-slate-600 hover:text-slate-900 font-medium">Home</a>
              <a href="#" className="block text-slate-600 hover:text-slate-900 font-medium">Features</a>
              <a href="#" className="block text-slate-600 hover:text-slate-900 font-medium">About Us</a>
              <a href="#" className="block text-slate-600 hover:text-slate-900 font-medium">Contact</a>
              <div className="flex gap-2 pt-3">
                <a href="/login" className="flex-1">
                  <button className="w-full px-4 py-2 text-slate-900 font-semibold rounded-full border border-slate-300">
                    Login
                  </button>
                </a>
                <a href="/signup" className="flex-1">
                  <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full">
                    Sign Up
                  </button>
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Hero Content */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Bank Smarter. Live Better.
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                Experience seamless financial management with FinWin. Secure, intuitive, and designed for your peace of mind.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full hover:from-blue-700 hover:to-blue-800 transition shadow-lg shadow-blue-600/30">
                  Get Started
                </button>
                <button className="px-8 py-3 text-blue-600 font-semibold rounded-full border-2 border-blue-600 hover:bg-blue-50 transition">
                  Learn More
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex justify-center md:justify-end">
              <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl p-4 shadow-2xl shadow-slate-200/50">
                  <img
                    src="/mnt/data/5bdc298c-0593-4c97-8a9a-d7c8477f87da.png"
                    alt="Hero image"
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Key Features
            </h2>
            <p className="text-slate-600 text-lg">Everything you need for modern banking</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mb-6 border border-blue-200">
                <svg className="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Transactions</h3>
              <p className="text-slate-600 leading-relaxed">
                Your financial data is protected with state-of-the-art encryption and fraud prevention.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center mb-6 border border-purple-200">
                <svg className="w-7 h-7 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">24/7 Access</h3>
              <p className="text-slate-600 leading-relaxed">
                Manage your accounts anytime, anywhere with our intuitive mobile app and online banking.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center mb-6 border border-emerald-200">
                <svg className="w-7 h-7 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Personal Finance Insights</h3>
              <p className="text-slate-600 leading-relaxed">
                Gain a clear understanding of your spending habits with personalized reports and budgeting tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Our Mission & Commitment
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12 shadow-lg">
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              At FinWin, we are dedicated to empowering individuals and businesses with innovative and reliable financial solutions. Our mission is to simplify banking, making it accessible, secure, and insightful for everyone.
            </p>
            <p className="text-lg text-slate-700 italic font-medium mb-8">
              We believe in transparency, integrity, and putting our customers first in every decision we make.
            </p>
            
            <div className="text-center py-8 border-t border-slate-200">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                1M+
              </div>
              <p className="text-slate-600 font-semibold">Satisfied Customers</p>
            </div>

            <div className="flex justify-center gap-6 mt-8 pt-8 border-t border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-200 to-blue-100" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-200 to-purple-100" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-pink-100" />
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-slate-600 text-lg">Join thousands of satisfied users</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8">
              <p className="text-slate-700 mb-6 leading-relaxed italic">
                "FinWin has transformed how I manage my finances. The insights are incredibly helpful, and the support is top-notch!"
              </p>
              <div className="flex items-center gap-4">
                <img
                  src="https://i.pravatar.cc/80?img=12"
                  alt="Sarah"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900">Sarah Chen</p>
                  <p className="text-sm text-slate-600">Small Business Owner</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8">
              <p className="text-slate-700 mb-6 leading-relaxed italic">
                "Switching to FinWin was the best decision for our family's budgeting. Secure and so easy to use!"
              </p>
              <div className="flex items-center gap-4">
                <img
                  src="https://i.pravatar.cc/80?img=5"
                  alt="Michael"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900">Michael Johnson</p>
                  <p className="text-sm text-slate-600">Project Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pb-8 border-b border-slate-800">
            <div className="space-x-6">
              <a href="#" className="hover:text-white transition">Company</a>
              <a href="#" className="hover:text-white transition">Support</a>
              <a href="#" className="hover:text-white transition">Legal</a>
            </div>

            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a href="#" className="hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 002.856-3.51 10.02 10.02 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
              </a>
              <a href="#" className="hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.144-8.883 0C5.282 16.736 5.017 15.622 5 12c.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0C18.718 7.264 18.982 8.378 19 12c-.018 3.629-.285 4.736-2.559 4.892zM9.5 15.5v-7l5.5 3.5-5.5 3.5z" /></svg>
              </a>
              <a href="#" className="hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.002 1.413-.103.25-.129.599-.129.948v5.444h-3.554s.05-8.736 0-9.646h3.554v1.364c.429-.659 1.191-1.595 2.897-1.595 2.117 0 3.704 1.385 3.704 4.362v5.515zM5.337 8.855c-1.144 0-1.915-.758-1.915-1.708 0-.951.77-1.708 1.957-1.708 1.187 0 1.914.757 1.937 1.708 0 .95-.75 1.708-1.979 1.708zm1.682 11.597H3.617V9.021h3.402v11.431zM22.224 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.224 0z" /></svg>
              </a>
            </div>
          </div>

          <div className="text-center mt-8 text-sm">
            <p>&copy; 2024 FinWin. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;
