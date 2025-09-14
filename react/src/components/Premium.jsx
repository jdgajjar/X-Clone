import React, { useEffect, useState } from "react";

const Premium = ({ user, verificationExpiresAt, onUpgrade }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    console.log('verificationExpiresAt:', verificationExpiresAt, typeof verificationExpiresAt);
    if (!verificationExpiresAt) return;
    const expires = new Date(verificationExpiresAt);
    if (isNaN(expires.getTime())) {
      setTimeLeft('Invalid expiry date');
      return;
    }
    const interval = setInterval(() => {
      const now = new Date();
      const diff = expires - now;
      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(
        `${days > 0 ? days + 'd ' : ''}${hours.toString().padStart(2, '0')}:` +
        `${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [verificationExpiresAt]);

  return (
    <div className="bg-gray-900 text-white font-sans min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <a href="/" className="absolute left-4 top-4 flex items-center text-white hover:text-blue-400">
          <span className="material-symbols-outlined mr-2">arrow_back</span> Back
        </a>
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-3">Upgrade to Premium</h1>
        <p className="text-center text-gray-400 mb-6">
          Enjoy an enhanced experience, exclusive creator tools, top-tier verification and security.<br />
          <a href="/register" className="text-blue-400 underline">sign up here</a>
        </p>
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-800 rounded-lg p-1">
            <button className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md">Get<span className="text-blue-400 ml-1 text-xs"> blue tick mark</span></button>
          </div>
        </div>
        {user?.IsVerified ? (
          <>
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-gray-800 rounded-lg p-1">
                <button className="px-4 py-2 text-sm flex items-center gap-1 font-medium text-white bg-gray-700 rounded-md">
                  <span className="material-symbols-outlined">verified</span><span> Verified</span>
                </button>
              </div>
            </div>
            {verificationExpiresAt && !isNaN(new Date(verificationExpiresAt).getTime()) ? (
              <div className="flex justify-center mb-4">
                <div className="inline-flex bg-gray-800 rounded-lg p-2">
                  <span className="text-green-400 font-semibold mr-2">Verification ends in:</span>
                  <span className="text-blue-400 font-mono">{timeLeft}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <div className="inline-flex bg-gray-800 rounded-lg p-2">
                  <span className="text-red-400 font-semibold mr-2">No valid expiry set</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={onUpgrade}>
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-gray-800 rounded-lg p-1">
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md">Upgrade to Premium</button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Premium;
