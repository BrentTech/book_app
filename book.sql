DROP TABLE saved_book_table;

CREATE TABLE IF NOT EXISTS saved_book_table (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  isbn VARCHAR(255),
  image_url VARCHAR(255),
  description VARCHAR(2000),
  bookshelf VARCHAR(255)
);
