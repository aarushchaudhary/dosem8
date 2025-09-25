// services/ipaPharmaService.js
const axios = require('axios');
const cheerio = require('cheerio');

const IPA_URL = 'https://ipapharma.org/portfolio/regulations-and-guidelines/';

/**
 * Scrapes the IPA website for regulatory information.
 * @param {string} query The user's query to search for on the page.
 * @returns {Promise<string|null>} A string containing the scraped information, or null if no relevant data is found.
 */
async function fetchIpaPharmaData(query) {
    try {
        const response = await axios.get(IPA_URL);
        const $ = cheerio.load(response.data);

        // This site has a clear structure we can use. We'll look for list items
        // within the main content area that contain the user's query.
        const content = $('.entry-content');
        let foundData = [];

        content.find('li').each((i, el) => {
            const text = $(el).text();
            if (text.toLowerCase().includes(query.toLowerCase())) {
                foundData.push(`- ${text.trim()}`);
            }
        });

        if (foundData.length > 0) {
            return `Found the following related guidelines on ipapharma.org:\n${foundData.join('\n')}`;
        }

        return null; // Return null if no matches are found

    } catch (error) {
        console.error('Error scraping IPA Pharma website:', error);
        // Return a clear error message that can be displayed to the user or logged.
        return 'Could not fetch data from the IPA Pharma website at this time.';
    }
}

module.exports = { fetchIpaPharmaData };