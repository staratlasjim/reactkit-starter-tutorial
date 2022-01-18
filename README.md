
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
* Uses Tsyringe(https://github.com/microsoft/tsyringe) and not the homemade one I developed for Portal
- [Video 1](https://capture.dropbox.com/K6alm5GMjKJ27OVx) 
- [Video 2](https://capture.dropbox.com/LDwgA8p6ox8duHHB)

Todo:
* Add Stiches (https://stitches.dev/)
* Add Mobx-react-lite
* Add Jest
* Add Solana WalletConnectView Adaptors