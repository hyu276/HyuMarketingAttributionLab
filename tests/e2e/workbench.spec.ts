import { test,expect } from '@playwright/test';
test('Marketing workbench explains synthetic model and updates credit',async({page})=>{
  await page.goto('/lab');
  await expect(page.getByText('DEMO DATA · FIXED SCENARIO')).toBeVisible();
  await expect(page.getByText('Facebook').first()).toBeVisible();
  await page.getByLabel('Attribution model').selectOption('last_non_direct_touch');
  await expect(page.getByText('Google').first()).toBeVisible();
  await page.getByLabel('Verified checkout link exists').uncheck();
  await expect(page.getByText('Unassigned').first()).toBeVisible();
});
test('UTM builder validates URL without pretending to save',async({page})=>{
  await page.goto('/utm');
  await page.getByRole('button',{name:'Generate UTM URL'}).click();
  await expect(page.getByLabel('Generated UTM URL')).toContainText('utm_medium=paid_social');
  await expect(page.getByText('LOCAL TOOL · NO SAVE')).toBeVisible();
});
test('consent denial creates no visitor analytics ID',async({page})=>{
  await page.goto('/store');
  await page.getByRole('button',{name:'Reject / revoke analytics'}).click();
  const identifiers=await page.evaluate(()=>({
    visitor:localStorage.getItem('mal_visitor_id'),
    session:sessionStorage.getItem('mal_session'),
    consent:localStorage.getItem('mal_analytics_consent'),
  }));
  expect(identifiers).toEqual({visitor:null,session:null,consent:'rejected'});
});
