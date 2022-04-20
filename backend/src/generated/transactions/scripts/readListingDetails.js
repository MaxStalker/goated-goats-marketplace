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

// This script returns the details for a listing within a storefront

pub fun main(account: Address, listingResourceID: UInt64): NFTStorefront.ListingDetails {
    let storefrontRef = getAccount(account)
        .getCapability<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(
            NFTStorefront.StorefrontPublicPath
        )
        .borrow()
        ?? panic("Could not borrow public storefront from address")

    let listing = storefrontRef.borrowListing(listingResourceID: listingResourceID)
        ?? panic("No item with that ID")
    
    return listing.getDetails()
}

`;

/**
* Method to generate cadence code for readListingDetails script
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const readListingDetailsTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `readListingDetails =>`)

  return replaceImportAddresses(CODE, fullMap);
};

export const readListingDetails = async (props = {}) => {
  const { addressMap = {}, args = [] } = props
  const code = await readListingDetailsTemplate(addressMap);

  reportMissing("arguments", args.length, 2, `readListingDetails =>`);

  return executeScript({code, processed: true, ...props})
}