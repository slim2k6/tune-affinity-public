# Tune Affinity

Welcome to the official GitHub repository for **Tune Affinity**! At its core, Tune Affinity is an application that enables friends to discover mutual artists and tracks in their Spotify playlists.

## 🎵 Features

- Discover common artists and tracks with friends.
- Analyze shared tastes in music for deeper social connections.
- Seamless integration with Spotify accounts for accurate playlist comparison.

## 🛠 Technology Stack

- **Frontend:** React
- **Backend:** 
  - Node.js
  - AWS API Gateway REST
  - AWS Lambda
- **Integration:** Spotify API
- **Database:** AWS DynamoDB
- **Content Delivery:** AWS CloudFront
- **Infrastructure as Code:** AWS Cloud Development Kit (CDK)

## 📂 Repository Layout

The repository is organized under the `packages` directory, housing three main modules:

### `packages/backend`

- Houses the AWS Lambda functions.

### `packages/cdk`

- Contains the code that makes use of the AWS Cloud Development Kit (CDK) to provision necessary cloud resources and infrastructure.

### `packages/frontend`

- Contains the code for the React-based web application.

## 💡 Getting Started

1. Clone this repository.
2. Navigate to the respective module directory (e.g., `packages/backend` for backend setup).
3. Follow the README in each module directory for specific setup instructions.

## 🤖 Developers

- [slim2k6](https://github.com/slim2k6) - Maintainer and Creator

---

Happy discovering 🎧!
