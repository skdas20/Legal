# AI-Powered Web3 Legal Assistant

A comprehensive platform that combines AI and blockchain technology to provide legal document generation, smart contract review, DAO creation, and legal advice.

## Features

- **Document Generator**: Create legally binding documents with AI assistance
- **Contract Reviewer**: Analyze smart contracts for security vulnerabilities and best practices
- **DAO Creator**: Set up Decentralized Autonomous Organizations with customized governance parameters
- **Legal Chatbot**: Get expert legal advice on blockchain, smart contracts, and Web3 regulations

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Web3.js for blockchain interactions

### Backend
- Node.js with Express
- MongoDB for data storage
- Gemini API for AI capabilities
- JWT for authentication

## Prerequisites

- Node.js (v14+)
- MongoDB
- Gemini API key
- Infura API key (for Web3 provider)
- Pinata API key and secret (for IPFS storage)

## Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/web3-legal-assistant.git
cd web3-legal-assistant
```

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a config file:

```bash
cp config/config.env.example config/config.env
```

4. Update the config.env file with your API keys and credentials:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/legal-assistant
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
WEB3_PROVIDER_URL=https://sepolia.infura.io/v3/your_infura_key_here
PINATA_API_KEY=your_pinata_api_key_here
PINATA_API_SECRET=your_pinata_api_secret_here
```

5. Start the backend server:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd ../frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a .env file:

```bash
cp .env.example .env
```

4. Update the .env file with your API endpoint:

```
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start the frontend development server:

```bash
npm start
```

## API Keys and Services

### Gemini API
1. Go to https://ai.google.dev/
2. Sign up or log in to your Google account
3. Create a new API key
4. Add the key to your backend config.env file

### Infura (Web3 Provider)
1. Go to https://infura.io/
2. Sign up or log in
3. Create a new project
4. Get your project ID/API key
5. Add the key to your backend config.env file

### Pinata (IPFS Storage)
1. Go to https://pinata.cloud/
2. Sign up or log in
3. Navigate to API keys
4. Create a new API key with appropriate permissions
5. Add the key and secret to your backend config.env file

## Usage

1. Open your browser and navigate to http://localhost:3000
2. Register a new account or log in
3. Explore the different features:
   - Generate legal documents
   - Review smart contracts
   - Create DAOs
   - Chat with the legal assistant

## License

This project is licensed under the MIT License - see the LICENSE file for details. 