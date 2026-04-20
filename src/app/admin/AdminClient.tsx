"use client";

import React, { useState } from 'react';
import { useFlexi, RegisteredUser, Order } from '@/context/FlexiContext';
import styles from './Admin.module.css';
import {
  Lock,
  Users,
  ShoppingBag,
  BarChart2,
  LogOut,
  Eye,
  EyeOff,
  Shield,
  TrendingUp,
  CreditCard,
  Activity,
  LifeBuoy,
  CheckCircle,
} from 'lucide-react';

const ADMIN_PASSWORD = 'admin123';
type Tab = 'users' | 'orders' | 'stats' | 'tickets';

export default function AdminClient() {
  const { allUsers, allOrders } = useFlexi();

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect admin password.');
    }
  };

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setTickets(data);
        } else {
          setTickets([]);
        }
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  const resolveTicket = async (id: string) => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'resolved' })
      });
      if (res.ok) {
        fetchTickets();
      }
    } catch (err) {
      console.error('Error resolving ticket:', err);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'tickets' && authenticated) {
      fetchTickets();
    }
  }, [activeTab, authenticated]);

  /* ─── Stats ─────────────────────────────────────────── */
  const safeOrders = Array.isArray(allOrders) ? allOrders : [];
  const safeUsers = Array.isArray(allUsers) ? allUsers : [];

  const totalGMV = safeOrders.reduce((s, o) => s + (o.loanAmount || 0), 0);
  const activeEmis = safeOrders.filter(o => (o.paymentPlan || 0) > 1).length;
  const avgCredit =
    safeUsers.length > 0
      ? Math.round(safeUsers.reduce((s, u) => s + (u.creditLimit || 0), 0) / safeUsers.length)
      : 0;
  const fullPayOrders = safeOrders.filter(o => o.paymentPlan === 1).length;
  const bnplOrders = safeOrders.filter(o => (o.paymentPlan || 0) > 1).length;

  /* ─── Login Gate ─────────────────────────────────────── */
  if (!authenticated) {
    return (
      <div className={styles.loginWrap}>
        <div className={`glass-panel ${styles.loginCard}`}>
          <div className={styles.loginIcon}>
            <Shield size={40} color="var(--accent-primary)" />
          </div>
          <h1 className={styles.loginTitle}>Admin Panel</h1>
          <p className={styles.loginSub}>FlexiPay Operations Dashboard</p>

          {authError && <div className={styles.errorAlert}>{authError}</div>}

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.passWrap}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter admin password"
                value={password}
                required
                onChange={e => setPassword(e.target.value)}
                className={styles.passInput}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button type="submit" className={`glass-button ${styles.loginBtn}`}>
              <Lock size={16} />
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ─── Dashboard ──────────────────────────────────────── */
  return (
    <div className={styles.adminWrap}>
      {/* Sidebar */}
      <aside className={`glass-panel ${styles.sidebar}`}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoIcon}>F</div>
          <span>
            Flexi<span className="gradient-text">Admin</span>
          </span>
        </div>

        <nav className={styles.sideNav}>
          <button
            className={`${styles.navBtn} ${activeTab === 'users' ? styles.navBtnActive : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> Users
          </button>
          <button
            className={`${styles.navBtn} ${activeTab === 'orders' ? styles.navBtnActive : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={18} /> Orders
          </button>
          <button
            className={`${styles.navBtn} ${activeTab === 'stats' ? styles.navBtnActive : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <BarChart2 size={18} /> Stats
          </button>
          <button
            className={`${styles.navBtn} ${activeTab === 'tickets' ? styles.navBtnActive : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            <LifeBuoy size={18} /> Tickets
          </button>
        </nav>

        <button
          className={styles.logoutBtn}
          onClick={() => setAuthenticated(false)}
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Main content */}
      <main className={styles.content}>
        {/* ── Users Tab ── */}
        {activeTab === 'users' && (
          <section>
            <div className={styles.tabHeader}>
              <h2><Users size={22} /> Registered Users</h2>
              <span className={styles.badge}>{allUsers.length} total</span>
            </div>

            {allUsers.length === 0 ? (
              <div className={styles.emptyState}>
                <Users size={44} color="var(--text-secondary)" />
                <p>No users registered yet.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>PAN</th>
                      <th>Age</th>
                      <th>Income/mo</th>
                      <th>Employment</th>
                      <th>Credit Limit</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeUsers.map((u: RegisteredUser, i) => (
                      <tr key={u.pan || i}>
                        <td>{i + 1}</td>
                        <td>{u.name || 'Anonymous'}</td>
                        <td>{u.email || '—'}</td>
                        <td>{u.phone || '—'}</td>
                        <td><code>{u.pan || '—'}</code></td>
                        <td>{u.age || '—'}</td>
                        <td>₹{(u.income || 0).toLocaleString()}</td>
                        <td>
                          <span className={u.employmentStatus === 'salaried' ? styles.planFull : styles.planEmi}>
                            {u.employmentStatus || 'Salaried'}
                          </span>
                        </td>
                        <td>
                          <span className={styles.creditPill}>
                            ₹{(u.creditLimit || 0).toLocaleString()}
                          </span>
                        </td>
                        <td>{u.joinedAt ? new Date(u.joinedAt).toLocaleDateString('en-IN') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ── Orders Tab ── */}
        {activeTab === 'orders' && (
          <section>
            <div className={styles.tabHeader}>
              <h2><ShoppingBag size={22} /> All Orders</h2>
              <span className={styles.badge}>{allOrders.length} total</span>
            </div>

            {allOrders.length === 0 ? (
              <div className={styles.emptyState}>
                <ShoppingBag size={44} color="var(--text-secondary)" />
                <p>No orders placed yet.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Amount</th>
                      <th>Plan</th>
                      <th>EMI/mo</th>
                      <th>City</th>
                      <th>Delivery By</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeOrders.map((o: Order) => (
                      <tr key={o.orderId || Math.random()}>
                        <td><code>{o.orderId || '—'}</code></td>
                        <td>{o.userName || '—'}</td>
                        <td>{o.productName || '—'}</td>
                        <td>₹{(o.loanAmount || 0).toLocaleString()}</td>
                        <td>
                          {o.paymentPlan === 1
                            ? <span className={styles.planFull}>Full Pay</span>
                            : <span className={styles.planEmi}>{o.paymentPlan || 0}m EMI</span>}
                        </td>
                        <td>{o.emiAmount > 0 ? `₹${(o.emiAmount || 0).toLocaleString()}` : '—'}</td>
                        <td>{o.address?.city || '—'}</td>
                        <td>{o.deliveryDate || '—'}</td>
                        <td>
                          <span className={styles.statusProcessing}>{o.status || 'processing'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ── Stats Tab ── */}
        {activeTab === 'stats' && (
          <section>
            <div className={styles.tabHeader}>
              <h2><BarChart2 size={22} /> Platform Stats</h2>
            </div>

            <div className={styles.statsGrid}>
              <div className={`glass-card ${styles.statCard}`}>
                <div className={styles.statIcon} style={{ background: 'rgba(59,130,246,0.15)' }}>
                  <Users size={24} color="var(--accent-primary)" />
                </div>
                <div className={styles.statValue}>{safeUsers.length}</div>
                <div className={styles.statLabel}>Total Users</div>
              </div>

              <div className={`glass-card ${styles.statCard}`}>
                <div className={styles.statIcon} style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <TrendingUp size={24} color="var(--success)" />
                </div>
                <div className={styles.statValue}>₹{totalGMV.toLocaleString()}</div>
                <div className={styles.statLabel}>Total GMV</div>
              </div>

              <div className={`glass-card ${styles.statCard}`}>
                <div className={styles.statIcon} style={{ background: 'rgba(139,92,246,0.15)' }}>
                  <ShoppingBag size={24} color="var(--accent-secondary)" />
                </div>
                <div className={styles.statValue}>{safeOrders.length}</div>
                <div className={styles.statLabel}>Total Orders</div>
              </div>

              <div className={`glass-card ${styles.statCard}`}>
                <div className={styles.statIcon} style={{ background: 'rgba(245,158,11,0.15)' }}>
                  <CreditCard size={24} color="var(--warning)" />
                </div>
                <div className={styles.statValue}>{activeEmis}</div>
                <div className={styles.statLabel}>BNPL Orders</div>
              </div>

              <div className={`glass-card ${styles.statCard}`}>
                <div className={styles.statIcon} style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <Activity size={24} color="var(--success)" />
                </div>
                <div className={styles.statValue}>₹{(avgCredit || 0).toLocaleString()}</div>
                <div className={styles.statLabel}>Avg Credit Limit</div>
              </div>

              <div className={`glass-card ${styles.statCard}`}>
                <div className={styles.statIcon} style={{ background: 'rgba(59,130,246,0.15)' }}>
                  <BarChart2 size={24} color="var(--accent-primary)" />
                </div>
                <div className={styles.statValue}>
                  {safeOrders.length > 0
                    ? `${Math.round((bnplOrders / safeOrders.length) * 100)}%`
                    : '—'}
                </div>
                <div className={styles.statLabel}>BNPL Adoption Rate</div>
              </div>
            </div>

            {/* Order breakdown mini‑chart */}
            {safeOrders.length > 0 && (
              <div className={`glass-card ${styles.breakdownCard}`}>
                <h3 style={{ marginBottom: '20px' }}>Order Breakdown</h3>
                <div className={styles.breakdownBar}>
                  <div
                    className={styles.barFull}
                    style={{ width: `${(fullPayOrders / safeOrders.length) * 100}%` }}
                    title={`Full Pay: ${fullPayOrders}`}
                  />
                  <div
                    className={styles.barBnpl}
                    style={{ width: `${(bnplOrders / safeOrders.length) * 100}%` }}
                    title={`BNPL: ${bnplOrders}`}
                  />
                </div>
                <div className={styles.breakdownLegend}>
                  <span><span className={styles.dotFull} /> Full Payment ({fullPayOrders})</span>
                  <span><span className={styles.dotBnpl} /> BNPL / EMI ({bnplOrders})</span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Tickets Tab ── */}
        {activeTab === 'tickets' && (
          <section>
            <div className={styles.tabHeader}>
              <h2><LifeBuoy size={22} /> Support Tickets</h2>
              <span className={styles.badge}>{tickets.length} total</span>
            </div>

            {!Array.isArray(tickets) || tickets.length === 0 ? (
              <div className={styles.emptyState}>
                <LifeBuoy size={44} color="var(--text-secondary)" />
                <p>No support tickets yet.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Message</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr key={t._id || Math.random()}>
                        <td style={{ fontWeight: 600 }}>{t.subject || 'No Subject'}</td>
                        <td>{t.userName || '—'}</td>
                        <td>{t.userEmail || '—'}</td>
                        <td style={{ maxWidth: '300px', whiteSpace: 'normal', fontSize: '0.85rem' }}>
                          {t.message || '—'}
                        </td>
                        <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}</td>
                        <td>
                          <span className={t.status === 'open' ? styles.statusProcessing : styles.statusSuccess}>
                            {t.status?.toUpperCase() || 'OPEN'}
                          </span>
                        </td>
                        <td>
                          {t.status === 'open' && (
                            <button 
                              className={styles.miniBtn}
                              onClick={() => resolveTicket(t._id)}
                              title="Mark as Resolved"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
