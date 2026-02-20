import React from 'react';
import { auth, provider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';

const Login = () => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error.message);
    }
  };

  // Background image is pulled from the PUBLIC folder here
  const bgStyle = {
    backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.75), rgba(17, 24, 39, 0.85)), url('/citycollege.jpg')`
  };

  return (
    <div className="login-bg" style={bgStyle}>
      {/* Top Branding (Matches Image 1) */}
      <div className="text-center text-white position-absolute top-0 w-100 mt-5">
        <div className="d-inline-block bg-white bg-opacity-10 p-3 rounded-4 mb-3">
          <span style={{ fontSize: '2rem' }}>📖</span>
        </div>
        <h1 className="fw-bold display-5 m-0">CAMS</h1>
        <p className="lead opacity-75">Course Assessment Management System</p>
      </div>

      {/* Login Card (Matches Image 8) */}
      <div className="login-card text-center">
        <h2 className="fw-bold mb-2">Welcome Back</h2>
        <p className="text-muted mb-4">Sign in to manage your course assessments</p>
        
        <button onClick={handleLogin} className="btn btn-dark w-100 py-3 d-flex align-items-center justify-content-center gap-2 mb-4">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/pwa_googleg_color_64dp.png" width="20" alt="G" />
          <span className="fw-bold">Continue with Google</span>
        </button>
        
        <p className="text-muted px-3" style={{ fontSize: '11px' }}>
          By signing in, you agree to our <br/>
          <span className="text-decoration-underline">Terms of Service</span> and <span className="text-decoration-underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default Login;