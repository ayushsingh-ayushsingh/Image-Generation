const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');

async function generateAiArt(prompt) {
    let options = new chrome.Options();
    options.addArguments("--headless", "--disable-gpu", "--window-size=1920,1080", "--incognito");
    
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    console.log("Process-1 complete...");
    try {
        await driver.get('https://replicate.com/stability-ai/stable-diffusion-3?prediction=jrdt4zf9anrm00cgeecvs7fhbr');

        let inputArea = await driver.wait(until.elementLocated(By.id('prompt')), 10000);
        console.log("Process-2 complete...");
        await inputArea.clear();
        await inputArea.sendKeys(prompt);
        console.log("Process-3 complete...");

        await driver.actions()
            .keyDown(Key.CONTROL)
            .sendKeys(Key.RETURN)
            .keyUp(Key.CONTROL)
            .perform();
    
        let imageElement = await driver.wait(until.elementLocated(By.xpath("//img[@data-testid='value-output-image']")), 60000);
        let imageUrl = await imageElement.getAttribute('src');
        console.log("Process-4 complete...");

        let response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        console.log("Process-5 complete...");
        fs.writeFileSync('image.webp', response.data);
        console.log("Image saved as 'image.webp'");

    } finally {
        await driver.quit();
    }
}

function promptUser() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter a prompt (or type "EXIT" to quit): ', (prompt) => {
        if (prompt === 'EXIT') {
            rl.close();
            return;
        }
        generateAiArt(prompt)
            .then(() => {
                rl.close();
                promptUser();
            })
            .catch((error) => {
                console.error("An error occurred:", error);
                rl.close();
                promptUser();
            });
    });
}

promptUser();