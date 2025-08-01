# Regulatory Compliance Engine

This project is a desktop application built using Electron, React, and FastAPI. It serves as a platform for automated regulatory compliance testing of online games.

## Project Structure

- **electron/**: Contains the Electron application files.
  - **main.cjs**: Main entry point for the Electron application.
  - **preload.js**: Exposes APIs to the renderer process.
  - **renderer/**: Contains the user interface files.
    - **index.html**: HTML file that loads the React application.
    - **assets/**: Contains application assets like icons.
  
- **backend/**: Contains the FastAPI backend application.
  - **app.py**: FastAPI application setup with routes and middleware.
  - **config.py**: Application settings including server and CORS configuration.
  - **requirements.txt**: Python dependencies for the backend.
  - **.env.example**: Example environment variables for the backend.

- **frontend/**: Contains the React frontend application.
  - **src/**: Source files for the React application.
    - **App.jsx**: Main React component.
    - **main.jsx**: Entry point for the React application.
    - **components/**: Contains reusable components.
    - **hooks/**: Custom hooks for managing state and logic.
    - **services/**: API request functions.
    - **constants/**: Configuration constants.
  - **public/**: Public assets for the frontend.
  - **package.json**: Configuration for the frontend application.
  - **vite.config.js**: Build configuration for Vite.
  - **index.html**: Main HTML file for the frontend.
  - **eslint.config.js**: ESLint configuration for linting the frontend code.
  - **.env**: Environment variables for the frontend.

- **package.json**: Main configuration file for the entire project.
- **electron-builder.json**: Configuration settings for building the Electron application.
- **run-unified.bat** / **run-unified.ps1**: Cross-platform scripts for building and running the application.

## Getting Started

1. **Install Dependencies**:
   - Navigate to the `electron` directory and install Electron and other necessary dependencies.
   - Navigate to the `backend` directory and install Python dependencies listed in `requirements.txt`.
   - Navigate to the `frontend` directory and install JavaScript dependencies listed in `package.json`.

2. **Run the Backend**:
   - Start the FastAPI backend by running `uvicorn app:app --reload` from the `backend` directory.

3. **Run the Electron Application**:
   - Use the scripts in the `scripts` directory to run the Electron application in development mode or build it for production.

4. **Testing**:
   - Ensure that the frontend and backend communicate correctly within the Electron environment.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.