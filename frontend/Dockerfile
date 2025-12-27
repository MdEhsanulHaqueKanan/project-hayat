# 1. Base Image: Use lightweight Node.js
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package definitions first (for better caching)
COPY package.json package-lock.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the source code
COPY . .

# 6. Expose the port (Vite default is 5173, but we set it to 3000 in config)
EXPOSE 3000

# 7. Start the development server
CMD ["npm", "run", "dev", "--", "--host"]