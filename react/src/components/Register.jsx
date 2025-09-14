
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RegisterUser } from "../config/redux/action/authAction";
import { useNavigate } from "react-router-dom";



const Register = ({ onRegister, error }) => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isError, isSuccess, message, user } = useSelector((state) => state.auth);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (isError) setApiError(message);
    else setApiError("");
    if (isSuccess && user && user.username) {
      // On successful registration, redirect to /login and auto-refresh
      if (onRegister && window.location.pathname !== "/login") onRegister(user);
      if (window.location.pathname !== "/login") {
        navigate("/login");
        Promise.resolve().then(() => {
          window.location.reload();
        });
      }
    }
    // eslint-disable-next-line
  }, [isError, isSuccess, message, user, onRegister, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setApiError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setApiError("");
    dispatch(RegisterUser(form));
  };

  return (
    <div className="bg-black min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%231DA1F2' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`}}>
        <div className="text-center">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-24 h-24 text-white">
            <g>
              <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </g>
          </svg>
          <h1 className="text-4xl font-bold text-white mt-4">Happening now</h1>
          <h2 className="text-2xl font-bold text-white mt-4">Join X today.</h2>
        </div>
      </div>
      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-8 h-8 mx-auto text-white">
              <g>
                <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </g>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-8">Create your account</h1>
          {(error || apiError) && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
              {error || apiError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 pr-12"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 flex items-center h-full top-0 text-gray-500 hover:text-white transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  style={{height: '100%'}}
                >
                  {showPassword ? (
                    <span className="material-symbols-outlined">visibility_off</span>
                  ) : (
                    <span className="material-symbols-outlined">visibility</span>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition"
            >
              Register
            </button>
            <div className="mt-6 text-center">
              <span
                onClick={() => window.location.href = '/login'}
                className="block text-lg md:text-xl lg:text-2xl font-bold text-blue-400 hover:text-blue-500 cursor-pointer select-none transition-colors py-2"
                style={{letterSpacing: '0.02em'}}
              >
                Already have an account? Log in
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
