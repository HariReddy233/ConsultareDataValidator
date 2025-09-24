# Consultare Data Validation System

A comprehensive full-stack application for validating business data using React, Node.js, and PostgreSQL.

## 🚀 Features

### Backend (Node.js + PostgreSQL)
- **CRUD APIs** for Business Partner Master Instructions
- **Validation Engine** with configurable business rules
- **Excel Processing** with comprehensive field validation
- **Sample File Generation** for each data category
- **PostgreSQL Integration** with proper error handling

### Frontend (React + TypeScript + Tailwind)
- **Modern UI** with Tailwind CSS and shadcn/ui components
- **Sidebar Navigation** with multiple data categories
- **Drag & Drop File Upload** for Excel files
- **Real-time Validation** with progress indicators
- **Detailed Results Table** with pagination
- **Field Instructions** with validation rules
- **Sample File Download** functionality

## 📋 Data Categories

1. **Business Partner Master Data**
   - Customer/Supplier information validation
   - Address and contact validation
   - Tax information validation

2. **Item Master Data**
   - Product information validation
   - Pricing and UOM validation
   - Inventory management validation

3. **Financial Data**
   - Accounting data validation
   - Financial reporting validation

4. **Setup Data**
   - Configuration data validation
   - Master data setup validation

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **pg** for database connectivity
- **CORS** enabled for frontend integration

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Radix UI** for accessible components
- **XLSX** for Excel file processing
- **React Dropzone** for file uploads

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file with your database credentials:
   ```env
   DB_USER=admin
   DB_HOST=45.33.94.229
   DB_NAME=sapb1validator
   DB_PASSWORD=Chung@2024
   DB_PORT=5432
   PORT=3000
   ```

3. **Start Backend Server**
   ```bash
   node index.js
   ```

### Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Open Browser**
   Navigate to `http://localhost:3000`

## 📊 API Endpoints

### Core APIs
- `GET /health` - Health check
- `GET /sap_bp_master_instructions` - Get all instructions
- `POST /sap_bp_master_instructions` - Create instruction
- `PUT /sap_bp_master_instructions/:id` - Update instruction
- `DELETE /sap_bp_master_instructions/:id` - Delete instruction

### Validation APIs
- `GET /instructions/:category` - Get validation rules for category
- `POST /validate/:category` - Validate uploaded data
- `GET /download-sample/:category` - Download sample Excel file

## 🔧 Validation Rules

The system validates data based on configurable rules:

- **Mandatory Fields** - Required fields cannot be empty
- **Field Length** - Maximum character limits
- **Data Types** - String, Integer, Date validation
- **Valid Values** - Allowed values for specific fields
- **Related Tables** - Cross-reference validation

## 📁 Project Structure

```
consultare_data_validator/
├── index.js                 # Backend server
├── package.json            # Backend dependencies
├── .env                    # Environment variables
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── lib/            # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
└── README.md               # This file
```

## 🎯 Usage

1. **Select Data Category** from the sidebar
2. **Upload Excel File** using drag & drop or file browser
3. **Download Sample File** to see the expected format
4. **Start Validation** to process your data
5. **Review Results** in the detailed validation table
6. **View Field Instructions** to understand validation rules

## 🔍 Validation Features

- **Real-time Processing** with progress indicators
- **Row-by-row Validation** with detailed error messages
- **Summary Statistics** showing valid, warning, and error counts
- **Pagination** for large datasets
- **Export Capabilities** for validation results

## 🎨 UI Components

- **Responsive Design** works on all screen sizes
- **Dark/Light Theme** support
- **Accessible Components** with proper ARIA labels
- **Loading States** and error handling
- **Interactive Elements** with hover and focus states

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Deploy to your preferred hosting platform
4. Ensure database connectivity

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy the `build` folder to your hosting platform
3. Update API URLs for production environment

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.