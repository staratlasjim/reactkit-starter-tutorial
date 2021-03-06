
# React Kit Starter project

Based on [Buildspace's Solana NFT CandyMachine mint tutorial](https://app.buildspace.so/projects/CO77556be5-25e9-49dd-a799-91a2fc29520e), but using ReactKit's
concepts of Dependency Injection, Inversion of Control, Observables and MVVM.

Those concepts are primarily used to implement [SOLID Design Principals](https://stackify.com/solid-design-principles/)

* Single Responsibility Principle
* Open/Closed Principle
* Liskov Substitution Principle
* Interface Segregation Principle
* Dependency Inversion

## Goal:

* To help developers grasp the concepts used in Portal and Engine Room faster.
* Help see the _why_ of using these principals
* Portal uses these principals in most of the app, but it isn't fully converted, there is a lot of left over code that doesn't fully utilze this style.

##Dependency Injection
* Uses [Tsyringe](https://github.com/microsoft/tsyringe) a Depedency Injection/IoC library developed by Microsoft, not the homemade one I developed for Portal
- [Video 1](https://capture.dropbox.com/K6alm5GMjKJ27OVx): Overview of Unit Testing the UI and mocking the on-chain calls 
- [Video 2](https://capture.dropbox.com/LDwgA8p6ox8duHHB): Overview of Unit Testing the UI and mocking the wallet adaptors
- [Video 3](https://capture.dropbox.com/ogOmfo8hG9xnOq8z): Overview of TSyringe and DI containers in general

## MVVM
MVVM is really trying to enforce Single Responsibility and Substitution Principles. 
Basically, the goal is to have our Core Business Logic is modeled in the Model Layer; so items like
NFTs, Faction Fleets, Mining stations, Crafting Recipes, etc, etc, all have their primary code represented in
Model objects. Then our View (UI) layer works with ViewModels to get the specific data and implement the screen specific
logic. This ensures that each layer has a single responsibility:

Responsibilities:
- UI: Style and Layout only
- ModelView: UI logic related to business logic lives here; validation, conversion, and other such UI logic goes here.
- Model: The core business objects that define our Domain (NFTs, FactionFleets, etc, etc)

Videos:
- [Video 1](https://capture.dropbox.com/IpZFHpyfB1pUx6d7): Overview of WalletConnectView, WalletViewModel and WalletModel

### Tutorial Todo:
* more MVVM
* Add Stiches (https://stitches.dev/)
* Add Mobx-react-lite
* Add Jest
* Add Solana WalletConnectView Adaptors