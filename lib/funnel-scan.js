// The consumer acknowledges a record by requesting the next one. If it stops
// midway through a record, that record is revisited with the usual send locks.
export async function* scanFunnelDocuments({db,state,deadline,clock=Date.now,pageSize=100,maxPages=10}) {
  state.hasMore=true;
  state.pages=0;
  state.budgetExhausted=false;
  for(let page=0;page<maxPages;page++) {
    if(clock()>=deadline){state.budgetExhausted=true;return;}
    let query=db.collection('email_funnel').orderBy('__name__').limit(pageSize+1);
    if(state.cursor)query=query.startAfter(state.cursor);
    const snapshot=await query.get();
    state.pages++;
    for(const doc of snapshot.docs.slice(0,pageSize)) {
      if(clock()>=deadline){state.budgetExhausted=true;return;}
      yield doc;
      state.cursor=doc.id;
    }
    if(snapshot.docs.length<=pageSize){state.cursor='';state.hasMore=false;return;}
  }
}
