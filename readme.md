# Venyora

Venyora is a full-stack e-commerce web application built with a modern tech stack. It provides a seamless shopping experience for users, allowing them to browse products, add items to their cart, and checkout. The project features a separate frontend and backend, with a RESTful API for communication.

---

## Live Link

You can view the live application here: [https://venyoraa.netlify.app/](https://venyoraa.netlify.app/)

---

## Features

- **User Authentication:** Users can sign up, log in, and log out. Passwords are encrypted using **bcryptjs** for security. JSON Web Tokens (JWT) are used for session management.
- **Product Catalog:** Products are fetched from the database and displayed on the catalogue page. Users can view individual product details.
- **Shopping Cart:** Authenticated users have a persistent shopping cart. Guest users can also add items to a temporary cart stored in local storage.
- **Contact Form:** A functional contact form that saves messages to the database.
- **Responsive Design:** The frontend is designed to be responsive and work on various screen sizes.

---

## Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript (ES6+)
- [Remixicon](https://remixicon.com/)
- [ScrollReveal](https://scrollrevealjs.org/)

### Backend

- **Node.js:** A JavaScript runtime for the server.
- **Express:** A web application framework for Node.js.
- **MongoDB:** A NoSQL database for storing application data.
- **Mongoose:** An object data modeling (ODM) library for MongoDB and Node.js.
- **jsonwebtoken (JWT):** For creating access tokens for authentication.
- **bcryptjs:** For hashing passwords.
- **cors:** For enabling Cross-Origin Resource Sharing.
- **dotenv:** For managing environment variables.

---

## Setup and Installation

To get a local copy up and running follow these simple steps.

### Prerequisites

- Node.js installed on your machine.
- A MongoDB Atlas account or a local MongoDB instance.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/your-username/Venyora-Ecommerce.git](https://github.com/your-username/Venyora-Ecommerce.git)
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd venyora-ecommerce
    ```

3.  **Install NPM packages:**

    ```bash
    npm install
    ```

4.  **Set up environment variables:**

    Create a `.env` file in the root directory and add the following:

    ```
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=process.env.JWT_SECRET
    ```

5.  **Run the server:**

    ```bash
    node server.js
    ```

6.  **Open the Frontend:**

    Open the `index.html` file in the `Frontend` directory in your browser.

---

## API Endpoints

The following are the API endpoints available in the application:

### Authentication Routes (`/api/auth`)

- `POST /register`: Register a new user.
- `POST /login`: Login a user and get a JWT token.
- `GET /user`: Get the currently logged-in user's data (requires token).

### Product Routes (`/api/products`)

- `GET /`: Get all products.
- `GET /:id`: Get a single product by its ID.

### Cart Routes (`/api/cart`)

- `POST /`: Add an item to the cart or update the quantity (requires token).

### Message Routes (`/api/messages`)

- `POST /`: Save a new message from the contact form.

```

```
