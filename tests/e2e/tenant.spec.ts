import { test, expect } from '@playwright/test';

test('workspace/site/report reads reject unauthenticated and foreign members',async({browser,request})=>{
  const anonymous=await request.get('/api/v1/workspaces');
  expect(anonymous.status()).toBe(401);
  const a=await browser.newContext();
  const b=await browser.newContext();
  try {
    const pageA=await a.newPage();
    await pageA.goto('/login');
    await pageA.getByRole('button',{name:'Create an account'}).click();
    await pageA.getByLabel('Name').fill('Workspace A');
    await pageA.getByLabel('Email').fill('tenant-a-'+Date.now()+'@example.invalid');
    await pageA.getByLabel('Password').fill('tenant-safety-password-123');
    const [signupA]=await Promise.all([pageA.waitForResponse(r=>r.url().includes('/api/auth/sign-up/email')),pageA.getByRole('button',{name:'Register'}).click()]);
    expect(signupA.ok(),await signupA.text()).toBe(true);
    await expect(pageA).toHaveURL(/\/console/,{timeout:15000});
    await pageA.getByRole('button',{name:'Workspace setup',exact:true}).click();
    await pageA.getByLabel('New workspace').fill('Tenant A workspace');
    await pageA.getByRole('button',{name:'Create workspace'}).click();
    await expect(pageA.getByText('Workspace created')).toBeVisible();
    const w=(await(await a.request.get('/api/v1/workspaces')).json()).workspaces[0].id as string;
    await pageA.getByLabel('Site name').fill('Private site');
    await pageA.getByLabel('Allowed hostname').fill('localhost');
    await pageA.getByRole('button',{name:'Add site'}).click();
    await expect(pageA.getByText('Site created')).toBeVisible();
    const s=(await(await a.request.get('/api/v1/sites?workspaceId='+w)).json()).sites[0].id as string;
    const pageB=await b.newPage();
    await pageB.goto('/login');
    await pageB.getByRole('button',{name:'Create an account'}).click();
    await pageB.getByLabel('Name').fill('Workspace B');
    await pageB.getByLabel('Email').fill('tenant-b-'+Date.now()+'@example.invalid');
    await pageB.getByLabel('Password').fill('tenant-safety-password-123');
    const [signupB]=await Promise.all([pageB.waitForResponse(r=>r.url().includes('/api/auth/sign-up/email')),pageB.getByRole('button',{name:'Register'}).click()]);
    expect(signupB.ok(),await signupB.text()).toBe(true);
    await expect(pageB).toHaveURL(/\/console/,{timeout:15000});
    const foreignSites=await b.request.get('/api/v1/sites?workspaceId='+w);
    expect(foreignSites.status()).toBe(403);
    const foreignReport=await b.request.get('/api/v1/reports/overview?siteId='+s+'&from=2026-10-01&to=2026-10-31');
    expect(foreignReport.status()).toBe(403);
  } finally {await a.close();await b.close();}
});
