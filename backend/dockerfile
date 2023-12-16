# Use an official Node runtime as a parent image
FROM node:20-alpine3.18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Expose the port that your app will run on
EXPOSE 8000

# Specify the command to run on container start
CMD ["npm", "start"]
