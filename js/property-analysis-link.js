// A single analysis is claimed by one property using an optimistic transaction.
export async function saveLinkedProperty({runTransaction,propertyRef,analysisRef,analysisRefForId,uid,propertyData,isNewProperty=false}){
 return runTransaction(async tx=>{
  // Owner rules deliberately deny reads of nonexistent properties. A newly
  // generated reference needs only the analysis claim read; creation is owner-validated.
  const property=isNewProperty?null:await tx.get(propertyRef),analysis=await tx.get(analysisRef);
  if(property?.exists()&&property.data().uid!==uid)throw Object.assign(Error('forbidden'),{code:'property/forbidden'});
  if(!analysis.exists()||analysis.data().uid!==uid)throw Object.assign(Error('analysis_missing'),{code:'property/analysis_missing'});
  if(analysis.data().propertyId&&analysis.data().propertyId!==propertyRef.id)throw Object.assign(Error('analysis_already_linked'),{code:'property/analysis_already_linked'});
  const previousId=property?.exists()?property.data().analysisId:null;
  const previousRef=previousId&&previousId!==analysisRef.id?analysisRefForId(previousId):null;
  const previous=previousRef?await tx.get(previousRef):null;
  if(previous?.exists()&&previous.data().uid!==uid)throw Object.assign(Error('forbidden'),{code:'property/forbidden'});
  tx.set(propertyRef,propertyData,{merge:property?.exists()===true});
  if(previous?.exists()&&(!previous.data().propertyId||previous.data().propertyId===propertyRef.id))tx.update(previousRef,{isPortfolio:false,propertyId:null});
  tx.update(analysisRef,{isPortfolio:true,propertyId:propertyRef.id});
 });
}

export async function saveUnlinkedProperty({runTransaction,propertyRef,analysisRefForId,uid,propertyData}){
 return runTransaction(async tx=>{
  const property=await tx.get(propertyRef);
  if(!property.exists()||property.data().uid!==uid)throw Object.assign(Error('forbidden'),{code:'property/forbidden'});
  const previousId=property.data().analysisId;
  const previousRef=previousId?analysisRefForId(previousId):null;
  const previous=previousRef?await tx.get(previousRef):null;
  if(previous?.exists()&&previous.data().uid!==uid)throw Object.assign(Error('forbidden'),{code:'property/forbidden'});
  tx.set(propertyRef,propertyData,{merge:true});
  if(previous?.exists()&&(!previous.data().propertyId||previous.data().propertyId===propertyRef.id))tx.update(previousRef,{isPortfolio:false,propertyId:null});
 });
}
