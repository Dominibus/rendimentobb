// Read-only orientation. Never reads shared analysis/PDF caches or writes account data.
export function journeyState({page, analysis, pms, uid, access = {}}) {
  if (page === 'analysis') {
    const status = ['current','stale','pending','missing'].includes(analysis?.status) ? analysis.status : 'missing';
    return {area:'analysis', status, source:status === 'current' ? 'simulation' : 'inputs', action:status === 'current' ? 'results' : status === 'stale' ? 'recalculate' : status === 'pending' ? 'wait' : 'inputs'};
  }
  if (access.isLoading) return {area:'pms',status:'loading',source:'none',action:'wait'};
  if (pms?.isDemo === true) return {area:'pms',status:'demo',source:'demo',action:'demo'};
  // Account data must belong to the current user AND be a completed authorized snapshot.
  if (!uid || pms?.ownerUid !== uid || pms?.portalSnapshotReady !== true || !(access.isAdmin || access.isPro || access.isInvestor)) {
    return {area:'pms',status:'unavailable',source:'none',action:'access'};
  }
  if (!Array.isArray(pms.propertyList) || !Array.isArray(pms.portalBookingList)) return {area:'pms',status:'loading',source:'none',action:'wait'};
  const properties = pms.propertyList.length;
  const bookings = pms.portalBookingList.length;
  return {area:'pms', status:properties === 0 ? 'empty' : bookings === 0 ? 'no-bookings' : 'ready', source:'account', action:properties === 0 ? 'property' : bookings === 0 ? 'bookings' : 'daily'};
}
