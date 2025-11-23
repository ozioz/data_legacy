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
        # -> Find and start the game to begin completion process
        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        # -> Try to reload or interact with the page to reveal game start elements
        await page.mouse.wheel(0, -await page.evaluate('() => window.innerHeight'))
        

        # -> Try to reload the page to see if UI elements appear
        await page.goto('http://localhost:5173/', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Click the 'START CAREER' button for the 'Data Engineer' career path to start the game.
        frame = context.pages[-1]
        # Click 'START CAREER' button for Data Engineer to start the game
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'START TECHNICAL PATH' button to start the technical mastery path and proceed with the game.
        frame = context.pages[-1]
        # Click 'START TECHNICAL PATH' button to start the technical mastery path
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the play button on the 'ETL Basics' module to start and complete the game module.
        frame = context.pages[-1]
        # Click the play button on 'ETL Basics' module to start the game module
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'START CAREER' button for 'Data Engineer' again to restart the game and try to progress properly.
        frame = context.pages[-1]
        # Click 'START CAREER' button for Data Engineer to restart the game
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'START TECHNICAL PATH' button to start the technical mastery path and proceed with the game.
        frame = context.pages[-1]
        # Click 'START TECHNICAL PATH' button to start the technical mastery path
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the play button on the 'ETL Basics' module to start and complete the game module.
        frame = context.pages[-1]
        # Click the play button on 'ETL Basics' module to start the game module
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[3]/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'START MISSION' button to begin the ETL Basics mission.
        frame = context.pages[-1]
        # Click 'START MISSION' button to begin the ETL Basics mission
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'RUN PIPELINE' button to execute the pipeline and complete the ETL Basics mission.
        frame = context.pages[-1]
        # Click the 'RUN PIPELINE' button to execute the pipeline and complete the mission
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill the first pipeline slot with 'CSV File', the second with 'Python Script', and the third with 'SQL Database' by clicking the respective component buttons to place them in the pipeline slots.
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
        

        # -> Click the 'RUN PIPELINE' button to execute the pipeline and complete the ETL Basics mission.
        frame = context.pages[-1]
        # Click the 'RUN PIPELINE' button to execute the completed pipeline and complete the mission
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'CONTINUE (+100 XP)' button to proceed and check for the Story Modal.
        frame = context.pages[-1]
        # Click the 'CONTINUE (+100 XP)' button to proceed after mission completion
        elem = frame.locator('xpath=html/body/div/div/div[2]/div[2]/div/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=MISSION COMPLETE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=RETURN TO HQ').first).to_be_visible(timeout=30000)
        # Click 'RETURN TO HQ' button to dismiss the modal
        await frame.locator('text=RETURN TO HQ').first.click()
        # Verify Career Map appears after modal dismissal by checking for 'ETL Basics' text
        await expect(frame.locator('text=ETL Basics').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    