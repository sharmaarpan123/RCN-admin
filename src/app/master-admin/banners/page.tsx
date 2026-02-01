"use client";

import React, { useState } from "react";
import { Button, TableLayout, type TableColumn, Modal } from "@/components";
import Image from "next/image";
import { MOCK_BANNERS, MOCK_ORGS_BANNERS, type Banner } from "./mockData";

const safeLower = (s: any) => (s || "").toString().toLowerCase();

const uid = (prefix = "id") => {
  return prefix + "_" + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
};

const PLACEMENT_OPTIONS = [
  { value: "RIGHT_SIDEBAR", label: "Right Sidebar" },
  { value: "HEADER_STRIP", label: "Header Strip" },
  { value: "LOGIN_RIGHT", label: "Login Right" },
];

const SCOPE_OPTIONS = [
  { value: "GLOBAL", label: "Global" },
  { value: "ORG", label: "Organization-specific" },
];

const Banners: React.FC = () => {
  // Mock data state
  const [banners, setBanners] = useState<Banner[]>(MOCK_BANNERS);
  const [orgs] = useState(MOCK_ORGS_BANNERS);

  // Toast and modal state
  const [toastMessage, setToastMessage] = useState("");
  const [showToastFlag, setShowToastFlag] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowToastFlag(true);
    setTimeout(() => setShowToastFlag(false), 2600);
  };

  // Filter states
  const [search, setSearch] = useState('');
  const [placementFilter, setPlacementFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');
  const [orgFilter, setOrgFilter] = useState('');

  // Preview state
  const [previewPlacement, setPreviewPlacement] = useState('RIGHT_SIDEBAR');

  // Banner modal (create / edit)
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";
  const btnClass = "border border-rcn-border bg-white px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-rcn-text text-sm hover:border-[#c9ddd0] transition-colors";

  const placementLabel = (p: string) => {
    const labels: Record<string, string> = {
      RIGHT_SIDEBAR: 'Right Sidebar',
      HEADER_STRIP: 'Header Strip',
      LOGIN_RIGHT: 'Login Right',
    };
    return labels[p] || p;
  };

  const isInDateRange = (banner: Banner) => {
    const now = new Date();
    if (banner.startAt) {
      const start = new Date(banner.startAt);
      if (now < start) return false;
    }
    if (banner.endAt) {
      const end = new Date(banner.endAt);
      if (now > end) return false;
    }
    return true;
  };

  const filtered: Banner[] = banners.filter((b: Banner) => {
    const searchLower = safeLower(search);
    const hay = safeLower((b.name || '') + ' ' + (b.linkUrl || ''));
    if (search && !hay.includes(searchLower)) return false;

    if (placementFilter && b.placement !== placementFilter) return false;
    if (statusFilter === 'active' && !b.active) return false;
    if (statusFilter === 'inactive' && b.active) return false;
    if (scopeFilter && b.scope !== scopeFilter) return false;
    if (orgFilter) {
      if (b.scope !== 'ORG') return false;
      if (b.orgId !== orgFilter) return false;
    }

    return true;
  });

  const previewBanners = banners.filter((b: Banner) => {
    if (!b.active) return false;
    if (!isInDateRange(b)) return false;
    if (b.placement !== previewPlacement) return false;

    if (b.scope === 'GLOBAL') return true;
    if (b.scope === 'ORG' && orgFilter && b.orgId === orgFilter) return true;

    return false;
  });

  const closeBannerModal = () => {
    setIsBannerModalOpen(false);
    setEditingBannerId(null);
  };

  const openBannerModal = (bannerId?: string) => {
    setEditingBannerId(bannerId ?? null);
    setIsBannerModalOpen(true);
  };

  const saveBanner = () => {
    const name = (document.getElementById('banner_name') as HTMLInputElement)?.value.trim();
    if (!name) {
      showToast('Banner name is required.');
      return;
    }
    const linkUrl = (document.getElementById('banner_linkUrl') as HTMLInputElement)?.value.trim() || '';
    const placement = (document.getElementById('banner_placement') as HTMLSelectElement)?.value || 'RIGHT_SIDEBAR';
    const scope = (document.getElementById('banner_scope') as HTMLSelectElement)?.value || 'GLOBAL';
    const orgId = scope === 'ORG' ? (document.getElementById('banner_orgId') as HTMLSelectElement)?.value || null : null;
    const active = (document.getElementById('banner_active') as HTMLSelectElement)?.value === 'true';
    const startAt = (document.getElementById('banner_startAt') as HTMLInputElement)?.value || '';
    const endAt = (document.getElementById('banner_endAt') as HTMLInputElement)?.value || '';
    const alt = (document.getElementById('banner_alt') as HTMLInputElement)?.value.trim() || '';
    const notes = (document.getElementById('banner_notes') as HTMLTextAreaElement)?.value.trim() || '';
    const imageUrl = (document.getElementById('banner_imageUrl') as HTMLInputElement)?.value.trim() || '';

    const existing = editingBannerId ? banners.find((b: { id: string }) => b.id === editingBannerId) : null;
    const now = new Date().toISOString();
    const bannerObj = {
      id: editingBannerId || uid('banner'),
      name,
      linkUrl,
      placement,
      scope,
      orgId,
      active,
      startAt,
      endAt,
      alt,
      notes,
      imageUrl,
      imageData: existing?.imageData || '',
      createdAt: existing?.createdAt || now,
      createdBy: existing?.createdBy || 'user',
      updatedAt: now,
      updatedBy: 'user',
    };

    if (editingBannerId) {
      setBanners(banners.map((b) => (b.id === editingBannerId ? bannerObj : b)));
    } else {
      setBanners([...banners, bannerObj]);
    }
    closeBannerModal();
    showToast(editingBannerId ? 'Banner updated.' : 'Banner created.');
  };

  const deleteBanner = (bannerId: string) => {
    if (!window.confirm('Delete this banner? This cannot be undone.')) return;
    setBanners(banners.filter((b: { id: string }) => b.id !== bannerId));
    closeBannerModal();
    showToast('Banner deleted.');
  };

  const editingBanner = editingBannerId ? banners.find((b: { id: string }) => b.id === editingBannerId) : null;

  const bannerColumns: TableColumn<Banner>[] = [
    {
      head: "Name / Link",
      component: (b) => (
        <>
          <div><strong>{b.name}</strong></div>
          <div className="text-rcn-muted text-xs break-all">{b.linkUrl || "—"}</div>
        </>
      ),
    },
    { head: "Placement", component: (b) => placementLabel(b.placement) },
    {
      head: "Scope",
      component: (b) => {
        const org = b.orgId ? orgs?.find((o: { id: string; name: string; address?: { state?: string; zip?: string } }) => o.id === b.orgId) : null;
        return (
          <>
            {b.scope === "GLOBAL" ? "Global" : "Organization"}
            {b.scope === "ORG" && org && (
              <div className="text-rcn-muted text-xs">
                {org.name} ({org.address?.state} {org.address?.zip})
              </div>
            )}
          </>
        );
      },
    },
    {
      head: "Status",
      component: (b) => {
        const inRange = isInDateRange(b);
        return (
          <>
            {b.active ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">Active</span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3d9a1] bg-[#fff8e6] text-[#7a4a00]">Inactive</span>
            )}
            {!inRange && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3d9a1] bg-[#fff8e6] text-[#7a4a00] ml-1" title="Outside date range">
                Out of range
              </span>
            )}
          </>
        );
      },
    },
    {
      head: "Date Range",
      component: (b) => (
        <>{b.startAt ? new Date(b.startAt).toLocaleDateString() : "—"} → {b.endAt ? new Date(b.endAt).toLocaleDateString() : "—"}</>
      ),
    },
    {
      head: "Actions",
      thClassName: "text-right",
      tdClassName: "text-right",
      component: (b) => (
        <div className="flex gap-1 justify-end flex-wrap">
          <Button
            variant="secondary"
            onClick={() => b.linkUrl ? window.open(b.linkUrl, '_blank') : showToast('No link URL set')}
          >
            Preview
          </Button>
          <Button variant="secondary" onClick={() => openBannerModal(b.id)}>Edit</Button>
          <Button variant="danger" onClick={() => deleteBanner(b.id)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold m-0 mb-1">Banner Management</h3>
            <p className="text-xs text-rcn-muted m-0">
              Create and manage advertising banners. Banners can be Global (all organizations) or scoped to a specific organization.
            </p>
          </div>
          <Button variant="primary" onClick={() => openBannerModal()}>
            + New Banner
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-rcn-muted">Search (Name / Link)</label>
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-rcn-muted">Placement</label>
            <select value={placementFilter} onChange={(e) => setPlacementFilter(e.target.value)} className={inputClass}>
              <option value="">All Placements</option>
              <option value="RIGHT_SIDEBAR">Right Sidebar</option>
              <option value="HEADER_STRIP">Header Strip</option>
              <option value="LOGIN_RIGHT">Login Right</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-rcn-muted">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-rcn-muted">Scope</label>
            <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)} className={inputClass}>
              <option value="">All Scopes</option>
              <option value="GLOBAL">Global</option>
              <option value="ORG">Organization-specific</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-rcn-muted">Organization (if scoped)</label>
            <select value={orgFilter} onChange={(e) => setOrgFilter(e.target.value)} className={inputClass}>
              <option value="">— Select Organization —</option>
              {orgs.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.address?.state} {o.address?.zip})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-px bg-rcn-border my-3.5"></div>

        {/* Banner list */}
        <h4 className="text-xs font-semibold text-rcn-muted uppercase tracking-wider m-0 mb-2">Banner list</h4>
        <div className="overflow-auto">
          <TableLayout<Banner>
            columns={bannerColumns}
            data={filtered}
            variant="bordered"
            size="sm"
            emptyMessage="No banners found."
            getRowKey={(b) => b.id}
            tableClassName="[&_td:last-child]:text-right"
          />
        </div>
      </div>

      {/* Banner Create / Edit Modal */}
      <Modal isOpen={isBannerModalOpen} onClose={closeBannerModal} maxWidth="720px">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold m-0">
              {editingBanner ? 'Edit Banner' : 'New Banner'}
            </h3>
            <button type="button" onClick={closeBannerModal} className={btnClass}>Close</button>
          </div>
          <div className="h-px bg-rcn-border mb-4"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Banner Name *</label>
              <input
                id="banner_name"
                type="text"
                defaultValue={editingBanner?.name || ''}
                placeholder="e.g. Summer Promo"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Link URL</label>
              <input
                id="banner_linkUrl"
                type="url"
                defaultValue={editingBanner?.linkUrl || ''}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Placement</label>
              <select id="banner_placement" defaultValue={editingBanner?.placement || 'RIGHT_SIDEBAR'} className={inputClass}>
                {PLACEMENT_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Scope</label>
              <select id="banner_scope" defaultValue={editingBanner?.scope || 'GLOBAL'} className={inputClass}>
                {SCOPE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Organization (if scoped)</label>
              <select id="banner_orgId" defaultValue={editingBanner?.orgId || ''} className={inputClass}>
                <option value="">— None (Global) —</option>
                {orgs.map((o: { id: string; name: string; address?: { state?: string; zip?: string } }) => (
                  <option key={o.id} value={o.id}>{o.name} ({o.address?.state} {o.address?.zip})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Status</label>
              <select id="banner_active" defaultValue={String(editingBanner?.active ?? true)} className={inputClass}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Start Date (optional)</label>
              <input
                id="banner_startAt"
                type="datetime-local"
                defaultValue={editingBanner?.startAt ? editingBanner.startAt.slice(0, 16) : ''}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">End Date (optional)</label>
              <input
                id="banner_endAt"
                type="datetime-local"
                defaultValue={editingBanner?.endAt ? editingBanner.endAt.slice(0, 16) : ''}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Image URL (optional)</label>
              <input
                id="banner_imageUrl"
                type="url"
                defaultValue={editingBanner?.imageUrl || ''}
                placeholder="https://..."
                className={inputClass}
              />
              <p className="text-xs text-rcn-muted mt-1">Image upload not in demo; use a URL.</p>
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Alt Text (optional)</label>
              <input
                id="banner_alt"
                type="text"
                defaultValue={editingBanner?.alt || ''}
                placeholder="Accessibility description"
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Notes (optional)</label>
            <textarea
              id="banner_notes"
              rows={2}
              defaultValue={editingBanner?.notes || ''}
              className={inputClass}
              placeholder="Internal notes..."
            />
          </div>

          <div className="h-px bg-rcn-border my-4"></div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-rcn-muted m-0">Changes apply after Save.</p>
            <div className="flex gap-2">
              {editingBanner && (
                <Button variant="danger" onClick={() => deleteBanner(editingBanner.id)}>Delete</Button>
              )}
              <Button variant="primary" onClick={saveBanner}>Save</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Live Preview and Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mt-3.5">
        {/* Live Preview */}
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
          <h3 className="text-sm font-semibold m-0 mb-2">Live Preview</h3>
          <p className="text-xs text-rcn-muted m-0 mb-3">
            Preview uses the selected Organization filter (if any) and the placement buttons below.
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            <Button
              variant="tab"
              active={previewPlacement === 'RIGHT_SIDEBAR'}
              onClick={() => setPreviewPlacement('RIGHT_SIDEBAR')}
            >
              Right Sidebar
            </Button>
            <Button
              variant="tab"
              active={previewPlacement === 'HEADER_STRIP'}
              onClick={() => setPreviewPlacement('HEADER_STRIP')}
            >
              Header Strip
            </Button>
            <Button
              variant="tab"
              active={previewPlacement === 'LOGIN_RIGHT'}
              onClick={() => setPreviewPlacement('LOGIN_RIGHT')}
            >
              Login Right
            </Button>
          </div>

          <div className="h-px bg-rcn-border my-3"></div>

          <div className="min-h-[160px]">
            {previewBanners.length === 0 ? (
              <p className="text-xs text-rcn-muted m-0">No active banners match the current preview filters.</p>
            ) : (
              <div className="space-y-3">
                {previewBanners.slice(0, 3).map((b: any) => {
                  const org = b.orgId ? orgs?.find((o: any) => o.id === b.orgId) : null;
                  return (
                    <div key={b.id} className="bg-white border border-rcn-border rounded-xl p-3">
                      <div className="text-xs text-rcn-muted mb-2">
                        {b.name} • {b.scope === 'GLOBAL' ? 'Global' : `${org?.name || 'Organization'}`}
                      </div>
                      {b.imageData || b.imageUrl ? (
                        <a
                          href={b.linkUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Image
                            width={320}
                            height={180}
                            src={b.imageData || b.imageUrl}
                            alt={b.alt || b.name}
                            className="w-full rounded-xl"
                            style={{ maxWidth: previewPlacement === 'RIGHT_SIDEBAR' ? '320px' : '100%' }}
                          />
                        </a>
                      ) : (
                        <div className="bg-rcn-bg border border-rcn-border rounded-xl p-4 text-center text-xs text-rcn-muted">
                          No image
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
          <h3 className="text-sm font-semibold m-0 mb-2">Notes</h3>
          <p className="text-xs text-rcn-muted m-0 mb-3">
            Banners are stored in the same local database as referrals and organizations, so they can be used across the portal automatically.
          </p>

          <div className="h-px bg-rcn-border my-3"></div>

          <ul className="text-xs text-rcn-text space-y-2 m-0 pl-4">
            <li>
              <strong>Global</strong> banners apply to all organizations.
            </li>
            <li>
              <strong>Organization-specific</strong> banners apply only to that organization.
            </li>
            <li>
              Start/End dates are optional; active banners outside the date range will <strong>not</strong> render.
            </li>
          </ul>
        </div>
      </div>

      {/* Toast notification */}
      <div className={`fixed right-4 bottom-4 z-60 bg-rcn-dark-bg text-rcn-dark-text border border-white/15 px-3 py-2.5 rounded-2xl shadow-rcn max-w-[360px] text-sm transition-all duration-300 ${
        showToastFlag ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}>
        {toastMessage}
      </div>
    </>
  );
};

export default Banners;
