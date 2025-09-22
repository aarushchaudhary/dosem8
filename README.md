# DoseM8

DoseM8 is a comprehensive health and medication management solution with two main components: a patient-facing application and a pharmacy portal.

## Description

This application is designed to help patients manage their medications, receive reminders, and access health tips. The pharmacy portal allows pharmacies to manage their dashboard, handle consultations, and stay updated with regulations. The project uses a MERN stack (MongoDB, Express.js, React.js, Node.js) and integrates with the Google Generative AI for an enhanced user experience.

## Features ✨

### Patient App

  * **Medication Management**: Add, update, and delete medications.
  * **Reminders**: Get reminders for medication intake.
  * **Health Tips**: Access a curated list of health tips.
  * **AI Consultation**: Ask health-related questions to an AI assistant.
  * **Premium Features**: Premium users get access to enhanced AI and personalized health reports.

### Pharmacy Portal

  * **Dashboard**: View key metrics and information.
  * **AI Regulatory Assistant**: Ask questions about Indian pharmacy regulations.
  * **Drug Interaction Checker**: Check for potential interactions between drugs.
  * **Advertisements**: Create and manage advertisement campaigns.
  * **Consultations**: Manage patient consultation requests.

## Technologies Used 💻

  * **Backend**: Node.js, Express.js
  * **Database**: MongoDB with Mongoose
  * **Authentication**: JSON Web Tokens (JWT)
  * **AI**: Google Generative AI (Gemini)
  * **Frontend**: HTML, CSS, JavaScript

## Installation ⚙️

1.  Clone the repository:
    ```bash
    git clone https://github.com/aarushchaudhary/dosem8.git
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory and add the following environment variables:
    ```
    MONGO_URI=<your_mongodb_uri>
    JWT_SECRET=<your_jwt_secret>
    GEMINI_API_KEY=<your_gemini_api_key>
    ```
4.  Start the server:
    ```bash
    npm start
    ```

## Usage 🚀

Once the server is running, you can access the application by navigating to `http://localhost:3000` in your web browser. From the splash page, you can choose to enter either the Patient App or the Pharmacy Portal.

## API Endpoints ↔️

The application exposes a set of RESTful API endpoints for various functionalities. Here are some of the main ones:

  * `POST /api/auth/register`: Register a new pharmacy.
  * `POST /api/auth/login`: Log in a pharmacy.
  * `GET /api/dashboard`: Get dashboard data for the logged-in pharmacy.
  * `POST /api/ai/ask`: Submit a question to the AI assistant.
  * `POST /api/ai/check-interactions`: Check for drug interactions.

## Project Structure 📂

The project is structured in a modular way to separate concerns and make it easy to maintain and scale.

```
dosem8-portal/
├── config/
│   └── database.js
├── controllers/
│   ├── advertisementController.js
│   ├── aiController.js
│   ├── authController.js
│   ├── ...
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── Advertisement.js
│   ├── Consultation.js
│   ├── ...
├── public/
│   ├── app/  (Patient App Frontend)
│   ├── css/  (Pharmacy Portal Frontend)
│   ├── js/   (Pharmacy Portal Frontend)
│   └── ...
├── routes/
│   ├── advertisementRoutes.js
│   ├── aiRoutes.js
│   ├── ...
├── services/
│   └── aiService.js
├── .env
├── .gitignore
├── index.js
└── package.json
```

## Contributing 🤝

Contributions are welcome\! Please feel free to submit a pull request or open an issue if you find a bug or have a feature request.

## License 📜

This project is licensed under the MIT License.