This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app --typescript`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# Tutorials

Based on Buildspace's Solana NFT CandyMachine mint tutorial, but using ReactKit's
concepts of Dependency Injection, Inversion of Control, Observables and MVVM.

These are primarily used to implement [SOLID Design Principals](https://stackify.com/solid-design-principles/)

* Single Responsibility Principle
* Open/Closed Principle
* Liskov Substitution Principle
* Interface Segregation Principle
* Dependency Inversion

##Dependency Injection
* Uses Tsyringe(https://github.com/microsoft/tsyringe) and not the homemade one I developed for Portal
- [Video 1](https://capture.dropbox.com/K6alm5GMjKJ27OVx) 
- [Video 2](https://capture.dropbox.com/LDwgA8p6ox8duHHB)

Todo:
* Add Stiches (https://stitches.dev/)
* Add Mobx-react-lite
* Add Tsyringe
* Add Jest
* Add Solana WalletConnectView Adaptors