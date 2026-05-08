package config

import (
	"os"
	"strconv"
	"time"
)

type AppEnv string

type AppConfig struct {
	Port string
}

type DBConfig struct {
	DSN             string
	MaxConns        int32
	MinConns        int32
	MaxConnLifetime time.Duration
	MaxConnIdleTime time.Duration
}

type JWTConfig struct {
	AccesSecret   string
	AccessTTL     time.Duration
	RefreshSecret string
	RefreshTTL    time.Duration
	Issuer        string
	CookieDomain  string
	CookieSecure  bool
}

type Config struct {
	App  AppConfig
	DB   DBConfig
	Auth AuthConfig
	JWT  JWTConfig
}

type AuthConfig struct {
	BcryptCost int
}

func LoadConfig() *Config {

	return &Config{
		App: AppConfig{
			Port: ":8080",
		},
		DB: DBConfig{
			DSN:             os.Getenv("DB_DSN"),
			MaxConns:        getEnvToInt32("MAX_CONNS", 20),
			MinConns:        getEnvToInt32("MIN_CONNS", 5),
			MaxConnLifetime: time.Duration(getEnvToInt32("MAX_CONN_LIFETIME", 30)) * time.Minute,
			MaxConnIdleTime: time.Duration(getEnvToInt32("MAX_CONN_IDLE_TIME", 5)) * time.Minute,
		},
		Auth: AuthConfig{
			BcryptCost: getEnvToInt("BCRYPT_COST", 12),
		},
		JWT: JWTConfig{
			AccesSecret:   os.Getenv("JWT_ACCESS_SECRET"),
			AccessTTL:     time.Duration(getEnvToInt32("JWT_ACCESS_TTL", 15)) * time.Minute,
			RefreshSecret: os.Getenv("JWT_REFRESH_SECRET"),
			RefreshTTL:    time.Duration(getEnvToInt32("JWT_REFRESH_TTL", 7*24*60)) * time.Minute,
			Issuer:        os.Getenv("JWT_ISSUER"),
			CookieDomain:  os.Getenv("JWT_COOKIE_DOMAIN"),
			CookieSecure:  getEnvToBool("JWT_COOKIE_SECURE", false),
		},
	}
}

func getEnvToInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return defaultValue
	}
	return value
}

func getEnvToInt32(key string, defaultValue int32) int32 {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return defaultValue
	}
	return int32(value)
}

func getEnvToBool(key string, defaultValue bool) bool {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		if b, err := strconv.ParseBool(v); err == nil {
			return b
		}
	}
	return defaultValue
}
