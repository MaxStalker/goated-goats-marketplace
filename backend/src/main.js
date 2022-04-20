import { setEnvironment, query, mutate, deployContract } from "flow-cadut";
import dotenv from "dotenv";
import alice from "../keys/alice.json";
import bob from "../keys/bob.json";

dotenv.config();

const getBalance = async (address) => {
  return query({
    code: `
    import FungibleToken from 0x1
    import FlowToken from 0x2
    
		pub fun main(address: Address): UFix64 {
			let account = getAccount(address)
			let vault = account.getCapability(/public/flowTokenBalance)
			  .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
			  ?? panic("Could not borrow Balance reference")
			  
      return vault.balance
		}
	`,
    args: [address],
  });
};

const printBalances = async () => {
  const [aliceBalance] = await getBalance(alice.address);
  const [bobBalance] = await getBalance(bob.address);
  console.log(`Alice (${alice.address}) Balance: ${aliceBalance} FLOW`);
  console.log(`Bob (${bob.address}) Balance: ${bobBalance} FLOW`);
};

const makeSigner = (person) => {
  const { pkey, address } = person;
  const keyId = 0;
  return {
    privateKey: pkey,
    address,
    keyId,
  };
};

const transferFlow = async (from, to, amount) => {
  // Prepare
  const payer = makeSigner(from);
  const code = `
      import FungibleToken from 0x1
      import FlowToken from 0x2
      
      transaction(to: Address, amount: UFix64){
        let tempVault: @FungibleToken.Vault
        
        prepare(signer: AuthAccount){
          let vault = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow reference to the owner's Vault")
          self.tempVault <- vault.withdraw(amount: amount)  
        }
        
        execute{
          let recipient = getAccount(to)
          
          let receiverVault = recipient.getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow receiver reference to transfer")
            
          receiverVault.deposit(from: <- self.tempVault)
        }
      }
    `;
  const args = [to.address, amount];

  // Send
  const [txResult, txErr] = await mutate({ code, payer, args });

  // Print Result
  if (!txErr) {
    console.log(txResult);
  } else {
    console.error(txErr);
  }
};

const deployNFTContract = (update) => {
  if(!update){
    const code = `
      pub contract Freebe
    `
  }
}

(async () => {
  await setEnvironment("testnet");
  // await transferFlow(alice, bob, 1.337);
  await printBalances();
})();
