import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const [userPlan, setUserPlan] = useState("basic"); // Default plan
  const [isAdmin, setIsAdmin] = useState(false); // Default admin status
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const response = await axios.get("/api/users/me/plan");
        setUserPlan(response.data.plan); // e.g., "basic", "pro", "enterprise"
        setIsAdmin(response.data.isAdmin); // Assuming the backend returns `isAdmin`
      } catch (error) {
        console.error("Error fetching user plan:", error);
      } finally {
        setLoading(false); // Ensure loading is set to false after fetch
      }
    };

    fetchUserPlan();
  }, []);

  if (loading) {
    return <p>Loading...</p>; // Show a loading message while fetching data
  }

  return (
    <nav style={styles.navbar}>
      <div style={styles.brand}>
        <NavLink to="/" style={styles.link}>
          MyApp
        </NavLink>
      </div>
      <div style={styles.links}>
        <NavLink to="/dashboard" style={styles.link}>
          Dashboard
        </NavLink>
        <NavLink to="/products" style={styles.link}>
          Products
        </NavLink>
        <NavLink to="/customers" style={styles.link}>
          Customers
        </NavLink>
        <NavLink to="/orders" style={styles.link}>
          Orders
        </NavLink>

        {userPlan !== "basic" && (
          <>
            <NavLink to="/invoices" style={styles.link}>
              Invoices
            </NavLink>
            <NavLink to="/analytics/sales" style={styles.link}>
              Analytics
            </NavLink>
          </>
        )}

        <NavLink to="/pricing" style={styles.link}>
          Pricing
        </NavLink>
        <NavLink to="/user/settings" style={styles.link}>
          Settings
        </NavLink>
        <NavLink to="/notifications" style={styles.link}>
          Notifications
        </NavLink>

        {isAdmin && (
          <>
            <NavLink to="/admin/dashboard" style={styles.link}>
              Admin Dashboard
            </NavLink>
            <NavLink to="/admin/manage-roles" style={styles.link}>
              Manage Roles
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 20px",
    backgroundColor: "#333",
    color: "#fff",
  },
  brand: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  links: {
    display: "flex",
    gap: "15px",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "1rem",
  },
};

export default Navbar;
