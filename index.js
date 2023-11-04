const puppeteer = require('puppeteer');

const getCurrentTime = () => {
    let now = new Date();
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    let seconds = now.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

(async () => {
    console.log(`${getCurrentTime()} : Prefecture de Boulogne - Recherche de Rendez-vous`);
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const retryAfter = 30000;
    let popRGPD = true;

    const plannings = [
        'planning15538',
        'planning15537',
        'planning12250'
    ]
    const navigate = async (checkboxID) => {

        await page.goto('https://www.hauts-de-seine.gouv.fr/booking/create/12249/1');
        await page.waitForTimeout(2000);
        if (popRGPD) {
            await page.waitForSelector('button.tarteaucitronCTAButton', { visible: true });
            await page.click('button.tarteaucitronCTAButton');
            popRGPD = false;
        }

        await page.waitForTimeout(2000);
        console.log(`${getCurrentTime()} : Test du guichet ${checkboxID + 1}...`);
        await page.waitForSelector(`#${plannings[checkboxID]}`, { visible: true });
        await page.click(`#${plannings[checkboxID]}`);
        // let radios = await page.$$(`input[type="radio"]`);
        // await radios[checkboxID].click();

        await page.click('input[type="submit"]');
        //await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await page.waitForTimeout(4000);
    }

    async function checkAvailability(checkboxID) {
        checkboxID = (checkboxID > 2) ? 0 : checkboxID;
        await navigate(checkboxID);
        let content = await page.content();
        await page.waitForTimeout(2000);
        if (content.includes("Il n'existe plus de plage horaire libre pour votre demande")) {
            console.log(`${getCurrentTime()} : Aucun rendez-vous trouvé. Prochain réessai dans ${retryAfter / 1000} secondes...`);

            setTimeout(() => checkAvailability(++checkboxID), retryAfter);
        } else {
            console.log(`${getCurrentTime()} : Rendez-vous trouvé !`);
        }
    }

    checkboxID = 0;
    await checkAvailability(checkboxID);

})();
