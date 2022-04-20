/** pragma type script **/

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
  executeScript
} from 'flow-cadut'

export const CODE = `
import NFTStorefront from "../../contracts/NFTStorefront.cdc"

// This script returns an array of all the nft uuids for sale through a Storefront

pub fun main(account: Address): [UInt64] {
    let storefrontRef = getAccount(account)
        .getCapability<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(
            NFTStorefront.StorefrontPublicPath
        )
        .borrow()
        ?? panic("Could not borrow public storefront from address")
    
    return storefrontRef.getListingIDs()
}

`;

/**
* Method to generate cadence code for readStorefrontIds script
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const readStorefrontIdsTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `readStorefrontIds =>`)

  return replaceImportAddresses(CODE, fullMap);
};

export const readStorefrontIds = async (props = {}) => {
  const { addressMap = {}, args = [] } = props
  const code = await readStorefrontIdsTemplate(addressMap);

  reportMissing("arguments", args.length, 1, `readStorefrontIds =>`);

  return executeScript({code, processed: true, ...props})
}