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

transaction(listingResourceID: UInt64) {
    let storefront: &NFTStorefront.Storefront{NFTStorefront.StorefrontManager}

    prepare(acct: AuthAccount) {
        self.storefront = acct.borrow<&NFTStorefront.Storefront{NFTStorefront.StorefrontManager}>(from: NFTStorefront.StorefrontStoragePath)
            ?? panic("Missing or mis-typed NFTStorefront.Storefront")
    }

    execute {
        self.storefront.removeListing(listingResourceID: listingResourceID)
    }
}
`;

/**
* Method to generate cadence code for removeItem transaction
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const removeItemTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `removeItem =>`)

  return replaceImportAddresses(CODE, fullMap);
};


/**
* Sends removeItem transaction to the network
* @param {Object.<string, string>} props.addressMap - contract name as a key and address where it's deployed as value
* @param Array<*> props.args - list of arguments
* @param Array<*> props.signers - list of signers
*/
export const removeItem = async (props = {}) => {
  const { addressMap, args = [], signers = [] } = props;
  const code = await removeItemTemplate(addressMap);

  reportMissing("arguments", args.length, 1, `removeItem =>`);
  reportMissing("signers", signers.length, 1, `removeItem =>`);

  return sendTransaction({code, processed: true, ...props})
}