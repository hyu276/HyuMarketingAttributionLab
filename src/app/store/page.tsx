import { Suspense } from 'react';
import { StoreClient } from './store-client';

export default function StorePage(){
  return <Suspense fallback={<p>Đang chuẩn bị demo store...</p>}><StoreClient/></Suspense>;
}
