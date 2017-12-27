const makeRpcRequest = require('./rpc').makeRpcRequest;
const url = require("url");

function RandomOrg(opts) {
    /*if (typeof this.apiKey !== 'string') {
        throw new Error('options.apiKey is required & must be a String');
    }*/
    this.apiKey = opts.apiKey || "00000000-0000-0000-0000-000000000000";
    this.endpoint = opts.endpoint || 'https://api.random.org/json-rpc/1/invoke';
    this.endpoint = url.parse(this.endpoint);
    
    // For testing.
    this._makeRpcRequest = makeRpcRequest;
    
    this._enrichParams = (method, params) => {
        //console.log("RandomOrg.prototype._enrichParams::", method, params);
        if (method === 'verifySignature') {
            /* The verifySignature method requires no api key (so that anyone
             * can verify the authenticity of some response). */
            return params;
        }
        
        let requestParams = {apiKey: this.apiKey};
        Object.keys(params || {}).forEach(function (property) {
            let this_param = params[property];
            if (property === "proxy" && (this_param.toLowerCase().indexOf("http") !== 0)) {
                this_param = "http://" + this_param;
            }
            requestParams[property] = this_param;
        });
        return requestParams;
    };
    
    this.createInvocation = async function (methodName, params) {
        let requestOpts = {
            endpoint: this.endpoint,
            method: methodName,
            params: this._enrichParams(methodName, params)
        };
        return this._makeRpcRequest(requestOpts);
    };
    
    let self = this;
    
    [
        // Basic api methods
        'generateIntegers',
        'generateDecimalFractions',
        'generateGaussians',
        'generateStrings',
        'generateUUIDs',
        'generateBlobs',
        'getUsage',
        // Signed api methods
        'generateSignedIntegers',
        'generateSignedDecimalFractions',
        'generateSignedGaussians',
        'generateSignedStrings',
        'generateSignedUUIDs',
        'generateSignedBlobs',
        'verifySignature'
    ].forEach(function (methodName) {
        RandomOrg.prototype[methodName] = async function (params) {
            return self.createInvocation(methodName, params)
        };
    });
    
    return this;
}

module.exports = RandomOrg;
