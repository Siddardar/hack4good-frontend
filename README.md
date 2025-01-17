**MWH SmartMart**

## Overview
The MWH SmartMart is a web-based platform designed to streamline administrative tasks while empowering the boys aged 10–19 at Muhammadiyah Welfare Home (MWH). 

This is designed to:

- Motivate the boys to make responsible decisions through a voucher-based reward system.
- Minimize the time and effort administrators spend on repetitive tasks.
- Offer intuitive tools for reporting and analysis to focus on impactful data.

---

## Features  

### 1. Intuitive Minimart
- **For Residents**:  
  - Clean, easy-to-navigate interface tailored for ages 10–19.  
  - Simple cart management for making rational spending choices.  
- **For Admins**:  
  - Efficient backend for seamless inventory management.

### 2. Robust Voucher System 
- **For Residents**:  
  - Earn vouchers through positive contributions.  
  - Use vouchers to request essential products, fostering responsibility and decision-making skills.  
- **For Admins**:  
  - Streamlines voucher tracking and eliminates manual administrative work.

### 3. Automated Report Generation
- Delivers actionable insights for administrators.
- Monitors inventory trends and product requests within any selected date range.
- Previously used date ranges are saved and appear at the top for quick access when used again.
- Option to export data to Excel for seamless reporting and analysis.

---

## How it works

### For Residents
- Shop at the Store: The residents may use the vouchers earned to request products from the store which allows them to 
  - search for a product, 
  - view their voucher balance
  - add a product to cart, or 
  - preorder a product (if the product is out of stock)
  - checkout items from the cart
- Review and manage the Cart: To simulate and assist the residents in making informed financial decisions, they can choose to
  - change the quantity of the product in cart, or
  - remove a product from cart

### For Administrators
- Resident management: The administrators can
  - add a resident account (with a default password)
  - remove a resident account
  - suspend a resident account
  - view details of a resident account
  - reset password for a resident account
- Staff management: The administrators can
  - add an adminstrator account (with a default password)
  - remove an administrator account
  - reset password for an administrator account
- Voucher task management: The administrators may allocate vouchers easily through the admin dashboard, they can 
  - approve a voucher task,
  - reject a voucher task, or
  - change a decision that has been made previously
- Handle product requests: Administrators can review and update statues of product requests, they can
  - approve a request
  - reject a request
  - change the shipping status of the request
  - mark a request as complete
- Generate Reports: Access and analyze automated reports for better decision-making.

---

## Technical Details
### Tech Stack
- Frontend: React.js with Next.js for a responsive and interactive user interface.
- Backend: Node.js with Express.js for API management and secure data handling.
- Database: MongoDB for robust data storage and retrieval.

### Security Features
- Role-based access control for secure admin and user interactions.
- Non-admin users that try to access the admin page will be redirected via middleware. 

---

## What's Next for MWH SmartMart?
1. Allow residents to submit product requests for products that are not yet available in store.
2. Allow residents to add multiple quantities from the store page.
3. Allow admins to generate a wider variety of reports depending on their needs.
4. Adding an auction system where residents can bid on items using vouchers.

---

## Acknowledgements
This project is dedicated to the Muhammadiyah Welfare Home and its mission to nurture and empower young lives. It will be submitted to NUS DSC's Hack For Good 2025 hackathon.

---

## Getting Started 

### Prerequisites
- Node.js: Version 18.18.0 or later is required.  
  Install it [here](https://nodejs.org/).  
- npm: Ensure you have npm installed with Node.js.

### Installation
1. Clone the repository:  
   ```bash
   git clone https://github.com/your-username/hack4good-frontend.git
   ```
2. Install dependencies:  
   ```bash
   npm install
   ```

### Running the Development Server
Start the application locally:  
```bash
npm run dev
```  
The application will run on `http://localhost:3000`.

---


## Project Structure
```plaintext
.
├── public/              # Static files
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Application pages
│   ├── styles/          # CSS files
│   └── utils/           # Helper functions
├── package.json         # Project dependencies
└── README.md            # Project documentation
```

---

## Contributing
We welcome contributions! To contribute:  
1. Fork the repository.  
2. Create a new branch:  
   ```bash
   git checkout -b feature/your-feature-name
   ```  
3. Commit your changes:  
   ```bash
   git commit -m "Add your feature description"
   ```  
4. Push to your branch:  
   ```bash
   git push origin feature/your-feature-name
   ```  
5. Open a pull request.

---

## License
This project is licensed under the [MIT License](LICENSE).

---

## Contact
For any questions or feedback, feel free to reach out:  
- GitHub: [hack4good](https://github.com/Siddardar/hack4good-frontend)

---
