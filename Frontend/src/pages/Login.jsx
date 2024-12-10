import React, { useState } from "react";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isUsernameEntered, setIsUsernameEntered] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateUsername = () => {
    if (formData.username.endsWith("@heraldcollege.edu.np")) {
      setIsUsernameEntered(true);
      setErrorMessage("");
    } else {
      setErrorMessage("Invalid email address. Use a Herald College email.");
    }
    setIsLoading(false);
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(validateUsername, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="h-full flex justify-center items-center">
      <div className="mt-4">
        <img
          src="/src/assets/login-banner.png"
          alt="HCK Logo"
          className="mx-auto mb-6 w-2/4"
        />
        <div className="flex justify-center items-center flex-col gap-5">
          <h1 className="font-semibold text-4xl">
            Sign in with College Account
          </h1>
          <p className="w-1/3 text-center">
            Please enter your college email address to sign in. Your email
            should be in the following format: <br />
            <strong>username@heraldcollege.edu.np</strong> <br />
            For example: <strong>np03cs4a220001@heraldcollege.edu.np</strong>.
          </p>
          <form
            onSubmit={isUsernameEntered ? handleSubmit : handleUsernameSubmit}
            className="space-y-4"
          >
            <div className="flex items-center relative">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                required
                className="w-96 p-3 text-sm border bg-white rounded-[8px] shadow-sm placeholder-black"
              />
              {isLoading && (
                <div className="absolute right-4 w-6 h-6 border-2 border-gray-400 border-solid rounded-full animate-spin"></div>
              )}
            </div>

            {errorMessage && (
              <div className="text-red-500 text-sm mt-2 text-center">
                {errorMessage}
              </div>
            )}

            {isUsernameEntered && !isLoading && (
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Password"
                className="w-96 p-3 text-sm border bg-white rounded-[8px] shadow-sm placeholder-black"
              />
            )}

            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className="px-6 py-1 bg-blue-500 text-white rounded-[8px] hover:bg-blue-600 focus:outline-none"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
