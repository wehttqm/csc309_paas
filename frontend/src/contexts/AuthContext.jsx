import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/*
 * This provider should export a `user` context state that is
 * set (to non-null) when:
 *     1. a hard reload happens while a user is logged in.
 *     2. the user just logged in.
 * `user` should be set to null when:
 *     1. a hard reload happens when no users are logged in.
 *     2. the user just logged out.
 */
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const key = localStorage.getItem("token");
    async function get_user() {
      const res = await fetch(BACKEND_URL + "/user/me", {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });
      if (res.status === 200) {
        const usr = await res.json();
        setUser(usr.user);
      } else {
        const err = await res.json();
        return err.message;
      }
      console.log(user);
    }
    if (key) get_user();
    else setUser(null);
  }, []);

  /*
   * Logout the currently authenticated user.
   *
   * @remarks This function will always navigate to "/".
   */
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  /**
   * Login a user with their credentials.
   *
   * @remarks Upon success, navigates to "/profile".
   * @param {string} username - The username of the user.
   * @param {string} password - The password of the user.
   * @returns {string} - Upon failure, Returns an error message.
   */
  const login = async (username, password) => {
    const res = await fetch(BACKEND_URL + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });
    if (res.status === 200) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      navigate("/profile");
    } else {
      const err = await res.json();
      return err.message;
    }
  };

  /**
   * Registers a new user.
   *
   * @remarks Upon success, navigates to "/".
   * @param {Object} userData - The data of the user to register.
   * @returns {string} - Upon failure, returns an error message.
   */
  const register = async (userData) => {
    const res = await fetch(BACKEND_URL + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...userData,
      }),
    });
    if (res.status === 201) {
      navigate("/success");
    } else {
      const err = await res.json();
      return err.message;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
