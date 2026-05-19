import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { Users, Calendar, Mail, Shield, Package, Truck, ExternalLink, Box } from "lucide-react";
import { PRODUCTS } from "../constants/products";

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

interface OrderData {
  id: string;
  userId: number;
  userEmail: string;
  status: string;
  total: number;
  carrier: string | null;
  trackingNumber: string | null;
  createdAt: string;
  items?: any[];
  shippingAddress?: any;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'orders'>('users');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
  // Pagination state
  const [userPage, setUserPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedUsers = users.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);
  const paginatedOrders = orders.slice((orderPage - 1) * itemsPerPage, orderPage * itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getOrderItemDisplay = (item: any) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    const unitAmount = typeof item.unitAmount === "number"
      ? item.unitAmount / 100
      : Number(item.price || 0);

    return {
      name: item.name || product?.name || item.id,
      image: item.image || product?.image,
      lineTotal: unitAmount * Number(item.quantity || 0),
    };
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [usersRes, ordersRes] = await Promise.all([
          fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!usersRes.ok || !ordersRes.ok) throw new Error("Failed to fetch data");

        const [usersData, ordersData] = await Promise.all([usersRes.json(), ordersRes.json()]);
        setUsers(usersData);
        setOrders(ordersData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleShipOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to ship order");
      
      // Refresh orders
      const ordersRes = await fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } });
      const ordersData = await ordersRes.json();
      setOrders(ordersData);
      showToast(`Order ${orderId} has been marked as shipped.`, "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gold/10 pb-8">
            <div>
              <h1 className="font-display text-4xl md:text-6xl tracking-widest uppercase mb-4 gold-foil">
                ADMIN PANEL
              </h1>
              <div className="flex gap-8">
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`text-[10px] tracking-[0.3em] uppercase transition-colors ${activeTab === 'users' ? 'text-gold' : 'text-limestone/40 hover:text-gold/60'}`}
                >
                  Sanctuary Members
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`text-[10px] tracking-[0.3em] uppercase transition-colors ${activeTab === 'orders' ? 'text-gold' : 'text-limestone/40 hover:text-gold/60'}`}
                >
                  Order Management
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-gold/5 px-6 py-3 border border-gold/10 rounded-full">
              {activeTab === 'users' ? (
                <>
                  <Users size={16} className="text-gold" />
                  <span className="text-xs tracking-widest uppercase text-gold">
                    Total Members: {users.length}
                  </span>
                </>
              ) : (
                <>
                  <Package size={16} className="text-gold" />
                  <span className="text-xs tracking-widest uppercase text-gold">
                    Total Orders: {orders.length}
                  </span>
                </>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-400/10 border border-red-400/20 p-6 text-red-400 text-xs tracking-widest uppercase text-center">
              {error}
            </div>
          ) : activeTab === 'users' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gold/20">
                    <th className="py-6 px-4 text-[10px] uppercase tracking-[0.2em] text-limestone/40 font-medium">Member</th>
                    <th className="py-6 px-4 text-[10px] uppercase tracking-[0.2em] text-limestone/40 font-medium">Email</th>
                    <th className="py-6 px-4 text-[10px] uppercase tracking-[0.2em] text-limestone/40 font-medium">Role</th>
                    <th className="py-6 px-4 text-[10px] uppercase tracking-[0.2em] text-limestone/40 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-limestone/40 text-xs tracking-widest uppercase">
                        No members found.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => (
                      <tr key={u.id} className="group hover:bg-gold/[0.02] transition-colors">
                        <td className="py-6 px-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-display text-sm">
                              {u.firstName[0]}{u.lastName[0]}
                            </div>
                            <div>
                              <p className="text-sm tracking-widest uppercase text-offwhite font-medium">
                                {u.firstName} {u.lastName}
                              </p>
                              <p className="text-[10px] tracking-widest uppercase text-limestone/40 mt-1">
                                ID: #{u.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-4">
                          <div className="flex items-center gap-2 text-limestone/80">
                            <Mail size={12} className="text-gold/40" />
                            <span className="text-xs tracking-widest">{u.email}</span>
                          </div>
                        </td>
                        <td className="py-6 px-4">
                          <div className="flex items-center gap-2">
                            <Shield size={12} className={u.role === 'admin' ? 'text-gold' : 'text-limestone/40'} />
                            <span className={`text-[10px] uppercase tracking-widest ${u.role === 'admin' ? 'text-gold' : 'text-limestone/60'}`}>
                              {u.role}
                            </span>
                          </div>
                        </td>
                        <td className="py-6 px-4">
                          <div className="flex items-center gap-2 text-limestone/60">
                            <Calendar size={12} className="text-gold/40" />
                            <span className="text-[10px] tracking-widest uppercase">
                              {formatDate(u.createdAt)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {users.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gold/10">
                  <button 
                    onClick={() => setUserPage(p => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="text-[10px] uppercase tracking-widest text-limestone/60 hover:text-gold disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <span className="text-[10px] uppercase tracking-widest text-limestone/40">
                    Page {userPage} of {Math.ceil(users.length / itemsPerPage)}
                  </span>
                  <button 
                    onClick={() => setUserPage(p => Math.min(Math.ceil(users.length / itemsPerPage), p + 1))}
                    disabled={userPage === Math.ceil(users.length / itemsPerPage)}
                    className="text-[10px] uppercase tracking-widest text-limestone/60 hover:text-gold disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gold/20">
                    <th className="py-6 px-4 text-[10px] uppercase tracking-[0.2em] text-limestone/40 font-medium">Order ID</th>
                    <th className="py-6 px-4 text-[10px] uppercase tracking-[0.2em] text-limestone/40 font-medium">Customer</th>
                    <th className="py-6 px-4 text-[10px] uppercase tracking-[0.2em] text-limestone/40 font-medium">Status</th>
                    <th className="py-6 px-4 text-[10px] uppercase tracking-[0.2em] text-limestone/40 font-medium">Total</th>
                    <th className="py-6 px-4 text-[10px] uppercase tracking-[0.2em] text-limestone/40 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-limestone/40 text-xs tracking-widest uppercase">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((o) => (
                      <React.Fragment key={o.id}>
                        <tr 
                          className={`group hover:bg-gold/[0.02] transition-colors cursor-pointer ${expandedOrder === o.id ? 'bg-gold/[0.03]' : ''}`}
                          onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                        >
                          <td className="py-6 px-4">
                            <div className="flex items-center gap-3">
                              <Box size={16} className={expandedOrder === o.id ? 'text-gold' : 'text-gold/40'} />
                              <span className="text-sm tracking-widest uppercase text-offwhite font-medium">{o.id}</span>
                            </div>
                          </td>
                          <td className="py-6 px-4">
                            <p className="text-xs tracking-widest text-limestone/80">{o.userEmail}</p>
                            <p className="text-[10px] tracking-widest text-limestone/40 mt-1">{formatDate(o.createdAt)}</p>
                          </td>
                          <td className="py-6 px-4">
                            <span className={`text-[10px] uppercase tracking-widest px-3 py-1 border rounded-full ${
                              o.status === 'shipped' ? 'text-gold border-gold/20' : 
                              o.status === 'delivered' ? 'text-emerald-400 border-emerald-400/20' : 
                              'text-limestone/60 border-gold/10'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-6 px-4">
                            <span className="text-xs tracking-widest text-offwhite font-medium">€{o.total.toFixed(2)}</span>
                          </td>
                          <td className="py-6 px-4">
                            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                              {o.status === 'pending' && (
                                <button 
                                  onClick={() => handleShipOrder(o.id)}
                                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold hover:text-gold-light transition-colors"
                                >
                                  <Truck size={14} />
                                  Ship
                                </button>
                              )}
                              <Link 
                                to={`/track/${o.id}`}
                                className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-limestone/40 hover:text-gold transition-colors"
                              >
                                <ExternalLink size={14} />
                                Track
                              </Link>
                            </div>
                          </td>
                        </tr>
                        {expandedOrder === o.id && (
                          <tr className="bg-gold/[0.01] border-b border-gold/10">
                            <td colSpan={5} className="p-8">
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-12"
                              >
                                {/* Items Section */}
                                <div>
                                  <h4 className="text-[10px] uppercase tracking-[0.3em] text-gold mb-6">Ordered Items</h4>
                                  <div className="space-y-4">
                                    {o.items?.map((item: any, idx: number) => {
                                      const display = getOrderItemDisplay(item);

                                      return (
                                        <div key={idx} className="flex items-center justify-between border-b border-gold/5 pb-4">
                                          <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gold/5 rounded overflow-hidden flex items-center justify-center">
                                              {display.image ? (
                                                <img src={display.image} alt={display.name} className="w-full h-full object-cover opacity-80" loading="lazy" decoding="async" />
                                              ) : (
                                                <Package size={16} className="text-gold/40" />
                                              )}
                                            </div>
                                            <div>
                                              <p className="text-xs tracking-widest uppercase text-offwhite">{display.name}</p>
                                              <p className="text-[10px] tracking-widest text-limestone/40 mt-1">Qty: {item.quantity}</p>
                                            </div>
                                          </div>
                                          <p className="text-xs tracking-widest text-limestone/80">€{display.lineTotal.toFixed(2)}</p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Shipping Section */}
                                <div>
                                  <h4 className="text-[10px] uppercase tracking-[0.3em] text-gold mb-6">Shipping Sanctuary</h4>
                                  <div className="bg-black/20 p-6 border border-gold/5 rounded-sm">
                                    <p className="text-xs tracking-widest uppercase text-offwhite mb-2">
                                      {o.shippingAddress?.fullName || `${o.shippingAddress?.firstName || ''} ${o.shippingAddress?.lastName || ''}`.trim()}
                                    </p>
                                    <p className="text-[10px] tracking-widest text-limestone/60 leading-relaxed">
                                      {o.shippingAddress?.address}<br />
                                      {o.shippingAddress?.city}{o.shippingAddress?.zipCode ? `, ${o.shippingAddress.zipCode}` : ''}<br />
                                      {o.shippingAddress?.country}
                                    </p>
                                    {o.trackingNumber && (
                                      <div className="mt-6 pt-6 border-t border-gold/10">
                                        <p className="text-[10px] uppercase tracking-widest text-gold mb-1">Tracking Info</p>
                                        <p className="text-xs tracking-widest text-limestone/80">{o.carrier}: {o.trackingNumber}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                )}
                </tbody>
              </table>
              {orders.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gold/10">
                  <button 
                    onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                    disabled={orderPage === 1}
                    className="text-[10px] uppercase tracking-widest text-limestone/60 hover:text-gold disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <span className="text-[10px] uppercase tracking-widest text-limestone/40">
                    Page {orderPage} of {Math.ceil(orders.length / itemsPerPage)}
                  </span>
                  <button 
                    onClick={() => setOrderPage(p => Math.min(Math.ceil(orders.length / itemsPerPage), p + 1))}
                    disabled={orderPage === Math.ceil(orders.length / itemsPerPage)}
                    className="text-[10px] uppercase tracking-widest text-limestone/60 hover:text-gold disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
