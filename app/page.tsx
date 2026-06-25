"use client";

import React, { useEffect } from "react";
// 1. Static import for Bootstrap JS is mandatory for toggler functionality.
import "bootstrap/dist/js/bootstrap.bundle.min.js"; 

const Page: React.FC = () => {
  useEffect(() => {
    document.title = "FinWin — Bank Smarter. Live Better.";
  }, []);

  return (
    <>
      {/* Loading CSS directly ensures immediate style application */}
      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
      />
      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" 
      />
      

      {/* Global styles (UPDATED for button size/shape) */}
      <style jsx global>{`
        :root {
          --navy: #00277aff;
          --dark-navy:  #00277aff; 
          --hero-bg: #eef6ff;
          --muted: #6b7280;
          --card-border: #eef2f7;
          --soft-bg: #fbfbfd;
          --radius: 14px;
        }

        body {
          font-family: "Poppins", system-ui, -apple-system, "Segoe UI", Roboto,
            "Helvetica Neue", Arial;
          color:  #00277aff;
          background: #ffffff;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          margin: 0;
        }

        /* NAV */
        .navbar {
          padding: 20px 0;
          background: #ffffff;
        }
        .navbar-brand {
          font-weight: 700;
          color: var(--navy);
          display: flex;
          gap: 0.6rem;
          align-items: center;
        }
        .brand-mark {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: linear-gradient(135deg, #1a4ea1, #00277aff);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 18px;
          box-shadow: 0 2px 6px rgba(12, 34, 80, 0.12);
        }
        .navbar .nav-link {
          color: #111827;
          font-weight: 500;
        }
        
        /* UPDATED: ALL NAV BUTTONS use the larger, rounded style */
        .navbar .btn {
          border-radius: 12px; /* Adopted from Hero CTA */
          padding: 10px 18px;   /* Adopted from Hero CTA */
          font-weight: 600;
        }
        
        /* SIGN UP BUTTON */
        .btn-signup {
          background: var(--dark-navy);
          color: #fff;
          border: none;
          box-shadow: none;
        }
        
        /* LOGIN BUTTON */
        .btn-outline-custom {
          background: #fff;
          color: var(--dark-navy);
          border: 1px solid rgba(11, 35, 64, 0.2);
        }

        /* HERO */
        .hero {
          background: var(--hero-bg);
          padding: 64px 0 72px;
        }
        .hero h1 {
          font-size: clamp(30px, 6vw, 56px);
          line-height: 1.02;
          font-weight: 800;
          margin: 0 0 18px 0;
          color: #00277aff;
        }
        .hero p.lead {
          color: var(--muted);
          font-size: 15px;
          margin-bottom: 22px;
          max-width: 520px;
        }
        /* No change needed here, as .navbar .btn now controls padding/radius */
        .hero .cta-group .btn {
          border-radius: 12px;
          padding: 10px 18px;
        }
        .hero .hero-img {
          background: #fff;
          border-radius: 8px;
          padding: 12px;
          display: inline-block;
          box-shadow: 0 6px 20px rgba(8, 20, 44, 0.06);
        }
        .hero .hero-img img {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 6px;
        }

        /* KEY FEATURES */
        .features {
          padding: 56px 0;
        }
        .features h2 {
          font-weight: 700;
          margin-bottom: 28px;
          color:  #00277aff;
        }
        .feature-card {
          background: #fff;
          border: 1px solid var(--card-border);
          border-radius: var(--radius);
          padding: 28px;
          min-height: 170px;
          text-align: center;
        }
        .feature-card .icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          background: linear-gradient(180deg, #fff, #f6f9ff);
          border: 1px solid rgba(15, 43, 90, 0.06);
          color: var(--navy);
          font-size: 22px;
        }
        .feature-card h5 {
          margin-bottom: 8px;
          font-weight: 700;
        }
        .feature-card p {
          color: var(--muted);
          font-size: 13px;
          margin: 0;
        }

        /* MISSION */
        .mission {
          background: var(--soft-bg);
          padding: 52px 0;
        }
        .customer-number {
          font-weight: 800;
          font-size: 48px;
          color: var(--navy);
        }
        .mission .small-logos {
          opacity: 0.45;
          margin-top: 18px;
          display: flex;
          gap: 18px;
          align-items: center;
          justify-content: center;
        }

        /* TESTIMONIALS */
        .testimonials {
          padding: 56px 0;
        }
        .testimonial {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #eef2f7;
          padding: 22px;
          min-height: 140px;
          font-style: italic;
        }
        .testimonial .meta {
          margin-top: 14px;
          font-style: normal;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          display: inline-block;
          background: #e6eefc;
          flex: 0 0 40px;
          border: 2px solid #fff;
        }
        .testimonial .name {
          font-weight: 700;
          color:  #00277aff;
          font-size: 14px;
        }
        .testimonial .role {
          font-size: 12px;
          color: var(--muted);
        }

        /* FOOTER */
        footer {
          padding: 26px 0;
          border-top: 1px solid #f1f3f7;
          color: var(--muted);
          font-size: 13px;
        }

        /* Responsive tweaks */
        @media (max-width: 767.98px) {
          .hero {
            padding: 36px 0 48px;
          }
          .navbar .nav-link {
            padding: 0.25rem 0.5rem;
          }
          .mission .customer-number {
            font-size: 36px;
            text-align: center;
          }
          .mission .small-logos {
            justify-content: flex-start;
          }
        }
      `}</style>

      {/* NAV */}
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <a className="navbar-brand" href="#">
            <span className="brand-mark">FW</span>
            <span style={{ fontSize: 18 }}>FinWin</span>
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navMenu"
            aria-controls="navMenu"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          {/* FIX APPLIED: Uses 'd-block' for forced visibility across all sizes */}
          <div className="navbar-collapse d-block" id="navMenu">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" href="#">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  About Us
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Contact
                </a>
              </li>
            </ul>

            <div className="d-flex align-items-center">
              {/* These buttons now use the larger, rounded style */}
             <a href="/login" > <button className="btn btn-primary me-3"
                  style={{ background: "var(--dark-navy)", border: "none" }} >Login</button></a>
             <a href="/signup"> <button className="btn btn-primary"
                  style={{ background: "var(--dark-navy)", border: "none" }} >Sign Up</button> </a>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-md-6 order-2 order-md-1">
              <h1>Bank Smarter. Live Better.</h1>
              <p className="lead">
                Experience seamless financial management with BankApp. Secure,
                intuitive, and designed for your peace of mind.
              </p>

              <div className="d-flex gap-2 cta-group">
                <button
                  className="btn btn-primary"
                  style={{ background: "var(--dark-navy)", border: "none" }} 
                >
                  Get Started
                </button>
                <button className="btn btn-outline-custom">Learn More</button>
              </div>
            </div>

            <div className="col-md-6 text-md-end order-1 order-md-2 d-flex justify-content-md-end">
              <div className="hero-img" style={{ maxWidth: 520, width: "100%" }}>
                {/* Replace src with your own image path if needed */}
                <img
                  src="/mnt/data/5bdc298c-0593-4c97-8a9a-d7c8477f87da.png"
                  alt="Hero image"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <section className="features">
        <div className="container text-center">
          <h2>Key Features</h2>

          <div className="row gx-4 gy-4 justify-content-center mt-3">
            <div className="col-md-4">
              <div className="feature-card">
                <div className="icon mb-2">
                  <i className="bi bi-shield-lock-fill" />
                </div>
                <h5>Secure Transactions</h5>
                <p>
                  Your financial data is protected with state-of-the-art
                  encryption and fraud prevention.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-card">
                <div className="icon mb-2">
                  <i className="bi bi-clock-history" />
                </div>
                <h5>24/7 Access</h5>
                <p>
                  Manage your accounts anytime, anywhere with our intuitive
                  mobile app and online banking.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-card">
                <div className="icon mb-2">
                  <i className="bi bi-pie-chart-fill" />
                </div>
                <h5>Personal Finance Insights</h5>
                <p>
                  Gain a clear understanding of your spending habits with
                  personalized reports and budgeting tools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="mission text-center">
        <div className="container">
          <h2
            className="mb-5"
            style={{ fontWeight: 800, color: " #00277aff" }}
          >
            Our Mission & Commitment
          </h2>

          <div className="row g-4 justify-content-center">
            <div className="col-md-8">
              <div className="feature-card">
                <p style={{ color: "#5f697eff", lineHeight: 1.7, marginBottom: 18 }}>
                  At BankApp, we are dedicated to empowering individuals and
                  businesses with innovative and reliable financial solutions.
                  Our mission is to simplify banking, making it accessible,
                  secure, and insightful for everyone.
                </p>
                <p style={{ fontStyle: "italic", fontWeight: 500, color: "#374151" }}>
                  We believe in transparency, integrity, and putting our
                  customers first in every decision we make.
                </p>
                <div className="mt-4">
                  <div className="customer-number">1M+</div>
                  <div style={{ fontWeight: 600, color: " #00277aff" }}>
                    Satisfied Customers
                  </div>
                </div>
                <div className="small-logos mt-4 justify-content-center">
                  <svg width="26" height="18" viewBox="0 0 26 18" xmlns="http://www.w3.org/2000/svg"><path d="M1 17L13 1L25 17H1Z" fill="#bfcde9"/></svg>
                  <svg width="26" height="18" viewBox="0 0 26 18" xmlns="http://www.w3.org/2000/svg"><path d="M13 1L25 17H1L13 1Z" fill="#cbd8ef"/></svg>
                  <svg width="26" height="18" viewBox="0 0 26 18" xmlns="http://www.w3.org/2000/svg"><circle cx="13" cy="9" r="7" fill="#dfe9f8"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="container">
          <div className="text-center">
            <h2>What Our Customers Say</h2>
          </div>

          <div className="row gx-4 gy-4 mt-4 justify-content-center">
            <div className="col-md-6">
              <div className="testimonial">
                <div>
                  "BankApp has transformed how I manage my finances. The
                  insights are incredibly helpful, and the support is top-notch!"
                </div>

                <div className="meta">
                  <div className="avatar">
                    <img src="https://i.pravatar.cc/80?img=12" alt="Sarah" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div>
                    <div className="name">Sarah Chen</div>
                    <div className="role">Small Business Owner</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="testimonial">
                <div>
                  "Switching to BankApp was the best decision for our family's
                  budgeting. Secure and so easy to use!"
                </div>

                <div className="meta">
                  <div className="avatar">
                    <img src="https://i.pravatar.cc/80?img=5" alt="Michael" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div>
                    <div className="name">Michael Johnson</div>
                    <div className="role">Project Manager</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="mb-3 mb-md-0">
            <strong>Company</strong> &nbsp;&nbsp; Support &nbsp;&nbsp; Legal
          </div>

          <div className="d-flex gap-3">
            <a href="#" className="text-muted fs-5"><i className="bi bi-facebook" /></a>
            <a href="#" className="text-muted fs-5"><i className="bi bi-instagram" /></a>
            <a href="#" className="text-muted fs-5"><i className="bi bi-twitter" /></a>
            <a href="#" className="text-muted fs-5"><i className="bi bi-linkedin" /></a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Page;