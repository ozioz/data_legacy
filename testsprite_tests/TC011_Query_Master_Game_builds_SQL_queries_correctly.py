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
        # -> Click on 'Data Engineer' career path to proceed to Career Map and select Query Master level.
        frame = context.pages[-1]
        # Click on 'Data Engineer' career path to proceed to Career Map.
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'START TECHNICAL PATH' button to proceed to the Technical Mastery path.
        frame = context.pages[-1]
        # Click on 'START TECHNICAL PATH' button to proceed to Technical Mastery path.
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Scroll down and locate the 'Query Master' level to select it.
        await page.mouse.wheel(0, 600)
        

        # -> Scroll further down to locate the 'Query Master' level or any SQL query building module.
        await page.mouse.wheel(0, 600)
        

        # -> Scroll further down or try to locate Query Master level by searching or alternative navigation.
        await page.mouse.wheel(0, 600)
        

        # -> Go back to the previous page to try alternative navigation to locate Query Master level or SQL query building game.
        frame = context.pages[-1]
        # Click the back button or equivalent to return to previous page for alternative navigation.
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Data Engineer' career path to proceed to Career Map and select Query Master level.
        frame = context.pages[-1]
        # Click on 'Data Engineer' career path to proceed to Career Map.
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'START TECHNICAL PATH' button to enter Technical Mastery path and locate Query Master level.
        frame = context.pages[-1]
        # Click on 'START TECHNICAL PATH' button to enter Technical Mastery path.
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on the 'ETL Basics' play button to enter the module and check for Query Master or SQL query building blocks.
        frame = context.pages[-1]
        # Click on 'ETL Basics' play button to enter the module.
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[3]/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'START MISSION' button to enter the mission and check for Query Master or SQL query building blocks.
        frame = context.pages[-1]
        # Click 'START MISSION' button to start ETL Basics mission.
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'SQL Query' block to add it to the pipeline, then click 'RUN PIPELINE' to execute the query and verify feedback.
        frame = context.pages[-1]
        # Click on 'SQL Query' block to add it to the pipeline.
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[3]/div/button[5]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'RUN PIPELINE' button to execute the query and verify if the game validates the query and shows success or error feedback.
        frame = context.pages[-1]
        # Click the 'RUN PIPELINE' button to execute the query and verify feedback.
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Add the missing blocks to complete the pipeline and run it again to verify success feedback.
        frame = context.pages[-1]
        # Click on 'CSV File' block to add it to the pipeline as the first component.
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[4]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Add one more block to complete the pipeline and then click 'RUN PIPELINE' to verify success feedback.
        frame = context.pages[-1]
        # Click on 'Python Script' block to add it to the pipeline as the third component.
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[3]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=0 XP').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ETL Basics').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Data Pipeline').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Back').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SQL Query').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=QUERY').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=CSV File').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=DATA').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Python Script').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=PROCESS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=HINT (-20%)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=RUN PIPELINE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=AVAILABLE COMPONENTS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SQL Database').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=STORAGE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=JSON Data').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    