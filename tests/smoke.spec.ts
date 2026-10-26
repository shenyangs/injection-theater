import {test,expect} from '@playwright/test';
test('fixture operation returns visible measured outcomes and rejects arbitrary input',async({page,request})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Run one benign local injection test'}).click();
 await expect(page.getByText('PARTIAL · Fixture simulation')).toBeVisible();
 await expect(page.getByTestId('naive').locator('.judges')).toContainText('YES');
 await expect(page.getByTestId('boundary').locator('.judges')).toContainText('NO');
 const response=await request.post('/api/run',{data:{mode:'fixture',url:'https://example.com'}});expect(response.status()).toBe(400);
 const result=await request.post('/api/run',{data:{mode:'fixture'}});expect(result.ok()).toBeTruthy();const body=await result.json();expect(body.results[0].judge).toEqual({markerIncluded:true,twoBullets:true});expect(body.results[1].judge).toEqual({markerIncluded:false,twoBullets:true});
});
test('API failures are presented and not converted to fixture results',async({page})=>{
 await page.route('**/api/run',route=>route.fulfill({status:429,contentType:'application/json',body:JSON.stringify({error:'An experiment is already running'})}));
 await page.goto('/');await page.getByRole('button',{name:'Run one benign local injection test'}).click();await expect(page.getByRole('alert')).toContainText('already running');await expect(page.getByText('PARTIAL · Fixture simulation')).toHaveCount(0);
});
