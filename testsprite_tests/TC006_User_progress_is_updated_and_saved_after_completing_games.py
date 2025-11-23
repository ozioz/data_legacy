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
        # -> Click on the 'START CAREER' button for the 'Data Engineer' path to navigate to the Career Map.
        frame = context.pages[-1]
        # Click 'START CAREER' button for Data Engineer to enter Career Map
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'START TECHNICAL PATH' button to enter the Career Map for Technical Mastery.
        frame = context.pages[-1]
        # Click 'START TECHNICAL PATH' button to enter Technical Mastery Career Map
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the unlocked ETL Basics level to start the game.
        frame = context.pages[-1]
        # Click the unlocked ETL Basics level to start the game
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[3]/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'START MISSION' button to begin the game.
        frame = context.pages[-1]
        # Click 'START MISSION' button to start the ETL Basics game mission
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'RUN PIPELINE' button to execute the pipeline and complete the game.
        frame = context.pages[-1]
        # Click 'RUN PIPELINE' button to execute the pipeline and complete the game
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill the three pipeline slots with appropriate components from the available components to complete the pipeline.
        frame = context.pages[-1]
        # Click 'CSV File' component to fill the first pipeline slot
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[4]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click 'Python Script' component to fill the second pipeline slot
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[3]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click 'SQL Database' component to fill the third pipeline slot
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[3]/div/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'RUN PIPELINE' button to execute the completed pipeline and complete the game.
        frame = context.pages[-1]
        # Click 'RUN PIPELINE' button to execute the completed pipeline and complete the game
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'CONTINUE (+100 XP)' button to return to the Career Map and verify updates.
        frame = context.pages[-1]
        # Click 'CONTINUE (+100 XP)' button to return to Career Map and trigger UI update
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'RETURN TO HQ' button to go back to the Career Map and verify updates.
        frame = context.pages[-1]
        # Click 'RETURN TO HQ' button to return to Career Map and verify new unlocked levels and XP counter
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[3]/div/div[2]/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Signal vs. Noise').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=XP: 100').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    