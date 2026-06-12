# Use an official Node.js runtime as a parent image.
# Using alpine for a smaller image size.
FROM node:18-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the working directory.
# The wildcard `package*.json` copies both files.
COPY package*.json ./

# Install dependencies based on the package.json files.
# This is the crucial step that installs all required packages, including @sendgrid/mail and nodemailer.
# By copying package.json first and running install, Docker can cache this layer.
# The layer will only be re-built if package.json or package-lock.json changes.
RUN npm install

# Copy the rest of your application's source code.
COPY . .

# The application listens on port 4000, so we expose it.
EXPOSE 4000

# Define the command to run the application.
CMD ["npm", "start"]