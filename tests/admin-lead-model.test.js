import test from 'node:test';
import assert from 'node:assert/strict';
import {selectLeads,leadCSV} from '../js/admin-lead-model.js';
const leads=[{id:'a',email:'alice@example.test',name:'Alice',city:'Napoli',score:'hot',status:'contacted',value:100,createdAt:{seconds:100},lastActivity:{seconds:400}},{id:'b',email:'bob@example.test',city:'Roma',lastType:'partner',score:'hot',value:20,createdAt:{seconds:300}},{id:'c',email:'carlo@example.test',city:'Napoli',score:'cold',value:20,createdAt:{seconds:200}}];
test('admin filters combine search status and category, with accent-insensitive search',()=>{
 assert.deepEqual(selectLeads(leads,{category:'priority',search:'nàpoli',status:'contacted'}).map(l=>l.id),['a']);
 assert.deepEqual(selectLeads(leads,{category:'partner'}).map(l=>l.id),['b']);
 assert.equal(selectLeads(leads,{search:'missing'}).length,0);
});
test('admin activity sorting honors later activity instead of only creation',()=>{assert.deepEqual(selectLeads(leads).map(l=>l.id),['a','b','c']);assert.deepEqual(selectLeads(leads,{sort:'oldest'}).map(l=>l.id),['c','b','a']);});
test('CSV preserves quoted multiline notes and neutralizes spreadsheet formulas',()=>{
 const csv=leadCSV([{email:'=HYPERLINK("bad")',name:'A; B',adminNotes:'one\ntwo "quotes"'}]);
 assert.ok(csv.includes('"\'=HYPERLINK(""bad"")"'));assert.ok(csv.includes('"A; B"'));assert.ok(csv.includes('one\ntwo ""quotes""'));
});
