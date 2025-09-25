// services/cdscoService.js
const axios = require('axios');
const cheerio = require('cheerio');

const CDSCO_URL = 'https://cdsco.gov.in/opencms/opencms/en/Home/';

/**
 * Scrapes the CDSCO website for drug information.
 * @param {string} drugName The name of the drug to search for.
 * @returns {Promise<string>} A string containing the scraped information.
 */
async function fetchDrugInfo(drugName) {
    try {
        // This is a simplified example. A real implementation would involve
        // more sophisticated scraping of specific pages like the "Approved New Drugs" list.
        const response = await axios.get(CDSCO_URL);
        const $ = cheerio.load(response.data);

        // For demonstration, we'll search for the drug name in the page's text.
        const bodyText = $('body').text();
        const searchRegex = new RegExp(`.{0,100}${drugName}.{0,100}`, 'gi');
        const matches = bodyText.match(searchRegex);

        if (matches) {
            return `Found mentions of "${drugName}" on the CDSCO website:\n- ` + matches.join('\n- ');
        } else {
            return `No direct mentions of "${drugName}" found on the CDSCO homepage.`;
        }
    } catch (error) {
        console.error('Error scraping CDSCO website:', error);
        return 'Could not fetch data from the CDSCO website at the moment.';
    }
}

module.exports = { fetchDrugInfo };