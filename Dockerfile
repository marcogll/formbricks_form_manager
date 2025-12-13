# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm install --only=production

# Bundle app source
COPY . .

# Your app binds to port 3011
EXPOSE 3011

# Define the command to run your app
CMD ["node", "src/server.js"]
