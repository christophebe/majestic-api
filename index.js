const request = require('request');
const async   = require('async');


const DS_FRESH = "fresh";
const DS_HISTORIC = "historic";

const URL_MAJESTIC = "http://api.majestic.com/api/json";
const CMD_GET_INFO = "GetIndexItemInfo";
const CMD_GET_BACKLINKS = "GetBackLinkData";

/**
 *  Get information on one or more domains
 *
 * @param options : an object with the following attributes
 *  - apiKey : the majestic api key
 *  - datasource : the majestic datasource ('fresh' or 'historic')
 *  - domains : an array of domain names or urls or subdomains (String)
 *
 * @callback return the Majestic Data :
 *            https://developer-support.majestic.com/api/commands/get-index-item-info.shtml
 */
function getDomainInfo(options, callback) {

    let isInvalid = isInValidOptions(options);
    if (isInvalid) {
        return callback(new Error(isInvalid));
    }

    let query = {
        url: URL_MAJESTIC,
        qs: {
            cmd: CMD_GET_INFO,
            datasource: options.datasource,
            app_api_key: options.apiKey,
            items : options.domains.length
        }
    };


    addDomains(query, options.domains);
    httpRequest(query, callback);
}

/*  Get backlinks for a domain
 *
 *
 * @param options : an object with the following attributes
 *  - apiKey : the majestic api key
 *  - datasource : the majestic datasource ('fresh' or 'historic')
 *  - domain : an array of domain name or url or subdomain (String)
 *  - count : number of result (optional, default : 100, max 50000)
 *  - withoutDeleted : if true, the result will not include the deleted backlinks
 *  - showDomainInfo : if true, add in the result set information on the domains
 *  - maxSourceURLsPerRefDomain
 *  - maxSameSourceURLs
 *  - refDomain
 *  - filterTopic
 *
 * @callback return the Majestic Data :
 *            https://developer-support.majestic.com/api/commands/get-index-item-info.shtml
 */
function getBacklinks(options, callback) {

    let isInvalid = isInValidOptions(options);
    if (isInvalid) {
        return callback(new Error(isInvalid));
    }

    async.concat(options.domains,
        function(domain, callback) {
            httpRequest(createBacklinksQuery(options, domain), callback);
        }, callback);

}

function createBacklinksQuery(options, domain) {
    let query = {
        url: URL_MAJESTIC,
        qs: {
            cmd: CMD_GET_BACKLINKS,
            datasource: options.datasource,
            app_api_key: options.apiKey,
            item: domain,
            refDomain: options.refDomain,
            FilterTopic: options.filterTopic,
            Count: options.count || 100,
            Mode: options.withDeleted || 0,
            ShowDomainInfo: options.showDomainInfo  ? 1 : 0,
            MaxSourceURLsPerRefDomain: options.maxSourceURLsPerRefDomain || 1,
            MaxSameSourceURLs: options.maxSourceURLsPerRefDomain || 1,

        }
    };

    return query;

}

function isInValidOptions(options) {
    if (!options.domains) {
        return "Options without domains";
    }
    if (!options.apiKey) {
        return "Options without majestic api key";
    }

    if (!options.datasource) {
        return "Options without majestic datasource";
    }

    return false;
}

function addDomains(query, domains) {

    for (let i = 0; i < domains.length; i++) {
        query.qs["item" + i] = domains[i];
    }
}

function httpRequest(query, callback) {
    request(query, function(error, response, body) {
        if (error) {
            return callback(error);
        }

        if (response.statusCode === 200) {
            //console.log(body);
            let info = JSON.parse(body);
            if (info.Code === "OK") {
                return callback(null, info);
            } else {

                let error = new Error("Error when retrieving Majestic data - code : " + info.Code + " - " + info.ErrorMessage);
                return callback(error);
            }
        } else {
            let error = new Error("Impossible to get the Majestic data (http status code :" + response.statusCode + " )");
            callback(error);
        }
    });
}

module.exports.getDomainInfo = getDomainInfo;
module.exports.getBacklinks = getBacklinks;
module.exports.DS_FRESH = DS_FRESH;
module.exports.DS_HISTORIC = DS_HISTORIC;
