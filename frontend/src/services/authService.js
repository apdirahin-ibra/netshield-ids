const STORAGE_KEY = "netshield.auth";
const SESSION_KEY = "netshield.auth.session";

const USERS = [
  { id: 1, name: "System Administrator", email: "admin@netshield.local", password: "Admin123!", role: "ADMIN", status: "Active" },
  { id: 2, name: "Security Analyst", email: "analyst@netshield.local", password: "Analyst123!", role: "SECURITY_ANALYST", status: "Active" },
];

const publicUser = ({ password: _password, ...user }) => user;

export const authService = {
  async login(email, password, remember = false) {
    await new Promise((resolve) => setTimeout(resolve, 550));
    const match = USERS.find((user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password);
    if (!match) throw new Error("Invalid email or password.");
    const session = {
      access_token: `mock-${match.role.toLowerCase()}-${Date.now()}`,
      token_type: "bearer",
      user: publicUser(match),
      created_at: new Date().toISOString(),
    };
    (remember ? localStorage : sessionStorage).setItem(remember ? STORAGE_KEY : SESSION_KEY, JSON.stringify(session));
    return session;
  },
  async logout() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  },
  getSession() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  },
};
