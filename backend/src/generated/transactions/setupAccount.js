/** pragma type transaction **/

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
  sendTransaction
} from 'flow-cadut'

export const CODE = `
import NFTStorefront from "../contracts/NFTStorefront.cdc"

// This transaction installs the Storefront ressource in an account.

transaction {
    prepare(acct: AuthAccount) {

        // If the account doesn't already have a Storefront
        if acct.borrow<&NFTStorefront.Storefront>(from: NFTStorefront.StorefrontStoragePath) == nil {

            // Create a new empty .Storefront
            let storefront <- NFTStorefront.createStorefront() as! @NFTStorefront.Storefront
            
            // save it to the account
            acct.save(<-storefront, to: NFTStorefront.StorefrontStoragePath)

            // create a public capability for the .Storefront
            acct.link<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(NFTStorefront.StorefrontPublicPath, target: NFTStorefront.StorefrontStoragePath)
        }
    }
}

`;

/**
* Method to generate cadence code for setupAccount transaction
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const setupAccountTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `setupAccount =>`)

  return replaceImportAddresses(CODE, fullMap);
};


/**
* Sends setupAccount transaction to the network
* @param {Object.<string, string>} props.addressMap - contract name as a key and address where it's deployed as value
* @param Array<*> props.args - list of arguments
* @param Array<*> props.signers - list of signers
*/
export const setupAccount = async (props = {}) => {
  const { addressMap, args = [], signers = [] } = props;
  const code = await setupAccountTemplate(addressMap);

  reportMissing("arguments", args.length, 0, `setupAccount =>`);
  reportMissing("signers", signers.length, 1, `setupAccount =>`);

  return sendTransaction({code, processed: true, ...props})
}