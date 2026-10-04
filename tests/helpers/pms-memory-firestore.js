// Optimistic transaction model for application tests. Not a Firebase emulator.
export class MemoryFirestore {
  constructor(seed={}) {this.documents=new Map(Object.entries(seed));this.versions=new Map();this.retries=0;this.reads=[];}
  collection(name){return new Collection(this,name);}
  async runTransaction(action){
    for(let attempt=0;attempt<10;attempt++){
      const reads=new Map(),writes=[];
      const tx={
        get:async ref=>{
          if(writes.length) throw Error("Transaction reads must precede writes");
          this.reads.push(ref.path || ref.collectionName);
          if(ref instanceof Query){
            const rows=[...this.documents].filter(([key,value])=>key.startsWith(ref.collectionName+'/') && ref.filters.every(([field,expected])=>value[field] === expected));
            return {docs:rows.map(([key,value])=>{reads.set(key,this.versions.get(key)||0);return snapshot(new Ref(this,key),value);})};
          }
          reads.set(ref.path,this.versions.get(ref.path)||0);
          return snapshot(ref,this.documents.get(ref.path));
        },
        set:(ref,data)=>writes.push(['set',ref,data]),update:(ref,data)=>writes.push(['update',ref,data]),delete:ref=>writes.push(['delete',ref])
      };
      const result=await action(tx);
      if([...reads].some(([key,version])=>(this.versions.get(key)||0)!==version)){this.retries++;continue;}
      for(const [kind,ref,data] of writes){
        if(kind==='delete')this.documents.delete(ref.path);
        else this.documents.set(ref.path,kind==='update'?{...this.documents.get(ref.path),...structuredClone(data)}:structuredClone(data));
        this.versions.set(ref.path,(this.versions.get(ref.path)||0)+1);
      }
      return result;
    }
    throw Error('contention');
  }
}
class Ref {constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}async get(){return snapshot(this,this.db.documents.get(this.path));}}
class Collection {constructor(db,name){this.db=db;this.name=name;}doc(id){return new Ref(this.db,`${this.name}/${id}`);}where(field,op,value){if(op!=='==')throw Error('unsupported');return new Query(this.db,this.name,[[field,value]]);}}
class Query {constructor(db,name,filters){this.db=db;this.collectionName=name;this.filters=filters;}where(field,op,value){return new Query(this.db,this.collectionName,[...this.filters,[field,value]]);}}
function snapshot(ref,data){return {ref,id:ref.id,exists:data!==undefined,data:()=>structuredClone(data)};}
