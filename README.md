# Goated Goats Marketplace
## Data Flow
Below you can find basic Marketplace data flow:
```mermaid
sequenceDiagram
    participant Client
    participant Marketplace
    participant Blockchain
    
    Client ->> Marketplace: Request list of available listings
    Marketplace -->> Client: Return requested list
    
    loop Listing Loop
        Marketplace ->> Blockchain: Get events in block range
        Blockchain -->> Marketplace: Return list of events
        Marketplace ->> Marketplace: Process events
    end
```
To simplify the process we will not use real-time updates via websockets. In order to see changes in a list user will need to refresh the page.

## Front End
🚧 Under construction 🚧

## Back End
🚧 Under construction 🚧

