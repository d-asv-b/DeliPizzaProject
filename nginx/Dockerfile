FROM nginx:latest

COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
RUN rm /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443