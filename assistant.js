const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const readline = require('readline');

async function setupDriver() {
    let options = new chrome.Options();
    options.addArguments('--incognito');
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    await driver.get('https://duckduckgo.com/?q=DuckDuckGo&ia=chat');

    async function clickButtonByClass(className) {
        await driver.wait(async () => {
            try {
                let button = await driver.findElement(By.css(`button.${className}`));
                await driver.executeScript("arguments[0].click();", button);
                return true;
            } catch (error) {
                if (error.name === "ElementClickInterceptedError") {
                    return false;
                }
                throw error;
            }
        }, 5000, "Failed to click the button after several attempts");
    }

    await clickButtonByClass('ffON2NH02oMAcqyoh2UU');
    await clickButtonByClass('ffON2NH02oMAcqyoh2UU');

    await driver.wait(async () => {
        try {
            let agreeButton = await driver.findElement(By.xpath("//button[text()='I Agree']"));
            await driver.executeScript("arguments[0].click();", agreeButton);
            return true;
        } catch (error) {
            if (error.name === "ElementClickInterceptedError") {
                return false;
            }
            throw error;
        }
    }, 5000, "Failed to click the 'I Agree' button after several attempts");

    return driver;
}
async function getAIResponse(driver, inputPrompt) {
    let textArea = await driver.wait(until.elementLocated(By.css('textarea.JRDRiEf5NPKWK43sArdC')), 5000);
    await textArea.clear();
    await textArea.sendKeys(inputPrompt, Key.RETURN);

    let maxAttempts = 25;
    let attempt = 0;
    let response = "";
    let previousResponse = "";

    while (attempt < maxAttempts) {
        await driver.sleep(2000);
        response = await driver.executeScript(`
        let divs = document.querySelectorAll('div.JXNYs5FNOplxLlVAOswQ');
        if (divs.length > 0) {
          let lastDiv = divs[divs.length - 1];
          return lastDiv.innerText;
        }
        return "";
      `);

        if (response.length > 20 && !response.includes("Generating response") && response === previousResponse) {
            break;
        }

        previousResponse = response;
        attempt++;
    }

    return response;
}

async function runChatbot() {
    const driver = await setupDriver();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        while (true) {
            const inputPrompt = await new Promise(resolve => {
                rl.question('Prompt : ', resolve);
            });

            if (inputPrompt === 'EXIT') {
                break;
            }

            const response = await getAIResponse(driver, inputPrompt);
            console.log();
            console.log('ChatBot :', response);
            console.log();
        }
    } finally {
        rl.close();
        await driver.quit();
    }
}

console.log(`Type "EXIT" to end the chat.`);
runChatbot();