const assert   = require("assert");
const majestic = require("../index.js");
const util     = require('util');
const _        = require('underscore');
const URI      = require('urijs');

describe('Get backlinks', function() {


        it('With no options', function(done) {

            let options = {

                apiKey : process.env.MAJESTIC_API_KEY,
                datasource : majestic.DS_FRESH,
                domains : ['google.com']

            };

            majestic.getBacklinks(options, function(error, result){
                if (error) {
                  return done(error);
                }
                //console.log(util.inspect(result, false, null));
                assert(result.Code ==='OK');
                //console.log("Number of links : " +  result.DataTables.BackLinks.Headers.AvailableLines);
                /*
                result.DataTables.BackLinks.Data.forEach(function(link){
                    console.log(link.SourceURL +  "," + link.SourceTrustFlow +  "," + link.SourceCitationFlow + "," + link.SourceTopicalTrustFlow_Topic_0 + "," + link.SourceTopicalTrustFlow_Topic_1 +  "," + link.SourceTopicalTrustFlow_Topic_2);
                });
                */
                done();
            });

        });

        it('With options', function(done) {
            let options = {

                apiKey : process.env.MAJESTIC_API_KEY,
                datasource : majestic.DS_FRESH,
                domains : ['wikipedia.org ', 'cnn.com', 'w3.org'],
                count : 100,
                showDomainInfo : true
            };

            majestic.getBacklinks(options, function(error, result){
                if (error) {
                  return done(error);
                }
                //console.log(util.inspect(result, false, null));

                let domains = options.showDomainInfo ?  _.flatten(_.map(result, function(r){return r.DataTables.DomainsInfo.Data; })) : [];
                //console.log(util.inspect(domains, false, null));

                let backlinks = _.sortBy(_.flatten(_.map(result, function(r){ return r.DataTables.BackLinks.Data;})), function(link){ return -link.SourceTrustFlow; });
                //console.log(util.inspect(backlinks, false, null));


                console.log("Domain,Domain TF,Domain CF,'TLD', URL Source,URL TF,URL CF,Topic 1,Topic 2,Topic 3,Link Type,Anchor Text,Target URL,Redirect,Image");
                backlinks.forEach(function(link){
                    let sourceDomain = new URI(link.SourceURL);
                    let domainInfo = _.find(domains, function(domain){ return domain.Domain === sourceDomain.domain(); });

                    let output = "";
                    if (domainInfo) {
                      output = domainInfo.Domain + "," + domainInfo.TrustFlow + "," + domainInfo.CitationFlow + "," + domainInfo.TLD + "," ;
                    }
                    else {
                      output =  ",,,," ;
                    }

                    output += link.SourceURL +  "," + link.SourceTrustFlow +  "," + link.SourceCitationFlow + "," +
                    link.SourceTopicalTrustFlow_Topic_0 + "," + link.SourceTopicalTrustFlow_Topic_1 +  "," + link.SourceTopicalTrustFlow_Topic_2 + "," +
                    link.LinkType + "," + link.AnchorText + "," + link.TargetURL + ',' + link.FlagRedirect + "," + link.FlagImages;

                    console.log(output);

                });

                done();

            });

        });
});
