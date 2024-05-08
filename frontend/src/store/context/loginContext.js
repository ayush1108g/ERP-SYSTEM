import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

const LoginContext = React.createContext({
  AccessToken: null,
  RefreshToken: null,
  loading: false,
  isLoggedIn: false,
  name: null,
  role: null,
  user: null,
  setUser: () => {},
  setName: () => {},
  setRole: () => {},
  login: () => {},
  logout: () => {},
  setAccessToken: () => {},
  setRefreshToken: () => {},
  setLoading: () => {},
});

const LoginContextProvider = (props) => {
  const [cookie, setCookie] = useCookies(["AccessToken", "RefreshToken"]);

  const [loading, setLoading] = useState(false);
  const [AccessToken, setAccessToken] = useState(null);
  const [RefreshToken, setRefreshToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  // function to handle login
  const loginHandler = (AccessToken, RefreshToken, user) => {
    setAccessToken(AccessToken);
    setRefreshToken(RefreshToken);
    setIsLoggedIn(true);
    setUser(user);
  };

  // check if user is logged in
  useEffect(() => {
    if (user) {
      setName(user.personal_info.name);
      setRole(user.role);
    }
    console.log(user);
  }, [user]);

  // function to handle logout
  const logoutHandler = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setIsLoggedIn(false);
    setName(null);
    setCookie("AccessToken", null, { path: "/", maxAge: 0 });
    setCookie("RefreshToken", null, { path: "/", maxAge: 0 });
    setRole(null);
    setUser(null);
  };

  // function to update access token
  const updateAccessToken = (newAccessToken) => {
    console.log(newAccessToken);
    setCookie("AccessToken", newAccessToken, {
      path: "/",
      maxAge: 60 * 60 * 24 * 1 * 0.2, // 0.2 days = 4.8 hours
    });
    setAccessToken(newAccessToken);
  };
  const updateRefreshToken = (newRefreshToken) => {
    console.log(newRefreshToken);
    setCookie("RefreshToken", newRefreshToken, {
      path: "/",
      maxAge: 60 * 60 * 24 * 1 * 0.6, // 0.6 days = 14.4 hours
    });
    setRefreshToken(newRefreshToken);
  };

  const context = {
    name: name,
    isLoggedIn: isLoggedIn,
    loading: loading,
    AccessToken: AccessToken,
    RefreshToken: RefreshToken,
    role: role,
    user,
    setUser: setUser,
    setName: setName,
    setRole: setRole,
    setLoading: setLoading,
    setIsLoggedIn: setIsLoggedIn,
    setAccessToken: updateAccessToken,
    setRefreshToken: updateRefreshToken,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <LoginContext.Provider value={context}>
      {props.children}
    </LoginContext.Provider>
  );
};

export default LoginContext;
export { LoginContextProvider };
