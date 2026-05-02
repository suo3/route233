'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Label } from '@/components/ui';

interface QuoteModalProps {
  inquiry: {
    id: string;
    description: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuoteModal({ inquiry, onClose, onSuccess }: QuoteModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    base_cost_usd: '',
    shipping_cost_usd: '',
    service_fee_usd: '25.00',
    customs_estimate_usd: '0.00',
    exchange_rate: '13.80',
    notes: '',
  });

  if (!inquiry) return null;

  const totalUSD = 
    Number(formData.base_cost_usd || 0) + 
    Number(formData.shipping_cost_usd || 0) + 
    Number(formData.service_fee_usd || 0) + 
    Number(formData.customs_estimate_usd || 0);

  const totalGHS = totalUSD * Number(formData.exchange_rate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiry_id: inquiry.id,
          admin_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', // Placeholder
          ...formData
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Generate Landed Cost Quote</h2>
            <p className="text-slate-400 text-sm mt-1 truncate max-w-xs">{inquiry.description}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Base Cost (USD)</Label>
              <Input 
                type="number" 
                step="0.01" 
                required 
                value={formData.base_cost_usd} 
                onChange={e => setFormData({...formData, base_cost_usd: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label>Shipping (USD)</Label>
              <Input 
                type="number" 
                step="0.01" 
                required 
                value={formData.shipping_cost_usd} 
                onChange={e => setFormData({...formData, shipping_cost_usd: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Service Fee (USD)</Label>
              <Input 
                type="number" 
                step="0.01" 
                value={formData.service_fee_usd} 
                onChange={e => setFormData({...formData, service_fee_usd: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label>Customs Est. (USD)</Label>
              <Input 
                type="number" 
                step="0.01" 
                value={formData.customs_estimate_usd} 
                onChange={e => setFormData({...formData, customs_estimate_usd: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 flex justify-between items-center">
            <div>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Total Landed Cost</p>
              <h3 className="text-3xl font-black text-white">${totalUSD.toFixed(2)}</h3>
            </div>
            <div className="text-right">
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">GHS Estimate (@ {formData.exchange_rate})</p>
              <h3 className="text-3xl font-black text-blue-400">₵{totalGHS.toFixed(2)}</h3>
            </div>
          </div>

          <div>
            <Label>Admin Notes</Label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="e.g. Sourced from Delaware warehouse, zero sales tax applied."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white transition-all"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-slate-700 text-slate-400 hover:bg-slate-800">
              Cancel
            </Button>
            <Button type="submit" isLoading={loading} className="flex-1 bg-blue-600">
              Send Quote to Customer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
