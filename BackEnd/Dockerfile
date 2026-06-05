FROM golang:1.26.1-alpine AS builder

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -trimpath -ldflags="-s -w" -o /out/auction-api ./cmd

FROM alpine:3.22

RUN addgroup -S app \
    && adduser -S -G app app

WORKDIR /app/BackEnd

COPY --from=builder /out/auction-api /usr/local/bin/auction-api

RUN mkdir -p /app/logs /app/uploads \
    && chown -R app:app /app

USER app

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/auction-api"]
