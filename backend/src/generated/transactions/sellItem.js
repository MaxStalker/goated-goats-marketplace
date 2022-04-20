/** pragma type transaction **/

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
  sendTransaction
} from 'flow-cadut'

export const CODE = `
import FungibleToken from "../contracts/FungibleToken.cdc"
import NonFungibleToken from "../contracts/NonFungibleToken.cdc"
import FlowToken from "../contracts/FlowToken.cdc"
import ExampleNFT from "../contracts/ExampleNFT.cdc"
import NFTStorefront from "../contracts/NFTStorefront.cdc"

transaction(saleItemID: UInt64, saleItemPrice: UFix64) {
    let flowReceiver: Capability<&FlowToken.Vault{FungibleToken.Receiver}>
    let exampleNFTProvider: Capability<&ExampleNFT.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>
    let storefront: &NFTStorefront.Storefront

    prepare(acct: AuthAccount) {
        // We need a provider capability, but one is not provided by default so we create one if needed.
        let exampleNFTCollectionProviderPrivatePath = /private/exampleNFTCollectionProviderForNFTStorefront

        self.flowReceiver = acct.getCapability<&FlowToken.Vault{FungibleToken.Receiver}>(/public/flowTokenReceiver)!
        assert(self.flowReceiver.borrow() != nil, message: "Missing or mis-typed FlowToken receiver")

        if !acct.getCapability<&ExampleNFT.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(exampleNFTCollectionProviderPrivatePath)!.check() {
            acct.link<&ExampleNFT.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(exampleNFTCollectionProviderPrivatePath, target: /storage/NFTCollection)
        }

        self.exampleNFTProvider = acct.getCapability<&ExampleNFT.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(exampleNFTCollectionProviderPrivatePath)!
        assert(self.exampleNFTProvider.borrow() != nil, message: "Missing or mis-typed ExampleNFT.Collection provider")

        self.storefront = acct.borrow<&NFTStorefront.Storefront>(from: NFTStorefront.StorefrontStoragePath)
            ?? panic("Missing or mis-typed NFTStorefront Storefront")
    }

    execute {
        let saleCut = NFTStorefront.SaleCut(
            receiver: self.flowReceiver,
            amount: saleItemPrice
        )
        self.storefront.createListing(
            nftProviderCapability: self.exampleNFTProvider,
            nftType: Type<@ExampleNFT.NFT>(),
            nftID: saleItemID,
            salePaymentVaultType: Type<@FlowToken.Vault>(),
            saleCuts: [saleCut]
        )
    }
}

`;

/**
* Method to generate cadence code for sellItem transaction
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const sellItemTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `sellItem =>`)

  return replaceImportAddresses(CODE, fullMap);
};


/**
* Sends sellItem transaction to the network
* @param {Object.<string, string>} props.addressMap - contract name as a key and address where it's deployed as value
* @param Array<*> props.args - list of arguments
* @param Array<*> props.signers - list of signers
*/
export const sellItem = async (props = {}) => {
  const { addressMap, args = [], signers = [] } = props;
  const code = await sellItemTemplate(addressMap);

  reportMissing("arguments", args.length, 2, `sellItem =>`);
  reportMissing("signers", signers.length, 1, `sellItem =>`);

  return sendTransaction({code, processed: true, ...props})
}