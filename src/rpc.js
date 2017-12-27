const request = require("request");
/**
 * @type {Object} RPCOptions
 * @property {String}  method   - RPC Method to invoke
 * @property {Object}  params   - Parameters to invoke the `method` with.
 * @property {URL}     endpoint - A parsed URL object (from `url` module) to send the request to.
 * @property {Integer} [id]     - Optional. Request id.
 */

/**
 * Sends a JSONRPC v2.0 request using the provided options.
 * @param  {RPCOptions}   options   Request options
 * @return {Promise}                A Promise for the result of the request.
 */
const makeRpcRequest = function (options) {
    return new Promise((g, b) => {
        let proxy = options["params"]["proxy"] || null;
        let api_key = options["params"]["apiKey"];
        
        delete options["params"]["proxy"];
        let postData = JSON.stringify({
            jsonrpc: '2.0',
            method: options["method"],
            params: options["params"],
            id: options["id"] || 666
        });
        let endpoint = options["endpoint"];
        let requestParams = {
            method: 'POST',
            url: endpoint.href,
            proxy: proxy,
            body: postData,
            timeout: 10000,
            strictSSL: true
        };
        let start_time = Date.now();
        let this_req = request(requestParams, (err, document, body) => {
            clearTimeout(this_req_timer);
            if (err) {
                b(new Error(err));
            } else {
                try {
                    let res_json = JSON.parse(body);
                    if (res_json.error) {
                        b(res_json.error);
                    } else {
                        g({res: res_json, proxy: proxy, key: api_key});
                    }
                } catch (e) {
                    b(new Error('Received invalid JSON'), body);
                }
            }
        });
        let this_req_timer = setTimeout(() => {
            this_req.abort();
            this_req.destroy();
            b("abort request");
        }, requestParams.timeout);
    })
};


module.exports.makeRpcRequest = makeRpcRequest;
