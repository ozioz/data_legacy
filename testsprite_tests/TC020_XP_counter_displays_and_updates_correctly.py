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
        # -> Click on 'START CAREER' for the Data Engineer path to proceed to the next screen.
        frame = context.pages[-1]
        # Click 'START CAREER' button for Data Engineer path
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'START TECHNICAL PATH' button to proceed to the next screen.
        frame = context.pages[-1]
        # Click 'START TECHNICAL PATH' button
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the play button on the 'ETL Basics' module to start and complete a game.
        frame = context.pages[-1]
        # Click the play button on the 'ETL Basics' module to start the game
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'START CAREER' button for the Data Engineer path to proceed to the development path selection screen.
        frame = context.pages[-1]
        # Click 'START CAREER' button for Data Engineer path
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'START TECHNICAL PATH' button to proceed to the career map screen.
        frame = context.pages[-1]
        # Click 'START TECHNICAL PATH' button
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the play button on the 'ETL Basics' module to start and complete a game.
        frame = context.pages[-1]
        # Click the play button on the 'ETL Basics' module to start the game
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[3]/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'START MISSION' button to start the game.
        frame = context.pages[-1]
        # Click the 'START MISSION' button to start the game
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'RUN PIPELINE' button to complete the game and trigger XP update.
        frame = context.pages[-1]
        # Click the 'RUN PIPELINE' button to complete the game
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill all pipeline slots with appropriate components to complete the pipeline and then run the pipeline again.
        frame = context.pages[-1]
        # Click 'CSV File' component to add to the first pipeline slot
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[4]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click 'Python Script' component to add to the second pipeline slot
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[3]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click 'SQL Database' component to add to the third pipeline slot
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[3]/div/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click 'RUN PIPELINE' button to complete the game after filling all slots
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'CONTINUE (+100 XP)' button to finalize game completion and verify the XP counter updates.
        frame = context.pages[-1]
        # Click the 'CONTINUE (+100 XP)' button to finalize game completion and update XP counter
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=XP Counter Updated Successfully').first).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test case failed: The XP counter did not display correctly or update after game completion as required by the test plan.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    