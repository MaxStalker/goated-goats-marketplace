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

transaction(listingResourceID: UInt64, storefrontAddress: Address) {
    let storefront: &NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}

    prepare(acct: AuthAccount) {
        self.storefront = getAccount(storefrontAddress)
            .getCapability<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(
                NFTStorefront.StorefrontPublicPath
            )!
            .borrow()
            ?? panic("Could not borrow Storefront from provided address")
    }

    execute {
        // Be kind and recycle
        self.storefront.cleanup(listingResourceID: listingResourceID)
    }
}

`;

/**
* Method to generate cadence code for cleanupItem transaction
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const cleanupItemTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `cleanupItem =>`)

  return replaceImportAddresses(CODE, fullMap);
};


/**
* Sends cleanupItem transaction to the network
* @param {Object.<string, string>} props.addressMap - contract name as a key and address where it's deployed as value
* @param Array<*> props.args - list of arguments
* @param Array<*> props.signers - list of signers
*/
export const cleanupItem = async (props = {}) => {
  const { addressMap, args = [], signers = [] } = props;
  const code = await cleanupItemTemplate(addressMap);

  reportMissing("arguments", args.length, 2, `cleanupItem =>`);
  reportMissing("signers", signers.length, 1, `cleanupItem =>`);

  return sendTransaction({code, processed: true, ...props})
}