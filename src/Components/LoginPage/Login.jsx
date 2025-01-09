import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import LoginBanner from '../../assets/Images/loginBanner.jpg'
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form from refreshing the page

    // Simple validation check
    if (email === '' || password === '') {
      setError('Both email and password are required.');
      return;
    }

    // Check if credentials match
    if (email === 'xerago@gmail.com' && password === 'Xerago') {
      // Redirect to the dashboard
      navigate('/dashboard'); // Use navigate() instead of history.push()
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side - Login Form */}
      <div className="w-1/2 flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full px-6">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Log in to your account</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>} {/* Display error */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Update email state
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Update password state
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {/* <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                /> */}
                {/* <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label> */}
              </div>

              {/* <div className="text-sm">
                <a href="#" className="font-medium text-[#24a248] hover:text-indigo-500">
                  Forgot your password?
                </a>
              </div> */}
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white  hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-[#292C89] "
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="w-1/2 relative border border-[#292C89] d-flex h-100 justify-center items-center flex-col">
        {/* You can include the background image here */}
        {/* <img src={LoginBanner} alt="login banner" className='w-full h-screen' /> */}
        <h1 className='text-[#292C89]'>Xcelerate CRM</h1>
        <p>Fast, seamless CRM migration between platforms.</p>
      </div>
    </div>
  );
}
