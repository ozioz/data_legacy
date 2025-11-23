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
        # -> Click on 'START CAREER' for the Data Engineer to trigger path selection UI.
        frame = context.pages[-1]
        # Click 'START CAREER' button for Data Engineer to select a hero and trigger Path Selection UI
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Attempt to access games or progression UI without selecting a path and verify UI prevents this.
        frame = context.pages[-1]
        # Attempt to click a non-path selection button or progression button to test if UI prevents progression without path selection
        elem = frame.locator('xpath=html/body/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'START CAREER' for Data Engineer to select a hero and trigger path selection UI.
        frame = context.pages[-1]
        # Click 'START CAREER' button for Data Engineer to select a hero and trigger Path Selection UI
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'START TECHNICAL PATH' button to select the Technical Mastery path and verify progression.
        frame = context.pages[-1]
        # Click 'START TECHNICAL PATH' button to select Technical Mastery path and proceed
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the play button on the 'ETL Basics' module to verify user can access the game after path selection.
        frame = context.pages[-1]
        # Click the play button on the 'ETL Basics' module to start the game and verify access after path selection
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Attempt to progress without selecting a path and verify UI prevents progression.
        frame = context.pages[-1]
        # Click 'START CAREER' for Data Engineer to trigger path selection UI again.
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'START BEHAVIORAL PATH' button to select the Soft Skills & Leadership path and verify progression.
        frame = context.pages[-1]
        # Click 'START BEHAVIORAL PATH' button to select Soft Skills & Leadership path and proceed
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the play button on the 'Prioritization' task to verify user can access the game after path selection.
        frame = context.pages[-1]
        # Click the play button on the 'Prioritization' task to start the game and verify access after path selection
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Attempt to progress without selecting a path and verify UI prevents progression.
        frame = context.pages[-1]
        # Click 'START CAREER' button for Data Engineer to trigger path selection UI
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Attempt to progress without selecting a path by clicking a progression button and verify UI prevents progression.
        frame = context.pages[-1]
        # Attempt to click a progression button or play button without selecting a path to verify UI prevents progression
        elem = frame.locator('xpath=html/body/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the back button (index 1) to verify navigation back to hero selection screen and UI state consistency.
        frame = context.pages[-1]
        # Click the back button in the top-left corner to navigate back to hero selection screen
        elem = frame.locator('xpath=html/body/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Attempt to progress without selecting a path by clicking 'START CAREER' for Data Engineer and then trying to proceed without path selection to verify UI prevents progression.
        frame = context.pages[-1]
        # Click 'START CAREER' button for Data Engineer to trigger path selection UI
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=FORK IN THE ROAD').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Choose Your Development Path').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=As a Data Engineer, how will you grow?').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Technical Mastery').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Master the tools. Build pipelines, optimize models, and defend servers.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=START TECHNICAL PATH').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Soft Skills & Leadership').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Master the people. Manage stakeholders, negotiate deadlines, and handle crises.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=START BEHAVIORAL PATH').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Career Map').first).to_be_hidden(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    