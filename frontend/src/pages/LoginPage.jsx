import React, { useEffect, useState, useRef, useContext } from "react";
import classes from "./LoginPage.module.css";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";
import { useNavigate } from "react-router";
import { useCookies } from "react-cookie";
import { motion } from "framer-motion";
import axios from "axios";
import { backendUrl } from "../constant.js";
import LoginContext from "../store/context/loginContext.js";
import { useAlert } from "../store/context/Alert-context.js";

const Login = () => {
  const alertCtx = useAlert();
  const navigate = useNavigate();
  const loginCtx = useContext(LoginContext);
  const [, setCookie] = useCookies(["AccessToken", "RefreshToken"]);

  const [message, setMessage] = useState("   ");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  //toggle password visibility
  const handleTogglePassword = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  //redirect to signup page
  const loginpageHandler = () => {
    navigate("/signup");
  };

  //redirect to forgot password page
  const forgotPasswordHandler = () => {
    navigate("forgotpassword");
  };


  //redirect to home page if already logged in
  useEffect(() => {
    if (loginCtx.isLoggedIn) {
      navigate("/");
    }
  }, [loginCtx.isLoggedIn, navigate]);

  // function to handle login
  const LoginHandler = async (e) => {
    e.preventDefault();
    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    //check if email and password are entered
    if (enteredEmail.trim().length === 0 || enteredPassword.trim().length === 0)
      return setMessage("Please enter all the fields");
    const data = { email: enteredEmail, password: enteredPassword };

    try {
      setIsLoading(true);
      let resp;
      resp = await axios.post(`${backendUrl}/api/v1/users/login`, data, { withCredentials: true }, { timeout: 30000, }); console.log(resp);

      if (resp.status === 201 || resp.status === 200) {
        emailInputRef.current.value = "";
        passwordInputRef.current.value = "";

        setCookie("AccessToken", resp.data.AccessToken, { path: "/", maxAge: 60 * 60 * 24 * 1 * 0.2 }); // 0.2 day = 4.8 hours
        setCookie("RefreshToken", resp.data.RefreshToken, { path: "/", maxAge: 60 * 60 * 24 * 1 * 0.6 }); // 0.6 day = 14.4 hours

        loginCtx.login(resp.data.AccessToken, resp.data.RefreshToken, resp.data.data.user); // login function from loginContext.js
        setMessage("Success");
        alertCtx.showAlert("success", "Logged In Successfully");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.log(error);
      if (error?.response?.data?.message) setMessage(error.response.data.message);
      else if (error.code === "ERR_BAD_REQUEST") setMessage("Email already in use");
      else if (error.code === "ERR_BAD_RESPONSE")
        setMessage("Server Not Responding...");
      else setMessage("An error occurred. Please try again.");
    }
    setIsLoading(false);
  };


  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className={`row d-flex align-items-center ${classes.container}`}>
        <motion.form key={loginCtx.isLoggedIn} className={`border-bottom-0 ${classes.form}`}>

          <h2>Login</h2>
          {!isLoading && <p className={classes.loading}> {message}</p>}
          {isLoading && <p className={classes.loading}>&nbsp; </p>}

          {/* spacing */}
          <div style={{ minHeight: '50px' }} />

          <div className="input-group mb-3">
            <input className="form-control shadow-none " type="email" id="email" autoComplete="on" placeholder="email-id" ref={emailInputRef}
              title="Please enter a valid email address in the format user@example.com" required />
          </div>

          <div className="input-group mb-3">
            <input type={showPassword ? "text" : "password"} id="password" className="form-control shadow-none" placeholder={!showPassword ? " · · · · · · · · " : "password"}
              ref={passwordInputRef} pattern=".{8,}" title="Password must be at least 8 characters long" required />
            <span className="input-group-text" onClick={handleTogglePassword}>
              {showPassword ? <RiEyeOffFill /> : <RiEyeFill />}
            </span>
          </div>

          {/* spacing */}
          <div style={{ minHeight: '50px' }} />

          <div className={classes.buttons}>
            <button className="btn btn-primary w-100" type="submit" onClick={LoginHandler} style={{ height: isLoading ? "" : "50px" }} >
              {isLoading ? (<div className="spinner-border text-danger" role="status" />) : "Login"}
            </button>
          </div>

          <div className={classes.pagechange}>
            <button onClick={loginpageHandler} className={"small font-monospace text-center row text-dark " + classes.signin}
              style={{ backgroundColor: 'transparent', border: 'none', fontWeight: 'bold' }}
            >
              {"Don't have an account? Sign Up"}
            </button>
            <motion.button initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className={"small d-flex justify-content-end font-monospace row text-dark " + classes.signin}
              style={{ fontSize: "2vh", backgroundColor: 'transparent', border: 'none', fontWeight: 'bold' }} onClick={forgotPasswordHandler}>
              Forgot Password?
            </motion.button>
          </div>
        </motion.form>
      </div >
    </div >
  );
};
export default Login;
