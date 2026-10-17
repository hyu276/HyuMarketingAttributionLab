import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/e2e',
  fullyParallel:false,
  timeout:45000,
  use:{baseURL:'http://localhost:3000',trace:'retain-on-failure',screenshot:'only-on-failure'},
  projects:[{name:'chromium',use:{browserName:'chromium'}}],
  webServer:{
    command:'npm run dev -- -H localhost',
    url:'http://localhost:3000',
    reuseExistingServer:false,
    timeout:120000,
  },
});
