import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:5173", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Select a hero (e.g., Data Engineer) and then click the 'Technical Mastery' path option.
        frame = context.pages[-1]
        # Click on 'Data Engineer' hero card to select it.
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Technical Mastery' path option to start the technical career path.
        frame = context.pages[-1]
        # Click 'START TECHNICAL PATH' button to select Technical Mastery path.
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Go back to path selection and click 'Soft Skills & Leadership' path option to verify Behavioral career map.
        frame = context.pages[-1]
        # Click the 'CAREER PATH' button or breadcrumb to go back to path selection.
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Data Engineer' hero card to select it and proceed to path selection.
        frame = context.pages[-1]
        # Click on 'Data Engineer' hero card to select it.
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Soft Skills & Leadership' path option to start the behavioral career path and verify the Career Map updates accordingly.
        frame = context.pages[-1]
        # Click 'START BEHAVIORAL PATH' button to select Soft Skills & Leadership path.
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=CAREER PATH').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Data Engineer').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=BEHAVIORAL').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Prioritization').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Incident Management').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Saying No').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    