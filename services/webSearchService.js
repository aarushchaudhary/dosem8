// services/webSearchService.js
const google = require('google-it');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Searches Indian government websites and scrapes the top results.
 * @param {string} query The user's search query.
 * @returns {Promise<string>} A string containing the aggregated content from the top search results.
 */
async function searchAndScrapeGovSites(query) {
    try {
        console.log(`Searching for: ${query} site:.gov.in`);
        
        // 1. Perform a Google search limited to .gov.in domains
        const searchResults = await google({ 
            query: `${query} site:.gov.in`,
            limit: 3 // Let's scrape the top 3 results
        });

        if (!searchResults || searchResults.length === 0) {
            return 'No relevant government web pages found for this query.';
        }

        let combinedContext = '';

        // 2. Scrape each of the top results
        for (const result of searchResults) {
            try {
                const { data } = await axios.get(result.link);
                const $ = cheerio.load(data);
                
                // Remove script, style, and other non-content tags
                $('script, style, nav, footer, header').remove();
                
                const pageText = $('body').text().replace(/\s\s+/g, ' ').trim();
                
                combinedContext += `--- Source: ${result.link} ---\n${pageText.substring(0, 2000)}\n\n`; // Limit characters per page
            } catch (scrapeError) {
                console.error(`Failed to scrape ${result.link}:`, scrapeError.message);
            }
        }

        return combinedContext;

    } catch (error) {
        console.error('Error during web search and scrape:', error);
        return 'There was an error searching for regulatory information online.';
    }
}

module.exports = { searchAndScrapeGovSites };