FROM nginx:latest

EXPOSE 80
EXPOSE 443

COPY ./custom-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/custom-entrypoint.sh

ENTRYPOINT [ "/usr/local/bin/custom-entrypoint.sh" ]
CMD [ "nginx", "-g", "daemon off;" ]