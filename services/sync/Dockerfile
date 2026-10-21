FROM node:22-alpine
WORKDIR /srv/sync
COPY server.ts ./
ENV LECTIO_SYNC_HOST=127.0.0.1
ENV LECTIO_SYNC_PORT=3010
EXPOSE 3010
CMD ["node", "--experimental-strip-types", "server.ts"]
