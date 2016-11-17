const assert   = require("assert");
const majestic = require("../index.js");
const util     = require('util');
const _        = require('underscore');
const URI      = require('urijs');

describe('Get domain info', function() {


        it('one domain', function(done) {

            let options = {

                apiKey : process.env.MAJESTIC_API_KEY,
                datasource : majestic.DS_FRESH,
                domains : ['googlesdsdsds.com']

            };

            majestic.getDomainInfo(options, function(error, result){
                if (error) {
                  return done(error);
                }
                console.log(util.inspect(result, false, null));

                done();
            });

        });


        it('multiple domains', function(done) {

            let options = {

                apiKey : process.env.MAJESTIC_API_KEY,
                datasource : majestic.DS_FRESH,
                domains : ['googles.com', 'cnn.com']

            };

            majestic.getDomainInfo(options, function(error, result){
                if (error) {
                  return done(error);
                }
                console.log(util.inspect(result, false, null));

                done();
            });

        });

});
