FROM node:20-alpine as builder

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

# Copy application files
COPY . ./

# Build Angular application
RUN yarn build --configuration production

# Use a lightweight image for serving the Angular app
FROM nginx:alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app to Nginx html directory
COPY --from=builder /usr/src/app/dist/app-mascotas-frontend/browser /usr/share/nginx/html

# Ensure a site logo is in the correct location (use existing icon if logo.svg missing)
COPY --from=builder /usr/src/app/public/assets/icons/icon_patita.png /usr/share/nginx/html/logo.png

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]