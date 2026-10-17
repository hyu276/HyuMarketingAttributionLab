'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
export default function LoginPage() {
  const router=useRouter();
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState('');
  const [signUp,setSignUp]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setError('');
    try{
      const result=signUp?await authClient.signUp.email({email,password,name}):await authClient.signIn.email({email,password});
      if(result.error) setError(result.error.message??'Authentication failed');
      else {router.push('/console');router.refresh();}
    }catch{setError('Authentication unavailable. Check the database connection.');}
    finally{setBusy(false);}
  }
  return <div className="stack-lg"><div className="eyebrow">SECURE WORKSPACE</div>
    <div className="heading-large"><h1>{signUp?'Create local account':'Sign in'}</h1>
      <p>Private workspaces and data-backed marketing reports. Email verification is not configured, so keep this local-only.</p></div>
    <form className="panel form-stack" style={{maxWidth:520}} onSubmit={submit}>
      {signUp&&<label>Name<input required value={name} onChange={e=>setName(e.target.value)}/></label>}
      <label>Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
      <label>Password<input type="password" autoComplete={signUp?'new-password':'current-password'} required minLength={12} value={password} onChange={e=>setPassword(e.target.value)}/></label>
      {error&&<p role="alert" className="error-message">{error}</p>}
      <button disabled={busy} className="button button-primary">{busy?'Working...':signUp?'Register':'Sign in'}</button>
      <button className="button button-secondary" type="button" onClick={()=>setSignUp(!signUp)}>{signUp?'I have an account':'Create an account'}</button>
    </form>
  </div>;
}
