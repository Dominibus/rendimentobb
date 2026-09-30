/* Report handoff: session-only, owned by the authenticated account. */
(function(root){
  const key = 'rb_owned_report_v1';
  const identityKey = 'rb_report_owner_v1';
  const legacyKeys = ['rb_simulations', 'rb_dashboard_report_context'];
  function removeLegacy(local){
    legacyKeys.forEach(name => { try { local?.removeItem(name); } catch {} });
  }
  function clear(session, local){
    try { session?.removeItem(key); session?.removeItem(identityKey); } catch {}
    removeLegacy(local);
  }
  function sync(uid, session, local){
    removeLegacy(local);
    try {
      const previous = session?.getItem(identityKey);
      if(!uid || (previous && previous !== uid)) clear(session, local);
      if(uid) session?.setItem(identityKey, uid);
    } catch { clear(session, local); }
  }
  function write(uid, simulations, context, session, local){
    if(!uid) throw new Error('An authenticated report owner is required');
    sync(uid, session, local);
    session.setItem(key, JSON.stringify({ownerUid:uid, createdAt:Date.now(), simulations, context}));
  }
  function read(uid, session, local){
    sync(uid, session, local);
    if(!uid) return null;
    try {
      const value = JSON.parse(session?.getItem(key) || 'null');
      const age = Date.now() - Number(value?.createdAt);
      if(value?.ownerUid !== uid || !Array.isArray(value?.simulations) || !Number.isFinite(age) || age < 0 || age > 3600000){
        session?.removeItem(key);
        return null;
      }
      return value;
    } catch { clear(session, local); return null; }
  }
  root.RBReportCache = Object.freeze({read, write, clear, sync});
})(globalThis);
