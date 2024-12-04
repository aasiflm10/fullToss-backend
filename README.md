# Shop.io

Shop.io is a feature-rich e-commerce application developed as part of the FullToss Winter Internship assignment. The platform combines robust backend technologies with a modern and responsive frontend, delivering an intuitive shopping experience. 

Frontend Repository : https://github.com/aasiflm10/fullToss-frontend.git
Frontend Deployed at : [full-toss-frontend.vercel.app](https://full-toss-frontend.vercel.app/)
Backend Deployed at : https://fulltoss-backend.onrender.com/
Submitted by : Aasif Ali (aa6125405@gmail.com)
## Features

1. **Authentication**  
   - Sign up and sign in with secure JWT-based authentication.

2. **Product Catalog**  
   - Displays all available products with their details.

3. **Shopping Cart**  
   - Add products to your cart for a seamless shopping experience.

4. **Theming**  
   - Tailored theming based on the selected IPL team, powered by Tailwind CSS.

5. **Responsive Design**  
   - Fully responsive UI optimized for both mobile and desktop devices.

---

## Tech Stack

### Backend  
- **Framework**: Node.js with Express  
- **Language**: TypeScript  
- **Database**: PostgreSQL  
- **ORM**: Prisma  

### Frontend  
- **Framework**: Next.js  
- **Language**: TypeScript  
- **Library**: React.js  
- **Styling**: Tailwind CSS  

---

## Installation and Setup

### Prerequisites
- Node.js and npm installed
- PostgreSQL database set up
- Environment variables configured in `.env` ( See Step 3 for reference )

### Backend Setup
1. Clone the repository and navigate to the `backend` directory:  
   ```bash
   git clone https://github.com/aasiflm10/fullToss-backend.git
   cd fullToss-backend

2. Install Dependencies : 
   ```bash
   npm install

3. Set up .env file. See .env.example for reference.
   - Add the Databse URL in the .env file :
     ```bash
        DATABASE_URL="Here_goes_your_postgreSQL Database URL"
   - Use aiven.io or neon.tech for free PostgreSQL Database URL.

4. Generate Prisma Client:  
   ```bash
   npx prisma generate

5. Migrate the Database schema to your cloud database
   ```bash
   npx prisma migrate dev --name init

6. Run your backend : 
   ```bash
   npm run dev


Backend is now running at port 3000. http://localhost:3000



## Public Routes

- GET / :
Root endpoint to check if the backend is running.

- POST /api/v1/register : 
User registration with name, email, password, and IPL team assignment.

- POST /api/v1/login :
User login with email and password.


## Protected Routes (require userMiddleware authentication)

- POST /api/v1/products :
Add a new product to the catalog.

- GET /api/v1/products :
Retrieve all products.

- POST /api/v1/cart :
Add a product to the user's cart or update its quantity if it already exists.

- GET /api/v1/cart :
Retrieve all items in the user's cart with product details.


