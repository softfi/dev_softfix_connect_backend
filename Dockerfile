FROM node:22.4.1

WORKDIR /usr/src/vinbullTrading

COPY package*.json ./

# Install dependencies
RUN if [ "$NODE_ENV" = "production" ]; then \
        npm install --only=production; \
    else \
        npm install; \
    fi

# Ensure schema.prisma is copied into the container
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy application source code
COPY . .

EXPOSE 5000

ENV PORT=5000
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

CMD if [ "$NODE_ENV" = "production" ]; then \
        npm run build && npm start; \
    else \
        npm run dev; \
    fi
