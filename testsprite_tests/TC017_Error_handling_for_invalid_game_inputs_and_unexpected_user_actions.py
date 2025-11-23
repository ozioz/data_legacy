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
        # -> Start a game by clicking 'START CAREER' for Data Engineer.
        frame = context.pages[-1]
        # Click 'START CAREER' for Data Engineer to start the game.
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Start the game by clicking 'START TECHNICAL PATH' to proceed to the game screen.
        frame = context.pages[-1]
        # Click 'START TECHNICAL PATH' to start the technical mastery game path.
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the play button to start the 'ETL Basics' game level.
        frame = context.pages[-1]
        # Click the play button to start the 'ETL Basics' game level.
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'START CAREER' for Data Engineer to start the game.
        frame = context.pages[-1]
        # Click 'START CAREER' for Data Engineer to start the game.
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'START TECHNICAL PATH' to start the technical mastery game path.
        frame = context.pages[-1]
        # Click 'START TECHNICAL PATH' to start the technical mastery game path.
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the play button for 'ETL Basics' to start the game level and test invalid inputs.
        frame = context.pages[-1]
        # Click the play button for 'ETL Basics' to start the game level.
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[3]/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'START MISSION' button to begin the 'ETL Basics' game level.
        frame = context.pages[-1]
        # Click the 'START MISSION' button to begin the 'ETL Basics' game level.
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Attempt an invalid pipeline sequence by selecting components in a wrong order and clicking 'RUN PIPELINE' to trigger error handling.
        frame = context.pages[-1]
        # Select 'SQL Query' component first, which is an invalid start for the pipeline.
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[3]/div/button[5]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click 'RUN PIPELINE' to run the pipeline with the invalid sequence and check for error messages.
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Test invalid query syntax by selecting 'SQL Query', entering invalid syntax if possible, and running the pipeline to verify error handling.
        frame = context.pages[-1]
        # Select 'SQL Query' component to prepare for invalid query syntax input.
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[4]/div/button[5]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Attempt to run the pipeline with invalid query syntax and verify error handling.
        frame = context.pages[-1]
        # Click 'RUN PIPELINE' to run the pipeline with the current SQL Query components and check for error messages related to invalid query syntax.
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Back' button during the active game to verify navigation back to the Career Map without errors.
        frame = context.pages[-1]
        # Click the 'Back' button to return to the Career Map screen during the active game.
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div/div[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Back').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=HINT (-20%)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=RUN PIPELINE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SQL Query').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ETL Basics').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Data Pipeline').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=0 XP').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    