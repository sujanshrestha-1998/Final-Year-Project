import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isEmailEntered, setIsEmailEntered] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateEmail = () => {
    if (formData.email.endsWith("@heraldcollege.edu.np")) {
      setIsEmailEntered(true);
      setErrorMessage("");
    } else {
      setErrorMessage("Invalid email address. Use a Herald College email.");
    }
    setIsLoading(false);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(validateEmail, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/rtelogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data.message);

        // Save login state and timestamp in localStorage
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("loginTimestamp", Date.now().toString());

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("There was an error logging in.");
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-[#f2f1f1] h-screen">
      <div className="h-[80%] flex justify-center items-center">
        <div className="mt-28 md:mt-4">
          <img
            src="/src/assets/login-banner.png"
            alt="HCK Logo"
            className="mx-auto mb-6 md:w-2/4"
          />
          <div className="flex justify-center items-center flex-col gap-5">
            <h1 className="font-semibold text-center text-3xl md:text-4xl">
              Administration Login
            </h1>
            <p className="md:w-1/3 text-center text-sm md:text-base">
              Please enter your college email address to sign in. Your email
              should be in the following format: <br />
              <strong>firstname.lastname@heraldcollege.edu.np</strong> <br />
              For example: <strong>John.Doe@heraldcollege.edu.np</strong>
            </p>
            <form
              onSubmit={isEmailEntered ? handleSubmit : handleEmailSubmit}
              className="space-y-4"
            >
              <div className="flex items-center relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  required
                  className="w-72 md:w-96 p-3 text-sm border bg-white rounded-[8px] shadow-sm placeholder-black"
                />
                {isLoading && (
                  <div className="absolute right-4 w-6 h-6 border-2 border-gray-400 border-solid rounded-full animate-spin"></div>
                )}
              </div>

              {isEmailEntered && !isLoading && (
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Password"
                  className="w-72 md:w-96 p-3 text-sm border bg-white rounded-[8px] shadow-sm placeholder-black"
                />
              )}

              {errorMessage && (
                <div className="text-red-500 text-sm mt-2 text-center w-64 mx-auto md:w-full">
                  {errorMessage}
                </div>
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
    </div>
  );
};

export default Login;
