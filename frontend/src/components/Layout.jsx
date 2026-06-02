import { NavLink, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: "◫", end: true },
  { to: "/products", label: "Products", icon: "▣" },
  { to: "/customers", label: "Customers", icon: "◎" },
  { to: "/orders", label: "Orders", icon: "◈" },
];

const pageTitles = {
  "/": "Dashboard",
  "/products": "Products",
  "/customers": "Customers",
  "/orders": "Orders",
};

function getPageTitle(pathname) {
  const orderMatch = pathname.match(/^\/orders\/(\d+)$/);
  if (orderMatch) return `Order #${orderMatch[1]}`;
  return pageTitles[pathname] || "Inventory";
}

export default function Layout() {
  const { pathname } = useLocation();
  const title = getPageTitle(pathname);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          {/* <span className="brand-icon">IV</span> */}
          <div className="brand-text">
            <span className="brand-name">Inventory</span>
            <span className="brand-tagline">Management System</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Menu</span>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="sidebar-link-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>Inventory &amp; Orders</p>
          <span>v1.0</span>
        </div>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">{title}</h1>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
