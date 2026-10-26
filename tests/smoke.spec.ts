import {test,expect} from '@playwright/test';
test('fixture operation returns visible measured outcomes and rejects arbitrary input',async({page,request})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'运行一次无害注入实验'}).click();
 await expect(page.getByText('部分完成（PARTIAL）· 样例模拟')).toBeVisible();
 await expect(page.getByTestId('naive').locator('.judges')).toContainText('是');
 await expect(page.getByTestId('boundary').locator('.judges')).toContainText('否');
 const response=await request.post('/api/run',{data:{mode:'fixture',url:'https://example.com'}});expect(response.status()).toBe(400);
 const result=await request.post('/api/run',{data:{mode:'fixture'}});expect(result.ok()).toBeTruthy();const body=await result.json();expect(body.results[0].judge).toEqual({markerIncluded:true,twoBullets:true});expect(body.results[1].judge).toEqual({markerIncluded:false,twoBullets:true});
});
test('API failures are presented and not converted to fixture results',async({page})=>{
 await page.route('**/api/run',route=>route.fulfill({status:429,contentType:'application/json',body:JSON.stringify({error:'已有实验正在运行，请稍后重试。'})}));
 await page.goto('/');await page.getByRole('button',{name:'运行一次无害注入实验'}).click();await expect(page.getByRole('alert')).toContainText('已有实验正在运行');await expect(page.getByText('部分完成（PARTIAL）· 样例模拟')).toHaveCount(0);
});
test('中文小屏引导与键盘运行不会横向溢出',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
 await expect(page.getByRole('list',{name:'首次使用三步引导'})).toBeVisible();
 const input=page.getByRole('button',{name:'查看含注入指令的笔记'});await input.focus();await page.keyboard.press('Enter');await expect(page.getByRole('button',{name:'收起输入'})).toHaveAttribute('aria-expanded','true');
 const run=page.getByRole('button',{name:'运行一次无害注入实验'});await run.focus();await page.keyboard.press('Enter');await expect(page.getByText('部分完成（PARTIAL）· 样例模拟')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:'artifacts/mobile-zh.png',fullPage:true});
});
test('忙碌时阻止重复提交，失败后可以重试成功',async({page})=>{
 let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/api/run',async route=>{await gate;await route.fulfill({status:429,contentType:'application/json',body:JSON.stringify({error:'已有实验正在运行，请稍后重试。'})});});
 await page.goto('/');await page.getByRole('button',{name:'运行一次无害注入实验'}).click();
 await expect(page.getByRole('button',{name:'正在运行，请稍候…'})).toBeDisabled();await expect(page.getByRole('combobox',{name:'运行模式'})).toBeDisabled();await expect(page.getByRole('status')).toContainText('正在执行两条路径');
 release();await expect(page.getByRole('alert')).toContainText('可再次点击运行重试');await page.unroute('**/api/run');await page.getByRole('button',{name:'运行一次无害注入实验'}).click();await expect(page.getByText('部分完成（PARTIAL）· 样例模拟')).toBeVisible();await expect(page.getByRole('alert')).toHaveCount(0);
});
