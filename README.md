# weiward-staked-rewards-pool

## Prerequisites

1. Install npm and pnpm, preferably using nvm or nvm-windows.

	```bash
	nvm install 12.19.0
	nvm use 12.19.0
	npm i -g pnpm
	# Check installation
	node --version
	npm --version
	pnpm --version
	```

## Build

```bash
# Install dependencies
pnpm install
# Lint
npm run lint
# Compile contracts
npm run compile
# Generate TypeScript contract interfaces from ABI's
npm run gen-types
# Deploy to buidlerevm
npm run deploy
```
