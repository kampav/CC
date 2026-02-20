import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#94A3B8', SCHEDULED: '#3B82F6', ACTIVE: '#10B981', PAUSED: '#F59E0B', COMPLETED: '#6B7280', ARCHIVED: '#374151',
};

const CampaignManagement: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [availableOffers, setAvailableOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', targetSegment: 'ALL', targetBrands: '', priority: '0', startDate: '', endDate: '', budgetGbp: '' });
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showAddOffers, setShowAddOffers] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [c, o] = await Promise.all([
        api.listCampaigns({ size: '50' }),
        api.listOffers({ size: '100' }),
      ]);
      setCampaigns(c.content || []);
      setAvailableOffers((o.content || []).filter((o: any) => ['APPROVED', 'LIVE'].includes(o.status)));
    } catch { /* */ }
    setLoading(false);
  }

  function resetForm() {
    setForm({ name: '', description: '', targetSegment: 'ALL', targetBrands: '', priority: '0', startDate: '', endDate: '', budgetGbp: '' });
    setSelectedOfferIds([]);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        name: form.name,
        description: form.description || null,
        targetSegment: form.targetSegment,
        targetBrands: form.targetBrands || null,
        priority: parseInt(form.priority) || 0,
        createdBy: 'colleague-portal',
        offerIds: selectedOfferIds,
      };
      if (form.startDate) payload.startDate = new Date(form.startDate).toISOString();
      if (form.endDate) payload.endDate = new Date(form.endDate).toISOString();
      if (form.budgetGbp) payload.budgetGbp = parseFloat(form.budgetGbp);
      await api.createCampaign(payload);
      setShowCreate(false);
      resetForm();
      await load();
    } catch (err: any) {
      alert(err.message);
    }
    setSubmitting(false);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      const payload: any = {
        name: form.name,
        description: form.description || null,
        targetSegment: form.targetSegment,
        targetBrands: form.targetBrands || null,
        priority: parseInt(form.priority) || 0,
      };
      if (form.startDate) payload.startDate = new Date(form.startDate).toISOString();
      if (form.endDate) payload.endDate = new Date(form.endDate).toISOString();
      if (form.budgetGbp) payload.budgetGbp = parseFloat(form.budgetGbp);
      const updated = await api.updateCampaign(selected.id, payload);
      setSelected(updated);
      setEditing(false);
      await load();
    } catch (err: any) {
      alert(err.message);
    }
    setSubmitting(false);
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      await api.changeCampaignStatus(id, { status, changedBy: 'colleague-portal' });
      await load();
      if (selected?.id === id) {
        const updated = await api.getCampaign(id);
        setSelected(updated);
      }
    } catch (err: any) { alert(err.message); }
  }

  async function handleAddOffers() {
    if (!selected || selectedOfferIds.length === 0) return;
    try {
      const updated = await api.addOffersToCampaign(selected.id, selectedOfferIds);
      setSelected(updated);
      setShowAddOffers(false);
      setSelectedOfferIds([]);
      await load();
    } catch (err: any) { alert(err.message); }
  }

  async function handleRemoveOffer(offerId: string) {
    if (!selected) return;
    try {
      const updated = await api.removeOfferFromCampaign(selected.id, offerId);
      setSelected(updated);
      await load();
    } catch (err: any) { alert(err.message); }
  }

  function startEdit(campaign: any) {
    setForm({
      name: campaign.name || '',
      description: campaign.description || '',
      targetSegment: campaign.targetSegment || 'ALL',
      targetBrands: campaign.targetBrands || '',
      priority: (campaign.priority ?? 0).toString(),
      startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
      endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
      budgetGbp: campaign.budgetGbp?.toString() || '',
    });
    setEditing(true);
  }

  function toggleOffer(offerId: string) {
    setSelectedOfferIds(prev => prev.includes(offerId) ? prev.filter(id => id !== offerId) : [...prev, offerId]);
  }

  if (loading) return <p style={{ color: '#64748B' }}>Loading campaigns...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem', color: '#0F172A' }}>Campaign Management</h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>Create and manage offer campaigns with targeting and scheduling</p>
        </div>
        <button onClick={() => { setShowCreate(true); resetForm(); }} style={{
          padding: '0.6rem 1.25rem', background: '#0F172A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer',
        }}>
          Create Campaign
        </button>
      </div>

      {/* Create/Edit form */}
      {(showCreate || editing) && (
        <form onSubmit={editing ? handleUpdate : handleCreate} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#0F172A' }}>{editing ? 'Edit Campaign' : 'New Campaign'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={lbl}>Campaign Name *</label>
              <input style={inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Summer Cashback Blitz" />
            </div>
            <div>
              <label style={lbl}>Target Segment</label>
              <select style={inp} value={form.targetSegment} onChange={e => setForm(p => ({ ...p, targetSegment: e.target.value }))}>
                <option value="ALL">All Customers</option>
                <option value="MASS">Mass</option>
                <option value="AFFLUENT">Affluent</option>
                <option value="PRIVATE">Private Banking</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={lbl}>Description</label>
            <textarea style={{ ...inp, minHeight: '60px' }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={lbl}>Target Brands</label>
              <input style={inp} value={form.targetBrands} onChange={e => setForm(p => ({ ...p, targetBrands: e.target.value }))} placeholder="BRAND_A,BRAND_B" />
            </div>
            <div>
              <label style={lbl}>Start Date</label>
              <input style={inp} type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>End Date</label>
              <input style={inp} type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Budget (GBP)</label>
              <input style={inp} type="number" step="0.01" value={form.budgetGbp} onChange={e => setForm(p => ({ ...p, budgetGbp: e.target.value }))} placeholder="10000" />
            </div>
          </div>

          {/* Offer selection (only on create) */}
          {!editing && (
            <>
              <label style={lbl}>Assign Offers ({selectedOfferIds.length} selected)</label>
              <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.5rem', marginBottom: '1rem' }}>
                {availableOffers.length === 0 ? (
                  <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0.5rem' }}>No offers available to assign.</p>
                ) : availableOffers.map((o: any) => (
                  <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={selectedOfferIds.includes(o.id)} onChange={() => toggleOffer(o.id)} />
                    <span style={{ color: '#0F172A' }}>{o.title}</span>
                    <span style={{ color: '#64748B', fontSize: '0.75rem' }}>({o.status})</span>
                  </label>
                ))}
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" disabled={submitting} style={{
              padding: '0.6rem 1.25rem', background: '#0F172A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
            }}>
              {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Create Campaign'}
            </button>
            <button type="button" onClick={() => { setShowCreate(false); setEditing(false); resetForm(); }} style={{
              padding: '0.6rem 1.25rem', background: 'white', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer',
            }}>Cancel</button>
          </div>
        </form>
      )}

      {/* Campaign list */}
      {campaigns.length === 0 && !showCreate ? (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: '#64748B', margin: '0 0 1rem' }}>No campaigns yet.</p>
          <button onClick={() => setShowCreate(true)} style={{
            padding: '0.6rem 1.25rem', background: '#0F172A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
          }}>Create Your First Campaign</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {campaigns.map((c: any) => (
            <div key={c.id} style={{
              background: 'white', borderRadius: '12px', border: selected?.id === c.id ? '2px solid #8B5CF6' : '1px solid #E2E8F0',
              padding: '1.25rem', cursor: 'pointer',
            }} onClick={() => { setSelected(c); setEditing(false); setShowAddOffers(false); }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: '#0F172A', fontSize: '1rem' }}>{c.name}</p>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>
                    {c.targetSegment || 'All'} segment | {c.offerCount} offers | Priority: {c.priority}
                    {c.budgetGbp ? ` | Budget: £${c.budgetGbp}` : ''}
                  </p>
                </div>
                <span style={{
                  padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                  color: 'white', background: STATUS_COLORS[c.status] || '#6B7280',
                }}>{c.status}</span>
              </div>
              {selected?.id === c.id && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                  {c.description && <p style={{ margin: '0 0 0.75rem', color: '#475569', fontSize: '0.9rem' }}>{c.description}</p>}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <MiniDetail label="Start" value={c.startDate ? new Date(c.startDate).toLocaleDateString() : 'Not set'} />
                    <MiniDetail label="End" value={c.endDate ? new Date(c.endDate).toLocaleDateString() : 'Not set'} />
                    <MiniDetail label="Brands" value={c.targetBrands || 'All'} />
                  </div>

                  {/* Assigned Offers with remove buttons */}
                  {c.offers && c.offers.length > 0 && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <p style={{ margin: '0 0 0.35rem', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Assigned Offers:</p>
                      {c.offers.map((o: any) => (
                        <span key={o.id} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.2rem 0.5rem', borderRadius: '4px',
                          background: '#F1F5F9', color: '#0F172A', fontSize: '0.8rem', marginRight: '0.35rem', marginBottom: '0.25rem',
                        }}>
                          {o.title} ({o.status})
                          <button onClick={(e) => { e.stopPropagation(); handleRemoveOffer(o.id); }} style={{
                            background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '0 2px', fontSize: '0.9rem', fontWeight: 700,
                          }} title="Remove offer">&times;</button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add Offers to existing campaign */}
                  {showAddOffers && selected?.id === c.id ? (
                    <div style={{ marginBottom: '0.75rem', padding: '0.75rem', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>Select offers to add:</p>
                      <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '0.5rem' }}>
                        {availableOffers.filter(o => !c.offers?.some((co: any) => co.id === o.id)).map((o: any) => (
                          <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.2rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                            <input type="checkbox" checked={selectedOfferIds.includes(o.id)} onChange={() => toggleOffer(o.id)} />
                            <span>{o.title} ({o.status})</span>
                          </label>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={(e) => { e.stopPropagation(); handleAddOffers(); }} style={{
                          padding: '0.35rem 0.75rem', background: '#0F172A', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer',
                        }}>Add Selected</button>
                        <button onClick={(e) => { e.stopPropagation(); setShowAddOffers(false); setSelectedOfferIds([]); }} style={{
                          padding: '0.35rem 0.75rem', background: 'white', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer',
                        }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); setShowAddOffers(true); setSelectedOfferIds([]); }} style={{
                      padding: '0.35rem 0.75rem', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE',
                      borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', marginBottom: '0.75rem',
                    }}>+ Add Offers</button>
                  )}

                  {/* Actions row */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={(e) => { e.stopPropagation(); startEdit(c); }} style={{
                      padding: '0.4rem 0.8rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer',
                      color: '#374151', background: 'white',
                    }}>Edit Details</button>
                    {c.validTransitions && c.validTransitions.map((t: string) => (
                      <button key={t} onClick={(e) => { e.stopPropagation(); handleStatusChange(c.id, t); }} style={{
                        padding: '0.4rem 0.8rem', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', color: 'white',
                        background: STATUS_COLORS[t] || '#0F172A',
                      }}>
                        {t.charAt(0) + t.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MiniDetail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>{label}</p>
    <p style={{ margin: 0, fontSize: '0.85rem', color: '#0F172A', fontWeight: 500 }}>{value}</p>
  </div>
);

const lbl: React.CSSProperties = { display: 'block', marginBottom: '0.25rem', fontWeight: 500, color: '#374151', fontSize: '0.85rem' };
const inp: React.CSSProperties = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.9rem', boxSizing: 'border-box' };

export default CampaignManagement;
