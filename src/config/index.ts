interface EnvironmentConfig {
  DB_URL: string;
  PORT: number;
}

const config: Record<string, EnvironmentConfig> = {
  development: {
    DB_URL: process.env.DB_URL || "mongodb://localhost:27017/dev",
    PORT: 3000
  },
  test: {
    DB_URL: process.env.DB_URL || "mongodb://localhost:27017/test",
    PORT: 3001
  },
  production: {
    DB_URL: process.env.DB_URL!,
    PORT: Number(process.env.PORT) || 3000
  }
};

export default config[process.env.NODE_ENV || 'development']; 