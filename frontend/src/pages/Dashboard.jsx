import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Users, 
  Lock, 
  Globe, 
  LogOut, 
  Bell, 
  Search, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Filter, 
  RefreshCw,
  Sliders,
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = location.state?.email || 'admin@ironclad.io';

  const [activeTab, setActiveTab] = useState('Overview');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [isSimulating, setIsSimulating] = useState(false);

  const [events, setEvents] = useState([
    {
      id: 'EV-9021',
      user: userEmail,
      ip: '192.168.1.104',
      country: 'United States',
      flag: '🇺🇸',
      eventType: 'LOGIN_SUCCESS',
      risk: 'Normal',
      severity: 'Low',
      time: 'Just now',
    },
    {
      id: 'EV-9020',
      user: 'unknown_attacker@tor-node.net',
      ip: '185.220.101.5',
      country: 'Germany',
      flag: '🇩🇪',
      eventType: 'LOGIN_FAILED',
      risk: 'High',
      severity: 'Critical',
      time: '2 mins ago',
    },
    {
      id: 'EV-9019',
      user: 'dev_lead@ironclad.io',
      ip: '103.21.244.0',
      country: 'India',
      flag: '🇮🇳',
      eventType: 'MFA_VERIFIED',
      risk: 'Normal',
      severity: 'Low',
      time: '14 mins ago',
    },
    {
      id: 'EV-9018',
      user: 'suspicious_script@proxy.org',
      ip: '45.142.214.12',
      country: 'Netherlands',
      flag: '🇳🇱',
      eventType: 'SUSPICIOUS_IP_BURST',
      risk: 'Medium',
      severity: 'Medium',
      time: '28 mins ago',
    },
    {
      id: 'EV-9017',
      user: 'analyst@ironclad.io',
      ip: '198.51.100.42',
      country: 'United States',
      flag: '🇺🇸',
      eventType: 'REGISTER_SUCCESS',
      risk: 'Normal',
      severity: 'Low',
      time: '45 mins ago',
    }
  ]);

  const handleSimulateEvent = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const mockIPs = [
        { ip: '194.26.29.110', country: 'France', flag: '🇫🇷', user: 'guest_test@tempmail.com', type: 'LOGIN_FAILED', risk: 'High', severity: 'High' },
        { ip: '203.0.113.195', country: 'Japan', flag: '🇯🇵', user: userEmail, type: 'LOGIN_SUCCESS', risk: 'Normal', severity: 'Low' },
        { ip: '185.220.102.8', country: 'Germany', flag: '🇩🇪', user: 'brute_force_bot@darknet.io', type: 'BLOCKED_CREDENTIAL_STUFFING', risk: 'High', severity: 'Critical' }
      ];
      const randomEvent = mockIPs[Math.floor(Math.random() * mockIPs.length)];
      const newEvent = {
        id: `EV-${Math.floor(1000 + Math.random() * 9000)}`,
        ...randomEvent,
        time: 'Just now'
      };

      setEvents(prev => [newEvent, ...prev]);
      setIsSimulating(false);
    }, 800);
  };

  const filteredEvents = events.filter(ev => {
    if (filterRisk === 'ALL') return true;
    return ev.risk.toUpperCase() === filterRisk;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Ironclad<span className="text-blue-500">TDS</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-400">System Guard Active</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden lg:flex items-center relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search IP, User, Event ID..."
            className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* User & Quick Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSimulateEvent}
            disabled={isSimulating}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3.5 rounded-lg transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>Simulate Auth Event</span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-200 truncate max-w-[130px]">{userEmail}</span>
              <span className="text-[10px] font-semibold text-blue-400">Security Operator</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Dashboard Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800/80 bg-slate-900/50 p-4 hidden md:flex flex-col justify-between">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase">Navigation</div>
            {[
              { name: 'Overview', icon: Activity },
              { name: 'Real-Time Threat Logs', icon: AlertTriangle, count: events.length },
              { name: 'User Sessions', icon: Users },
              { name: 'Security Rules', icon: Lock },
              { name: 'Geo Analytics', icon: Globe },
            ].map(item => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === item.name 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.count && (
                  <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Ironclad AI Guard</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Autonomous risk decision engine active on port 5000.
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[94%]"></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Threat Score</span>
              <span className="text-emerald-400 font-bold">98/100 Safe</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-950">
          {/* Welcome Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Enterprise Threat Dashboard
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Real-time authentication monitoring, anomaly detection, and automated audit logs.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3.5 rounded-xl border border-slate-700 transition-colors">
                <Download className="w-3.5 h-3.5" />
                Export Audit Log
              </button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Total Auth Attempts (24h)', value: '14,290', change: '+12.4%', color: 'text-blue-400', icon: Activity },
              { title: 'System Risk Level', value: 'LOW', change: '0.8% Anomaly Rate', color: 'text-emerald-400', icon: Shield },
              { title: 'Blocked Intrusions', value: '43 Today', change: 'Credential Stuffing', color: 'text-rose-400', icon: AlertTriangle },
              { title: 'Active User Sessions', value: '1,284', change: 'Across 14 Regions', color: 'text-purple-400', icon: Users },
            ].map((card, idx) => (
              <div key={idx} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition-all flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">{card.title}</span>
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50">
                    <card.icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white tracking-tight font-mono">{card.value}</div>
                  <div className="text-[11px] font-medium text-slate-400 mt-1">{card.change}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Auth Events Table Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  Real-Time Authentication Event Stream
                </h3>
                <p className="text-xs text-slate-400 font-medium">Logged authentication events processed by Ironclad TDS.</p>
              </div>

              {/* Risk Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {['ALL', 'NORMAL', 'MEDIUM', 'HIGH'].map(risk => (
                  <button
                    key={risk}
                    onClick={() => setFilterRisk(risk)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      filterRisk === risk
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {risk}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Event ID</th>
                    <th className="py-3 px-4">User / Email</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Origin</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredEvents.map(ev => (
                    <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-blue-400">{ev.id}</td>
                      <td className="py-3 px-4 text-slate-200 font-sans font-medium">{ev.user}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-800 px-2 py-1 rounded text-[11px] font-semibold text-slate-300 border border-slate-700/50">
                          {ev.eventType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{ev.ip}</td>
                      <td className="py-3 px-4 font-sans text-slate-300">
                        <span className="mr-1.5">{ev.flag}</span>
                        {ev.country}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          ev.risk === 'Normal'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : ev.risk === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {ev.risk === 'Normal' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {ev.risk}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-sans">{ev.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
