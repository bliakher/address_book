# Installs Node.js image
FROM node:16.13.1-alpine3.14

# sets the working directory 
WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json", "tsconfig.json", ".env", "./"]

COPY ./src ./src

# Installs all packages
RUN npm install

# Runs the dev npm script to build & start the server
CMD npm run dev