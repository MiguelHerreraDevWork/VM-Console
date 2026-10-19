if (!process.env.DATABASE_URL_TEST) {
  throw new Error('DATABASE_URL_TEST is required for API tests');
}

// Isolate tests from development data.
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
process.env.LOG_LEVEL = 'error';
