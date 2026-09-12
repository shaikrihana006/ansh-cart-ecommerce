import React, { useState } from 'react';
import { X, Database, Server, Code2, Shield, CheckCircle, Cpu } from 'lucide-react';

interface ProjectInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectInfoModal: React.FC<ProjectInfoModalProps> = ({ isOpen, onClose }) => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  if (!isOpen) return null;

  const handleCheckHealth = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthStatus(data);
    } catch (err: any) {
      setHealthStatus({ error: err.message });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div
      id="project-info-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="project-info-container"
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-neutral-900 font-['Space_Grotesk']">
              Architecture & Portfolio Documentation · ANSH CART
            </span>
          </div>
          <button
            id="close-project-info-btn"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 text-xs text-neutral-600 leading-relaxed">
          <div>
            <h3 className="text-lg font-extrabold text-neutral-950 font-['Space_Grotesk'] mb-1">
              Engineered Full-Stack E-Commerce Architecture
            </h3>
            <p className="text-neutral-600 text-xs">
              Designed as a professional, beginner-friendly, and production-grade project suitable for software engineering internship portfolios.
            </p>
          </div>

          {/* 3 Core Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2 font-bold">
                UI
              </div>
              <h4 className="font-bold text-neutral-900 text-xs mb-1">Frontend Layer</h4>
              <p className="text-[11px] text-neutral-500">
                HTML5, modern CSS with Tailwind CSS v4, React 19, TypeScript, and responsive human-designed UX.
              </p>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-2 font-bold">
                <Server className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-neutral-900 text-xs mb-1">Backend Server</h4>
              <p className="text-[11px] text-neutral-500">
                Node.js runtime with Express.js REST API routing, JWT authentication, and bcrypt password encryption.
              </p>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 font-bold">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-neutral-900 text-xs mb-1">SQLite Database</h4>
              <p className="text-[11px] text-neutral-500">
                Relational SQLite engine storing structured schemas for users, products, orders, and order items.
              </p>
            </div>
          </div>

          {/* Database Schema Overview */}
          <div className="p-4 bg-neutral-900 text-neutral-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> SQLite Relational Schemas
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">ansh_cart.sqlite</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 bg-neutral-800 rounded">
                <strong className="text-white block">Table: users</strong>
                <span className="text-neutral-400">id, name, email (UNIQUE), password_hash, role, phone, address, city, postal_code</span>
              </div>
              <div className="p-2 bg-neutral-800 rounded">
                <strong className="text-white block">Table: products</strong>
                <span className="text-neutral-400">id, title, slug (UNIQUE), description, features, price, category, stock, badge, rating</span>
              </div>
              <div className="p-2 bg-neutral-800 rounded">
                <strong className="text-white block">Table: orders</strong>
                <span className="text-neutral-400">id, order_number (UNIQUE), user_id, customer_name, total_amount, payment_method, order_status</span>
              </div>
              <div className="p-2 bg-neutral-800 rounded">
                <strong className="text-white block">Table: order_items</strong>
                <span className="text-neutral-400">id, order_id (FK), product_id (FK), product_title, price, quantity</span>
              </div>
            </div>
          </div>

          {/* Security & Features Checklist */}
          <div className="space-y-2">
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
              Implemented Internship Requirements Checklist
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Product listings with high-res curated imagery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Product detailed modal with multi-image gallery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Search & multi-facet category & sorting filters</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Reactive shopping cart with free shipping meter</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>User registration & login (bcrypt + JWT tokens)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Simulated checkout with stock decrementing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Order processing with unique invoice numbers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Persistent Order History lookup from SQLite</span>
              </div>
            </div>
          </div>

          {/* Live Health Ping */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-neutral-900 text-xs">Test Live Backend Connectivity</span>
              </div>
              <button
                id="ping-backend-health-btn"
                onClick={handleCheckHealth}
                disabled={checking}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                {checking ? 'Pinging /api/health...' : 'Ping Server & DB'}
              </button>
            </div>
            {healthStatus && (
              <pre className="p-2.5 bg-white rounded-lg border border-neutral-200 text-[11px] font-mono text-neutral-800 overflow-x-auto">
                {JSON.stringify(healthStatus, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
