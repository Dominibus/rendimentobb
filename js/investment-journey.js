/* Scenario transfer contains inputs only: session scoped, short lived and account bound. */
(function(root){
  const key = 'rb_mortgage_scenario_v1';
  const ttl = 30 * 60 * 1000;
  function parseNumber(value, kind = 'amount'){
    if(typeof value === 'number') return Number.isFinite(value) ? value : null;
    let raw = String(value ?? '').trim().replace(/[\s\u00a0]/g, '');
    if(kind === 'rate') raw = raw.replace(/%$/, '');
    else raw = raw.replace(/^€|€$/g, '');
    if(!raw || !/^[+-]?\d+(?:[.,]\d+)*$/.test(raw)) return null;
    if(raw.includes(',') && raw.includes('.')){
      const decimal = raw.lastIndexOf(',') > raw.lastIndexOf('.') ? ',' : '.';
      const groups = decimal === ',' ? '.' : ',';
      const integer = raw.slice(0, raw.lastIndexOf(decimal));
      const grouping = groups === '.' ? /^[+-]?\d{1,3}(?:\.\d{3})+$/ : /^[+-]?\d{1,3}(?:,\d{3})+$/;
      if(!grouping.test(integer)) return null;
      raw = integer.split(groups).join('') + '.' + raw.slice(raw.lastIndexOf(decimal) + 1);
    }else if(kind === 'amount' && /^[+-]?\d{1,3}(?:\.\d{3})+$/.test(raw)){
      raw = raw.replace(/\./g, '');
    }else{
      raw = raw.replace(',', '.');
    }
    const result = Number(raw);
    return Number.isFinite(result) ? result : null;
  }
  function validate(raw){
    const values = {amount:parseNumber(raw.amount), years:parseNumber(raw.years, 'years'), rate:parseNumber(raw.rate, 'rate'), income:parseNumber(raw.income)};
    const errors = {};
    if(values.amount === null || values.amount <= 0 || values.amount > 100000000) errors.amount = 'positive_amount';
    if(values.years === null || !Number.isInteger(values.years) || values.years < 1 || values.years > 100) errors.years = 'whole_years';
    if(values.rate === null || values.rate < 0 || values.rate > 100) errors.rate = 'valid_rate';
    if(values.income === null || values.income < 0 || values.income > 100000000) errors.income = 'nonnegative_income';
    return {valid:Object.keys(errors).length === 0, values, errors};
  }
  function clear(storage){ try { storage.removeItem(key); } catch {} }
  function write(storage, raw, ownerUid = null, now = Date.now()){
    const checked = validate(raw);
    if(!checked.valid) { clear(storage); return false; }
    try { storage.setItem(key, JSON.stringify({version:1, ownerUid, createdAt:now, ...checked.values})); return true; } catch { return false; }
  }
  function read(storage, ownerUid = null, now = Date.now()){
    try {
      const data = JSON.parse(storage.getItem(key) || 'null');
      if(!data) return null;
      const age = now - data.createdAt;
      if(data.version !== 1 || data.ownerUid !== ownerUid || !Number.isFinite(age) || age < 0 || age > ttl || !validate(data).valid){ clear(storage); return null; }
      return data;
    } catch { clear(storage); return null; }
  }
  function payment(amount, rate, years){
    const checked = validate({amount, rate, years, income:0});
    if(!checked.valid) return null;
    const r = checked.values.rate / 1200, n = checked.values.years * 12;
    return r === 0 ? checked.values.amount / n : checked.values.amount * r / -Math.expm1(-n * Math.log1p(r));
  }
  function equivalentNight(income, occupancy){
    const revenue = Number(income), occ = Number(occupancy);
    return Number.isFinite(revenue) && revenue >= 0 && Number.isFinite(occ) && occ > 0 && occ <= 100 ? revenue / (365 * occ / 100) : null;
  }
  root.RBInvestmentJourney = Object.freeze({key, parseNumber, validate, read, write, clear, payment, equivalentNight});
})(globalThis);
