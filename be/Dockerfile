# Use the official Node.js 22 image as a base
FROM node:22.21.1

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Command to run the application
CMD ["npm", "start"]